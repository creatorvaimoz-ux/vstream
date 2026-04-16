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
const { exec, spawn } = require('child_process'); // Tambahkan 'spawn' untuk FFmpeg

// Load .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7678;

app.use(cors());
app.use(express.json());

// --- SETUP MULTER & DIREKTORI ---
const SECRETS_DIR = path.join(__dirname, 'api_secrets');
if (!fs.existsSync(SECRETS_DIR)) {
    fs.mkdirSync(SECRETS_DIR, { recursive: true });
}

const MEDIA_DIR = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

const PLAYLIST_FILE = path.join(__dirname, 'playlists.json');
if (!fs.existsSync(PLAYLIST_FILE)) {
    fs.writeFileSync(PLAYLIST_FILE, JSON.stringify([]));
}

// File Log untuk FFmpeg
const LOG_FILE = path.join(__dirname, 'ffmpeg_stream.log');
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '=== LOG AKTIVITAS FFMPEG ===\n');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, SECRETS_DIR),
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, MEDIA_DIR),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, safeName);
    }
});
const uploadMedia = multer({ storage: mediaStorage });

// --- FUNGSI GOOGLE OAUTH ---
let cachedCredentials = null;
const CREDENTIALS_FILE = path.join(__dirname, 'google_credentials.json');

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
                'Accept-Language': 'en-US,en;q=0.5',
            }
        };
        
        if (cookieString) options.headers['Cookie'] = cookieString;

        https.get(options, (res) => {
            if (res.headers['set-cookie']) {
                res.headers['set-cookie'].forEach(c => {
                    const parts = c.split(';')[0].split('=');
                    if (parts.length >= 2) {
                        const key = parts.shift().trim();
                        globalCookies[key] = parts.join('=').trim();
                    }
                });
            }

            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let nextUrl = res.headers.location;
                if (!nextUrl.startsWith('http')) {
                    nextUrl = `https://${parsedUrl.hostname}${nextUrl}`;
                }
                requestWithRedirects(nextUrl, isRetry);
            } 
            else if (res.statusCode === 200) {
                const contentType = res.headers['content-type'] || '';
                
                if (contentType.includes('text/html')) {
                    if (isRetry) {
                        return callback(new Error("Gagal Bypass GDrive: Google masih memblokir unduhan. File mungkin dibatasi (Restricted)."));
                    }
                    
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        const linkMatch = body.match(/href="([^"]*confirm=[^"]*)"/i) || body.match(/href='([^']*confirm=[^']*)'/i);
                        
                        if (linkMatch && linkMatch[1]) {
                            let confirmUrl = linkMatch[1].replace(/&amp;/g, '&'); 
                            if (!confirmUrl.startsWith('http')) {
                                confirmUrl = `https://${parsedUrl.hostname}${confirmUrl.startsWith('/') ? '' : '/'}${confirmUrl}`;
                            }
                            return requestWithRedirects(confirmUrl, true);
                        }

                        let confirmToken = '';
                        const warningKey = Object.keys(globalCookies).find(k => k.startsWith('download_warning'));
                        if (warningKey) confirmToken = globalCookies[warningKey];

                        if (confirmToken) {
                            const sep = reqUrl.includes('?') ? '&' : '?';
                            const confirmUrl = `${reqUrl}${sep}confirm=${confirmToken}`;
                            return requestWithRedirects(confirmUrl, true);
                        }

                        const sep = reqUrl.includes('?') ? '&' : '?';
                        const fallbackUrl = `${reqUrl}${sep}confirm=t`;
                        requestWithRedirects(fallbackUrl, true);
                    });
                } else {
                    const fileStream = fs.createWriteStream(destPath);
                    res.pipe(fileStream);
                    fileStream.on('finish', () => {
                        fileStream.close();
                        callback(null);
                    });
                    fileStream.on('error', (err) => {
                        fs.unlink(destPath, () => {});
                        callback(err);
                    });
                }
            } else {
                callback(new Error(`Ditolak server dengan status HTTP: ${res.statusCode}`));
            }
        }).on('error', (err) => {
            callback(err);
        });
    }

    requestWithRedirects(initialUrl, false);
}

