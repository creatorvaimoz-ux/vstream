const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const fs = require('fs');
const multer = require('multer');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { exec, spawn } = require('child_process');

// Load .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7678;

app.use(cors());
app.use(express.json());

// --- SETUP MULTER & DIREKTORI ---
const SECRETS_DIR = path.join(__dirname, 'api_secrets');
const MEDIA_DIR = path.join(__dirname, 'public/uploads');
const THUMB_DIR = path.join(__dirname, 'public/thumbnails');
const PLAYLIST_FILE = path.join(__dirname, 'playlists.json');
const TASKS_FILE = path.join(__dirname, 'tasks.json');
const LOG_FILE = path.join(__dirname, 'ffmpeg_stream.log');

[SECRETS_DIR, MEDIA_DIR, THUMB_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(PLAYLIST_FILE)) fs.writeFileSync(PLAYLIST_FILE, JSON.stringify([]));
if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '=== LOG AKTIVITAS FFMPEG ===\n');

// Storage Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, SECRETS_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, MEDIA_DIR),
    filename: (req, file, cb) => cb(null, file.originalname.replace(/\s+/g, '_'))
});
const uploadMedia = multer({ storage: mediaStorage });

const thumbStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, THUMB_DIR),
    filename: (req, file, cb) => cb(null, 'thumb_' + Date.now() + path.extname(file.originalname))
});
const uploadThumb = multer({ storage: thumbStorage });

// --- FUNGSI GOOGLE OAUTH ---
const CREDENTIALS_FILE = path.join(__dirname, 'google_credentials.json');
let cachedCredentials = null;
function getOAuth2Client() {
    let clientId, clientSecret;
    if (fs.existsSync(CREDENTIALS_FILE)) {
        const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE));
        clientId = data.clientId;
        clientSecret = data.clientSecret;
    }
    if (!clientId && process.env.GOOGLE_CLIENT_ID) {
        clientId = process.env.GOOGLE_CLIENT_ID;
        clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    }
    if (!clientId || !clientSecret) return null;
    return new google.auth.OAuth2(clientId, clientSecret, 'http://localhost');
}

// --- FUNGSI DOWNLOADER PINTAR (NATIVE NODE.JS) ---
function downloadGoogleDrive(fileId, destPath, callback) {
    const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    let globalCookies = {}; 
    
    function requestWithRedirects(reqUrl, isRetry) {
        const parsedUrl = new URL(reqUrl);
        const cookieString = Object.keys(globalCookies).map(k => `${k}=${globalCookies[k]}`).join('; ');

        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            }
        };
        if (cookieString) options.headers['Cookie'] = cookieString;

        https.get(options, (res) => {
            if (res.headers['set-cookie']) {
                res.headers['set-cookie'].forEach(c => {
                    const parts = c.split(';')[0].split('=');
                    if (parts.length >= 2) globalCookies[parts.shift().trim()] = parts.join('=').trim();
                });
            }

            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let nextUrl = res.headers.location;
                if (!nextUrl.startsWith('http')) nextUrl = `https://${parsedUrl.hostname}${nextUrl}`;
                requestWithRedirects(nextUrl, isRetry);
            } else if (res.statusCode === 200) {
                const contentType = res.headers['content-type'] || '';
                if (contentType.includes('text/html')) {
                    if (isRetry) return callback(new Error("Gagal Bypass GDrive: Google masih memblokir. Pastikan link Public."));
                    
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        const linkMatch = body.match(/href="([^"]*confirm=[^"]*)"/i) || body.match(/href='([^']*confirm=[^']*)'/i);
                        if (linkMatch && linkMatch[1]) {
                            let confirmUrl = linkMatch[1].replace(/&amp;/g, '&'); 
                            if (!confirmUrl.startsWith('http')) confirmUrl = `https://${parsedUrl.hostname}${confirmUrl.startsWith('/') ? '' : '/'}${confirmUrl}`;
                            return requestWithRedirects(confirmUrl, true);
                        }

                        let confirmToken = '';
                        const warningKey = Object.keys(globalCookies).find(k => k.startsWith('download_warning'));
                        if (warningKey) confirmToken = globalCookies[warningKey];

                        if (confirmToken) {
                            const sep = reqUrl.includes('?') ? '&' : '?';
                            return requestWithRedirects(`${reqUrl}${sep}confirm=${confirmToken}`, true);
                        }

                        const sep = reqUrl.includes('?') ? '&' : '?';
                        requestWithRedirects(`${reqUrl}${sep}confirm=t`, true);
                    });
                } else {
                    const fileStream = fs.createWriteStream(destPath);
                    res.pipe(fileStream);
                    fileStream.on('finish', () => { fileStream.close(); callback(null); });
                    fileStream.on('error', (err) => { fs.unlink(destPath, () => {}); callback(err); });
                }
            } else {
                callback(new Error(`Ditolak server dengan status HTTP: ${res.statusCode}`));
            }
        }).on('error', (err) => callback(err));
    }
    requestWithRedirects(initialUrl, false);
}

