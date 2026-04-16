const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const { google } = require('googleapis');
const fs = require('fs');
const multer = require('multer');

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, SECRETS_DIR),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// --- FUNGSI GOOGLE OAUTH ---
let cachedCredentials = null;
const CREDENTIALS_FILE = path.join(__dirname, 'google_credentials.json');

function getOAuth2Client() {
    let clientId, clientSecret;

    // 1. Coba cari file JSON di folder api_secrets (Dari fitur upload JSON)
    const files = fs.readdirSync(SECRETS_DIR).filter(f => f.endsWith('.json'));
    if (files.length > 0) {
        const data = JSON.parse(fs.readFileSync(path.join(SECRETS_DIR, files[0])));
        const creds = data.web || data.installed;
        if (creds) {
            clientId = creds.client_id;
            clientSecret = creds.client_secret;
        }
    } 
    
    // 2. Fallback ke google_credentials.json (Input manual UI)
    if (!clientId && fs.existsSync(CREDENTIALS_FILE)) {
        const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE));
        clientId = data.clientId;
        clientSecret = data.clientSecret;
    }

    // 3. Fallback ke .env
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

// [Upload JSON API v3]
app.post('/api/settings/upload-json', upload.array('files'), (req, res) => {
    res.json({ success: true, message: `${req.files.length} file JSON berhasil diunggah.` });
});

// [Get API Keys]
app.get('/api/settings/api-keys', (req, res) => {
    try {
        const files = fs.readdirSync(SECRETS_DIR).filter(f => f.endsWith('.json'));
        const list = files.map(f => {
            const content = JSON.parse(fs.readFileSync(path.join(SECRETS_DIR, f)));
            const creds = content.web || content.installed;
            return { 
                id: f, 
                name: f.split('-').slice(1).join('-') || f, 
                clientId: creds ? creds.client_id : 'Invalid JSON' 
            };
        });
        res.json(list);
    } catch (error) {
        res.json([]);
    }
});

// [Delete API Key]
app.delete('/api/settings/api-key/:id', (req, res) => {
    const filePath = path.join(SECRETS_DIR, req.params.id);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
});

// --- FITUR BARU: MENGAMBIL DAFTAR AKUN CHANNEL YANG TERSAMBUNG ---
// (Ini fitur yang tertinggal sebelumnya, yang memunculkan daftar dropdown!)
app.get('/api/settings/accounts', (req, res) => {
    try {
        // Cari semua file yang berawalan token_ dan berakhiran .json
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

// [Mulai Stream]
app.post('/api/stream/start', (req, res) => {
    const { streamKey, videoFile } = req.body;
    console.log("Menerima request stream:", streamKey, videoFile);
    res.json({ success: true, message: 'Proses Live Dimulai (Simulasi)' });
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