function downloadStandardUrl(urlStr, destPath, callback, redirectCount = 0) {
    if (redirectCount > 5) return callback(new Error('Terlalu banyak redirect. Link tidak valid.'));
    const client = urlStr.startsWith('https') ? https : http;
    
    client.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
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
            fileStream.on('finish', () => {
                fileStream.close();
                callback(null);
            });
            fileStream.on('error', (err) => {
                fs.unlink(destPath, () => {});
                callback(err);
            });
        } else {
            callback(new Error(`Gagal mendownload, Status HTTP: ${res.statusCode}`));
        }
    }).on('error', (err) => {
        callback(err);
    });
}

// --- API ROUTES ---

app.get('/api/status', (req, res) => {
    res.json({ status: 'running', message: 'Backend VStream Aktif' });
});

// --- ENGINE FFMPEG (MEMULAI LIVE) ---
const activeStreams = new Map(); // Menyimpan data stream yang sedang jalan

app.post('/api/stream/start', (req, res) => {
    const { streamKey, videoPath, isLoop } = req.body;

    if (!streamKey || !videoPath) {
        return res.status(400).json({ success: false, message: 'Stream Key dan File Video tidak boleh kosong!' });
    }

    const fullVideoPath = path.join(MEDIA_DIR, videoPath);
    if (!fs.existsSync(fullVideoPath)) {
        return res.status(404).json({ success: false, message: `File video '${videoPath}' tidak ditemukan di server.` });
    }

    const streamId = `live_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Tulis ke file log
    fs.appendFileSync(LOG_FILE, `\n[${timestamp}] [SYSTEM] Menerima tugas Live baru (${streamId}). Video: ${videoPath}\n`);

    // Susun perintah FFmpeg untuk YouTube RTMP
    const ffmpegArgs = ['-re']; // Baca input dalam kecepatan real-time (1x)
    
    if (isLoop) {
        ffmpegArgs.push('-stream_loop', '-1'); // Mengulang video tanpa batas (Looping)
    }

    ffmpegArgs.push(
        '-i', fullVideoPath,
        '-c:v', 'libx264',
        '-preset', 'veryfast',      // Keseimbangan CPU dan Kualitas
        '-b:v', '3000k',            // Bitrate Video (Standard 1080p ringan)
        '-maxrate', '3000k',
        '-bufsize', '6000k',
        '-pix_fmt', 'yuv420p',
        '-g', '60',                 // Keyframe tiap 2 detik (asumsi 30fps)
        '-c:a', 'aac',
        '-b:a', '128k',             // Bitrate Audio standar
        '-ar', '44100',
        '-f', 'flv',
        `rtmp://a.rtmp.youtube.com/live2/${streamKey}` // Tujuan server YouTube
    );

    // Eksekusi Mesin FFmpeg
    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
    activeStreams.set(streamId, ffmpegProcess);

    ffmpegProcess.stderr.on('data', (data) => {
        // FFmpeg mengeluarkan log progress pada stderr
        const logData = data.toString();
        fs.appendFileSync(LOG_FILE, logData);
    });

    ffmpegProcess.on('close', (code) => {
        activeStreams.delete(streamId);
        fs.appendFileSync(LOG_FILE, `\n[${new Date().toISOString()}] [SYSTEM] Proses FFmpeg ${streamId} Terhenti (Kode Keluar: ${code})\n`);
    });

    res.json({ success: true, message: 'Mesin FFmpeg berhasil diaktifkan! Cek menu Log untuk melihat status pengiriman ke YouTube.', streamId });
});

// Endpoint untuk menghentikan Live
app.post('/api/stream/stop', (req, res) => {
    const { streamId } = req.body;
    const process = activeStreams.get(streamId);
    if (process) {
        process.kill('SIGKILL');
        activeStreams.delete(streamId);
        res.json({ success: true, message: 'Streaming berhasil dihentikan paksa.' });
    } else {
        res.status(404).json({ success: false, message: 'Stream tidak ditemukan atau sudah berhenti.' });
    }
});


app.post('/api/media/upload', uploadMedia.array('files'), (req, res) => {
    const count = req.files ? req.files.length : 0;
    res.json({ success: true, message: `${count} file berhasil diunggah ke VPS.` });
});