function downloadStandardUrl(urlStr, destPath, callback, redirectCount = 0) {
    if (redirectCount > 5) return callback(new Error('Terlalu banyak redirect. Link tidak valid.'));
    const client = urlStr.startsWith('https') ? https : http;
    client.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let newUrl = res.headers.location;
            if (!newUrl.startsWith('http')) {
                const parsed = new URL(urlStr);
                newUrl = `${parsed.protocol}//${parsed.host}${newUrl}`;
            }
            downloadStandardUrl(newUrl, destPath, callback, redirectCount + 1);
        } else if (res.statusCode === 200) {
            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); callback(null); });
            fileStream.on('error', (err) => { fs.unlink(destPath, () => {}); callback(err); });
        } else {
            callback(new Error(`Gagal mendownload, Status HTTP: ${res.statusCode}`));
        }
    }).on('error', (err) => callback(err));
}

// --- ENGINE FFMPEG (MEMULAI LIVE) ---
const activeStreams = new Map();

function startStreamInternal(task) {
    if (activeStreams.has(task.id)) return false; // Sudah jalan

    const fullVideoPath = path.join(MEDIA_DIR, task.videoPath);
    if (!fs.existsSync(fullVideoPath)) {
        fs.appendFileSync(LOG_FILE, `\n[SYSTEM ERROR] Gagal memulai ${task.taskName}: File video tidak ditemukan di server.\n`);
        return false;
    }

    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `\n[${timestamp}] [SYSTEM] Memulai proses Live untuk tugas: ${task.taskName}\n`);

    // Pastikan tidak ada spasi tersembunyi di stream key
    const cleanStreamKey = task.streamKey.trim();

    const ffmpegArgs = ['-re']; 
    if (task.videoMode === 'Satu Video (Looping)') ffmpegArgs.push('-stream_loop', '-1'); 
    
    ffmpegArgs.push(
        '-i', fullVideoPath,
        '-c:v', 'libx264', '-preset', 'veryfast', '-b:v', '3000k', '-maxrate', '3000k', '-bufsize', '6000k',
        '-pix_fmt', 'yuv420p', '-g', '60', 
        '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-f', 'flv',
        `rtmp://a.rtmp.youtube.com/live2/${cleanStreamKey}`
    );

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
    activeStreams.set(task.id, ffmpegProcess);

    // Tangkap log output dari FFmpeg
    ffmpegProcess.stderr.on('data', (data) => {
        fs.appendFileSync(LOG_FILE, data.toString());
    });

    // PENDETEKSI ERROR CRITICAL (Contoh: FFmpeg crash/tidak jalan)
    ffmpegProcess.on('error', (err) => {
        fs.appendFileSync(LOG_FILE, `\n[CRITICAL ERROR] Gagal mengeksekusi FFmpeg: ${err.message}. Pastikan FFmpeg sudah diinstal di VPS (sudo apt install ffmpeg).\n`);
        activeStreams.delete(task.id);
        
        try {
            let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
            let t = tasks.find(x => x.id === task.id);
            if (t) { t.status = 'Error'; fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2)); }
        } catch(e) {}
    });

    // Deteksi jika FFmpeg berhenti/crash di tengah jalan
    ffmpegProcess.on('close', (code) => {
        activeStreams.delete(task.id);
        fs.appendFileSync(LOG_FILE, `\n[${new Date().toISOString()}] [SYSTEM] FFmpeg Terhenti (Kode Keluar: ${code})\n`);
        
        try {
            let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
            let t = tasks.find(x => x.id === task.id);
            if (t) { t.status = 'Berhenti'; fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2)); }
        } catch(e) {}
    });

    return true;
}

