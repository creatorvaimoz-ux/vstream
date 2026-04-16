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

// 1. Fungsi Khusus Menembus Google Drive (DIPERBARUI DENGAN COOKIE PERSISTEN)
function downloadGoogleDrive(fileId, destPath, callback) {
    const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    let globalCookies = {}; // Simpan cookie agar persisten lintas request
    
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
        
        // Bawa cookie di setiap request
        if (cookieString) options.headers['Cookie'] = cookieString;

        https.get(options, (res) => {
            // Tangkap dan simpan Cookie dari Google
            if (res.headers['set-cookie']) {
                res.headers['set-cookie'].forEach(c => {
                    const parts = c.split(';')[0].split('=');
                    if (parts.length >= 2) {
                        const key = parts.shift();
                        globalCookies[key] = parts.join('=');
                    }
                });
            }

            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Ikuti Redirect
                let nextUrl = res.headers.location;
                if (!nextUrl.startsWith('http')) {
                    nextUrl = `https://${parsedUrl.hostname}${nextUrl}`;
                }
                requestWithRedirects(nextUrl, isRetry);
            } else if (res.statusCode === 200) {
                const contentType = res.headers['content-type'] || '';
                
                // Jika Google memberikan HTML peringatan Virus (Bukan Video)
                if (contentType.includes('text/html') && !isRetry) {
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        let confirmToken = '';
                        // Cari token di dalam URL
                        const matchUrl = body.match(/confirm=([a-zA-Z0-9_-]+)/);
                        
                        if (matchUrl && matchUrl[1]) {
                            confirmToken = matchUrl[1];
                        } else {
                            // Cari token di dalam Cookie download_warning
                            const warningKey = Object.keys(globalCookies).find(k => k.startsWith('download_warning'));
                            if (warningKey) confirmToken = globalCookies[warningKey];
                        }

                        if (confirmToken) {
                            const confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
                            // Request ulang dengan Token & Cookie lengkap
                            requestWithRedirects(confirmUrl, true);
                        } else {
                            // Fallback brute-force
                            const fallbackUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
                            requestWithRedirects(fallbackUrl, true);
                        }
                    });
                } else {
                    // Berhasil mendapatkan file video aslinya
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

// 2. Fungsi Download Standar (Untuk link selain Google Drive)
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

// --- JALUR IMPORT URL TERBARU (NATIVE NODE.JS) ---
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

    // Fungsi pengecekan sukses
    const handleSuccess = (err) => {
        if (err) {
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            return res.status(500).json({ success: false, message: err.message });
        }
        
        if (fs.existsSync(dest)) {
            const stats = fs.statSync(dest);
            // Pengecekan ukuran: jika kurang dari 50KB, itu halaman error HTML
            if (stats.size < 50 * 1024) { 
                fs.unlinkSync(dest); 
                return res.status(400).json({ 
                    success: false, 
                    message: 'Gagal menembus proteksi Google Drive (File 0MB). Pastikan link Google Drive Anda "Public" (Siapa saja yang memiliki link).' 
                });
            }
            res.json({ success: true, message: `Berhasil! File video utuh tersimpan sebagai ${filename}` });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menyimpan file di server.' });
        }
    };

    // Eksekusi Pilihan Download
    if (gdriveMatch && gdriveMatch[1]) {
        // Jika Link Google Drive, gunakan Downloader Khusus GDrive
        downloadGoogleDrive(gdriveMatch[1], dest, handleSuccess);
    } else {
        // Jika Link Biasa, gunakan Downloader Standar
        downloadStandardUrl(url, dest, handleSuccess);
    }
});

// --- MANAJEMEN PLAYLIST ---
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