app.get('/api/media', (req, res) => {
    try {
        const files = fs.readdirSync(MEDIA_DIR);
        const list = files.map(f => {
            const stats = fs.statSync(path.join(MEDIA_DIR, f));
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2) + ' MB';
            return { id: f, name: f, size: sizeMB };
        });
        res.json(list);
    } catch (error) {
        res.json([]);
    }
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
    
    if (!filename || filename.indexOf('.') === -1 || gdriveMatch) {
        filename = `import_${Date.now()}.mp4`; 
    }
    filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_'); 
    
    const dest = path.join(MEDIA_DIR, filename);

    const handleSuccess = (err) => {
        if (err) {
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            return res.status(500).json({ success: false, message: err.message });
        }
        
        if (fs.existsSync(dest)) {
            const stats = fs.statSync(dest);
            if (stats.size < 10 * 1024) { 
                fs.unlinkSync(dest); 
                return res.status(400).json({ 
                    success: false, 
                    message: 'Gagal: File terlalu kecil. Pastikan link Google Drive Anda "Public" (Siapa saja yang memiliki link).' 
                });
            }
            res.json({ success: true, message: `Berhasil! File video utuh tersimpan sebagai ${filename}` });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menyimpan file di server.' });
        }
    };

    if (gdriveMatch && gdriveMatch[1]) {
        downloadGoogleDrive(gdriveMatch[1], dest, handleSuccess);
    } else {
        downloadStandardUrl(url, dest, handleSuccess);
    }
});

app.get('/api/playlists', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
        res.json(data);
    } catch (e) {
        res.json([]);
    }
});

app.post('/api/playlists', (req, res) => {
    const { name, videos } = req.body;
    if (!name || !videos) return res.status(400).json({ success: false, message: 'Data tidak lengkap' });

    try {
        const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
        const newPlaylist = { id: Date.now().toString(), name, videos, count: videos.length };
        playlists.push(newPlaylist);
        fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists, null, 2));
        
        res.json({ success: true, message: 'Playlist berhasil disimpan!' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.delete('/api/playlists/:id', (req, res) => {
    try {
        let playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
        playlists = playlists.filter(p => p.id !== req.params.id);
        fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/api/settings/google-credentials', (req, res) => {
    const { clientId, clientSecret } = req.body;
    if (!clientId || !clientSecret) {
        return res.status(400).json({ success: false, message: 'Client ID dan Secret harus diisi' });
    }
    cachedCredentials = { clientId, clientSecret };
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(cachedCredentials, null, 2));
    res.json({ success: true, message: 'Kredensial Google API berhasil disimpan di server!' });
});

app.get('/api/settings/accounts', (req, res) => {
    try {
        const files = fs.readdirSync(__dirname).filter(f => f.startsWith('token_') && f.endsWith('.json'));
        const accounts = files.map(f => {
            let name = f.replace('token_', '').replace('.json', '');
            return { id: f, name: name.replace(/_/g, ' ') };
        });
        res.json(accounts);
    } catch (error) {
        res.json([]);
    }
});

app.delete('/api/settings/account/:id', (req, res) => {
    const filePath = path.join(__dirname, req.params.id);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
});

app.get('/api/auth/url', (req, res) => {
    try {
        const oauth2Client = getOAuth2Client();
        if (!oauth2Client) {
            return res.status(400).json({ error: 'Kredensial Google belum diatur. Silakan simpan Client ID atau Upload JSON dulu.' });
        }
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/youtube.readonly',
                'https://www.googleapis.com/auth/youtube.force-ssl'
            ]
        });
        res.json({ url });
    } catch (e) { 
        res.status(500).json({ error: 'Gagal membuat URL: ' + e.message }); 
    }
});

app.post('/api/auth/save', async (req, res) => {
    const { accountName, authUrl } = req.body;
    try {
        const oauth2Client = getOAuth2Client();
        if (!oauth2Client) throw new Error("OAuth Client belum siap.");

        const code = new URL(authUrl).searchParams.get('code');
        if (!code) throw new Error("Parameter 'code' tidak ditemukan di URL");

        const { tokens } = await oauth2Client.getToken(code);
        fs.writeFileSync(path.join(__dirname, `token_${accountName.replace(/\s+/g, '_')}.json`), JSON.stringify(tokens, null, 2));
        res.json({ success: true, message: `Akun ${accountName} tersambung!` });
    } catch (e) { 
        res.status(500).json({ success: false, message: e.message }); 
    }
});

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// --- JALANKAN SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 VStream Server berjalan di port ${PORT}`);
});