// --- CRON JOB (PENJADWAL OTOMATIS) ---
// Cek database setiap 60 detik
setInterval(() => {
    try {
        const tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        let isModified = false;
        
        const now = new Date();
        const optionsDate = { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' };
        const optionsTime = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false };
        
        const formatter = new Intl.DateTimeFormat('en-CA', optionsDate);
        const parts = formatter.formatToParts(now);
        const currentDate = `${parts.find(p=>p.type==='year').value}-${parts.find(p=>p.type==='month').value}-${parts.find(p=>p.type==='day').value}`;
        const currentTime = new Intl.DateTimeFormat('en-GB', optionsTime).format(now); 

        tasks.forEach(task => {
            if (task.status === 'Terjadwal') {
                if (task.jadwalMode === 'sekali' || task.jadwalMode === 'manual') {
                    if (task.scheduleDate === currentDate && task.scheduleTime === currentTime) {
                        console.log(`[CRON] Waktunya mulai tugas: ${task.taskName}`);
                        if (startStreamInternal(task)) {
                            task.status = 'Live';
                            isModified = true;
                        }
                    }
                }
            }
        });

        if (isModified) fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    } catch (e) { console.log("[CRON ERROR] " + e.message); }
}, 60000); 

// --- API ROUTES ---

app.get('/api/status', (req, res) => res.json({ status: 'running', message: 'Backend VStream Aktif' }));

