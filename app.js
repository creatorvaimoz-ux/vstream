const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const { google } = require('googleapis');
const fs = require('fs');
const multer = require('multer');
const https = require('https');
const http = require('http');

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

// Direktori untuk Media Video
const MEDIA_DIR = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// File Database untuk Playlist
const PLAYLIST_FILE = path.join(__dirname, 'playlists.json');
if (!fs.existsSync(PLAYLIST_FILE)) {
    fs.writeFileSync(PLAYLIST_FILE, JSON.stringify([]));
}

// Storage untuk JSON API
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, SECRETS_DIR),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Storage khusus untuk Video/Media
const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, MEDIA_DIR),
    filename: (req, file, cb) => {
        // Hilangkan spasi pada nama file
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


// --- API ROUTES ---

// [Status]
app.get('/api/status', (req, res) => {
    res.json({ status: 'running', message: 'Backend VStream Aktif' });
});

// --- MANAJEMEN MEDIA ---
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

// --- JALUR BARU: IMPORT DARI URL (DIPERBARUI DENGAN GDRIVE CONVERTER) ---
app.post('/api/media/import-url', (req, res) => {
    let { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL tidak valid' });

    // 1. PEMBERSIH URL: Buang spasi dan Enter yang tidak sengaja ter-paste
    url = url.trim();

    // 2. GDRIVE CONVERTER: Ubah link gdrive biasa menjadi Direct Download
    let downloadUrl = url;
    const gdriveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gdriveMatch && gdriveMatch[1]) {
        const fileId = gdriveMatch[1];
        // Tambahkan konfirmasi agar bypass warning virus Google Drive untuk file besar
        downloadUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`;
    }

    // Mengekstrak nama file dari URL asal atau berikan nama import default
    let filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
    
    // Jika dari GDrive atau file tidak punya akhiran format (.mp4), berikan nama otomatis
    if (!filename || filename.indexOf('.') === -1 || gdriveMatch) {
        filename = `import_${Date.now()}.mp4`; 
    }
    filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_'); // Bersihkan nama
    
    const dest = path.join(MEDIA_DIR, filename);

    // Menggunakan curl kebal redirect, menyamar sebagai browser.
    const command = `curl -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -o "${dest}" "${downloadUrl}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            return res.status(500).json({ success: false, message: 'Gagal mendownload: ' + error.message });
        }

        // Validasi Ekstra: Pastikan file yang terunduh ukurannya masuk akal (> 100KB)
        // Jika kurang dari 100KB, itu adalah halaman HTML penolakan, bukan video.
        if (fs.existsSync(dest)) {
            const stats = fs.statSync(dest);
            if (stats.size < 100 * 1024) { 
                fs.unlinkSync(dest); // Hapus file sampah
                return res.status(400).json({ 
                    success: false, 
                    message: 'Gagal: URL ditolak oleh server asal (mendapat file 0 MB). Pastikan URL/Drive Anda disetting "Public" / "Siapa saja memiliki link".' 
                });
            }
            res.json({ success: true, message: `File berhasil diimpor sebagai ${filename}` });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menyimpan file.' });
        }
    });
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


// [Input Manual Client ID & Secret]
app.post('/api/settings/google-credentials', (req, res) => {
    const { clientId, clientSecret } = req.body;
    if (!clientId || !clientSecret) {
        return res.status(400).json({ success: false, message: 'Client ID dan Secret harus diisi' });
    }
    cachedCredentials = { clientId, clientSecret };
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(cachedCredentials, null, 2));
    res.json({ success: true, message: 'Kredensial Google API berhasil disimpan di server!' });
});

// [Mengambil Daftar Akun YouTube]
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

// [Generate Auth URL]
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

// [Save Auth Token]
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