// BACA LOG FFMPEG UNTUK FRONTEND
app.get('/api/logs', (req, res) => {
    try {
        if (fs.existsSync(LOG_FILE)) {
            const logContent = fs.readFileSync(LOG_FILE, 'utf8');
            const logLines = logContent.split('\n').filter(line => line.trim() !== '').slice(-100); 
            res.json({ success: true, logs: logLines });
        } else {
            res.json({ success: true, logs: ['[SYSTEM] File log belum dibuat.'] });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// --- TASK (TUGAS LIVE) API ---
app.post('/api/tasks', (req, res) => {
    try {
        const tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        const newTask = {
            id: `task_${Date.now()}`,
            ...req.body,
            status: req.body.isMulaiSekarang ? 'Live' : 'Terjadwal',
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));

        if (newTask.status === 'Live') {
            startStreamInternal(newTask);
        }

        res.json({ success: true, message: 'Tugas Live berhasil disimpan & diproses!', task: newTask });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.get('/api/tasks', (req, res) => {
    try { res.json(JSON.parse(fs.readFileSync(TASKS_FILE))); } catch (e) { res.json([]); }
});

app.post('/api/stream/stop', (req, res) => {
    const { streamId } = req.body; 
    const process = activeStreams.get(streamId);
    
    try {
        let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        let t = tasks.find(x => x.id === streamId);
        if (t) { t.status = 'Berhenti'; fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2)); }
    } catch(e) {}

    if (process) {
        process.kill('SIGKILL');
        activeStreams.delete(streamId);
        res.json({ success: true, message: 'Streaming dihentikan.' });
    } else {
        res.json({ success: false, message: 'Stream tidak jalan, tapi status diupdate.' });
    }
});

app.delete('/api/tasks/:id', (req, res) => {
    try {
        let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        const process = activeStreams.get(req.params.id);
        if (process) { process.kill('SIGKILL'); activeStreams.delete(req.params.id); }
        tasks = tasks.filter(t => t.id !== req.params.id);
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// --- MEDIA & OTHERS ---
app.post('/api/thumbnails/upload', uploadThumb.single('thumbnail'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Gagal upload thumbnail' });
    res.json({ success: true, filename: req.file.filename, url: `/thumbnails/${req.file.filename}` });
});

app.use('/thumbnails', express.static(THUMB_DIR));

app.post('/api/media/upload', uploadMedia.array('files'), (req, res) => {
    res.json({ success: true, message: `${req.files ? req.files.length : 0} file berhasil diunggah.` });
});

app.get('/api/media', (req, res) => {
    try {
        const files = fs.readdirSync(MEDIA_DIR);
        res.json(files.map(f => ({ id: f, name: f, size: (fs.statSync(path.join(MEDIA_DIR, f)).size / (1024 * 1024)).toFixed(2) + ' MB' })));
    } catch (error) { res.json([]); }
});

app.delete('/api/media/:filename', (req, res) => {
    const filePath = path.join(MEDIA_DIR, req.params.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
});

app.post('/api/media/import-url', (req, res) => {
    let { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL tidak valid' });
    url = url.trim();
    let filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
    const gdriveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    
    if (!filename || filename.indexOf('.') === -1 || gdriveMatch) filename = `import_${Date.now()}.mp4`; 
    filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_'); 
    
    const dest = path.join(MEDIA_DIR, filename);
    const handleSuccess = (err) => {
        if (err) {
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (fs.existsSync(dest)) {
            if (fs.statSync(dest).size < 10 * 1024) { 
                fs.unlinkSync(dest); 
                return res.status(400).json({ success: false, message: 'Gagal: File terlalu kecil (Proteksi GDrive).' });
            }
            res.json({ success: true, message: `Berhasil! File video utuh tersimpan sebagai ${filename}` });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menyimpan file di server.' });
        }
    };
    if (gdriveMatch && gdriveMatch[1]) downloadGoogleDrive(gdriveMatch[1], dest, handleSuccess);
    else downloadStandardUrl(url, dest, handleSuccess);
});

app.get('/api/playlists', (req, res) => {
    try { res.json(JSON.parse(fs.readFileSync(PLAYLIST_FILE))); } catch (e) { res.json([]); }
});

app.post('/api/playlists', (req, res) => {
    try {
        const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
        playlists.push({ id: Date.now().toString(), name: req.body.name, videos: req.body.videos, count: req.body.videos.length });
        fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists, null, 2));
        res.json({ success: true, message: 'Playlist berhasil disimpan!' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete('/api/playlists/:id', (req, res) => {
    try {
        let playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
        fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists.filter(p => p.id !== req.params.id), null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/settings/google-credentials', (req, res) => {
    cachedCredentials = { clientId: req.body.clientId, clientSecret: req.body.clientSecret };
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(cachedCredentials, null, 2));
    res.json({ success: true, message: 'Kredensial disimpan!' });
});

app.get('/api/settings/accounts', (req, res) => {
    try {
        const files = fs.readdirSync(__dirname).filter(f => f.startsWith('token_') && f.endsWith('.json'));
        res.json(files.map(f => ({ id: f, name: f.replace('token_', '').replace('.json', '').replace(/_/g, ' ') })));
    } catch (error) { res.json([]); }
});

app.delete('/api/settings/account/:id', (req, res) => {
    const filePath = path.join(__dirname, req.params.id);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
});

app.get('/api/auth/url', (req, res) => {
    try {
        const oauth2Client = getOAuth2Client();
        if (!oauth2Client) return res.status(400).json({ error: 'Kredensial belum diatur.' });
        res.json({ url: oauth2Client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.force-ssl'] }) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/save', async (req, res) => {
    try {
        const oauth2Client = getOAuth2Client();
        const code = new URL(req.body.authUrl).searchParams.get('code');
        const { tokens } = await oauth2Client.getToken(code);
        fs.writeFileSync(path.join(__dirname, `token_${req.body.accountName.replace(/\s+/g, '_')}.json`), JSON.stringify(tokens, null, 2));
        res.json({ success: true, message: `Akun tersambung!` });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.get(/(.*)/, (req, res) => res.sendFile(path.join(__dirname, 'frontend/dist/index.html')));

app.listen(PORT, () => console.log(`🚀 VStream Server berjalan di port ${PORT}`));