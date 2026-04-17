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
const { spawn } = require('child_process');
const os = require('os');

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
const LOGS_DIR = path.join(__dirname, 'logs');

[SECRETS_DIR, MEDIA_DIR, THUMB_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(PLAYLIST_FILE)) fs.writeFileSync(PLAYLIST_FILE, JSON.stringify([]));
if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, JSON.stringify([]));

// --- FUNGSI HELPER PENCATATAN LOG PER TUGAS ---
function writeLog(taskId, message) {
    const logFileName = taskId ? `${taskId}.log` : 'system.log';
    const logPath = path.join(LOGS_DIR, logFileName);
    const timestamp = new Date().toISOString();
    // Jika pesan sudah mengandung kurung kotak, tidak usah tambah timestamp lagi
    const finalMessage = message.startsWith('[') ? message : `[${timestamp}] ${message}`;
    try { fs.appendFileSync(logPath, `${finalMessage}\n`); } catch(e) {}
}

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

function getOAuth2Client(customTokens = null) {
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
    
    const client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost');
    if (customTokens) client.setCredentials(customTokens);
    
    return client;
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

// --- FUNGSI YOUTUBE METADATA AUTOMATION ---

function parseSpintax(text) {
    if (!text) return '';
    const spintaxRegex = /\{([^{}]+)\}/g;
    return text.replace(spintaxRegex, (match, options) => {
        const opts = options.split('|');
        return opts[Math.floor(Math.random() * opts.length)];
    });
}

function getCategoryId(categoryName) {
    if (!isNaN(categoryName)) return categoryName;
    const map = {
        'Film & Animation': '1', 'Autos & Vehicles': '2', 'Music': '10', 'Pets & Animals': '15',
        'Sports': '17', 'Travel & Events': '19', 'Gaming': '20', 'People & Blogs': '22',
        'Comedy': '23', 'Entertainment': '24', 'News & Politics': '25', 'Howto & Style': '26',
        'Education': '27', 'Science & Technology': '28', 'Nonprofits & Activism': '29'
    };
    return map[categoryName] || '24';
}

async function updateYouTubeMetadata(task) {
    let resultData = { streamKey: null, broadcastId: null, liveChatId: null, streamId: null };

    try {
        let creds = cachedCredentials;
        if (!creds && fs.existsSync(CREDENTIALS_FILE)) {
            creds = JSON.parse(fs.readFileSync(CREDENTIALS_FILE));
        }
        if (!creds && !process.env.GOOGLE_CLIENT_ID) {
            writeLog(task.id, `[YOUTUBE API] Gagal: Kredensial Google API belum diatur di Pengaturan.`);
            return resultData;
        }

        const tokenPath = path.join(__dirname, task.accountId);
        if (!fs.existsSync(tokenPath)) {
            writeLog(task.id, `[YOUTUBE API] Token untuk akun (${task.accountId}) tidak ditemukan.`);
            return resultData;
        }

        const tokens = JSON.parse(fs.readFileSync(tokenPath));
        const oauth2Client = getOAuth2Client(tokens);
        if (!oauth2Client) throw new Error('Kredensial API tidak valid.');
        
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        writeLog(task.id, `[YOUTUBE API] Menghubungi YouTube Studio untuk sinkronisasi metadata...`);

        const broadcastRes = await youtube.liveBroadcasts.list({
            part: 'snippet,status,contentDetails',
            broadcastType: 'all',
            mine: true
        });

        let broadcast = broadcastRes.data.items?.find(b => 
            b.status.lifeCycleStatus === 'ready' || 
            b.status.lifeCycleStatus === 'active' ||
            b.status.lifeCycleStatus === 'created'
        );

        if (!broadcast) {
            writeLog(task.id, `[YOUTUBE API WARNING] Tidak ada Stream/Broadcast yang berstatus 'Ready' atau 'Active' di channel ini.`);
            return resultData;
        }

        resultData.broadcastId = broadcast.id;
        resultData.liveChatId = broadcast.snippet.liveChatId;

        // Otomatis tarik stream key jika terikat dengan broadcast
        if (broadcast.contentDetails && broadcast.contentDetails.boundStreamId) {
            resultData.streamId = broadcast.contentDetails.boundStreamId;
            const streamRes = await youtube.liveStreams.list({
                part: 'cdn',
                id: broadcast.contentDetails.boundStreamId
            });
            if (streamRes.data.items && streamRes.data.items.length > 0) {
                resultData.streamKey = streamRes.data.items[0].cdn.ingestionInfo.streamName;
                writeLog(task.id, `[YOUTUBE API] ✅ Stream Key otomatis berhasil ditarik dari server YouTube!`);
            }
        }

        let finalTitle = task.youtubeTitle ? parseSpintax(task.youtubeTitle) : broadcast.snippet.title;
        if (finalTitle.length > 100) {
            finalTitle = finalTitle.substring(0, 100);
            writeLog(task.id, `[YOUTUBE API] Info: Judul dipotong menjadi 100 karakter agar tidak ditolak YouTube.`);
        }

        const finalDesc = task.youtubeDescription ? parseSpintax(task.youtubeDescription) : broadcast.snippet.description;
        const finalCategory = task.youtubeCategory ? getCategoryId(task.youtubeCategory) : broadcast.snippet.categoryId;

        // 1. UPDATE BROADCAST (Judul, Deskripsi, Visibilitas)
        await youtube.liveBroadcasts.update({
            part: 'snippet,status',
            requestBody: {
                id: broadcast.id,
                snippet: {
                    title: finalTitle,
                    description: finalDesc,
                    scheduledStartTime: broadcast.snippet.scheduledStartTime,
                    categoryId: finalCategory,
                },
                status: {
                    privacyStatus: task.youtubePrivacy || broadcast.status.privacyStatus,
                }
            }
        });
        writeLog(task.id, `[YOUTUBE API] ✅ Metadata YouTube berhasil diubah! Judul: "${finalTitle}"`);

        // 2. UPDATE THUMBNAIL (Aman dari Crash jika gambar > 2MB)
        if (task.thumbnailUrl) {
            try {
                const thumbFileName = task.thumbnailUrl.split('/').pop();
                const thumbLocalPath = path.join(THUMB_DIR, thumbFileName);

                if (fs.existsSync(thumbLocalPath)) {
                    const stats = fs.statSync(thumbLocalPath);
                    if (stats.size > 2097152) { // 2MB Limit Strict
                        writeLog(task.id, `[YOUTUBE API WARNING] Thumbnail diabaikan karena ukuran file melebihi 2MB. Live Streaming tetap dilanjutkan.`);
                    } else {
                        await youtube.thumbnails.set({
                            videoId: broadcast.id,
                            media: {
                                mimeType: 'image/jpeg',
                                body: fs.createReadStream(thumbLocalPath)
                            }
                        });
                        writeLog(task.id, `[YOUTUBE API] ✅ Thumbnail YouTube berhasil diunggah!`);
                    }
                }
            } catch (thumbErr) {
                writeLog(task.id, `[YOUTUBE API WARNING] Gagal mengunggah thumbnail: ${thumbErr.message}. Live Streaming tetap dilanjutkan.`);
            }
        }

        // 3. UPDATE TAGS SEO (Aman dari Crash)
        if (task.youtubeTags) {
            try {
                const videoRes = await youtube.videos.list({ part: 'snippet', id: broadcast.id });
                if (videoRes.data.items && videoRes.data.items.length > 0) {
                    const tagsArray = task.youtubeTags.split(',').map(t => t.trim()).filter(t => t);
                    await youtube.videos.update({
                        part: 'snippet',
                        requestBody: {
                            id: broadcast.id,
                            snippet: {
                                title: finalTitle,
                                categoryId: finalCategory,
                                description: finalDesc,
                                tags: tagsArray
                            }
                        }
                    });
                    writeLog(task.id, `[YOUTUBE API] ✅ Tags SEO Video berhasil diperbarui!`);
                }
            } catch (tagErr) {
                writeLog(task.id, `[YOUTUBE API WARNING] Gagal memperbarui Tags: ${tagErr.message}`);
            }
        }

        return resultData;
    } catch (err) {
        writeLog(task.id, `[YOUTUBE API ERROR] Gagal mengubah metadata otomatis (Error Utama): ${err.message}`);
        return resultData;
    }
}

// --- FUNGSI CHATBOT YOUTUBE ---
async function startYoutubeChatbot(task, liveChatId) {
    if (!task.scheduledMessages || task.scheduledMessages.length === 0) return;
    
    writeLog(task.id, `[CHATBOT] Menyiapkan ${task.scheduledMessages.length} pesan otomatis ke Live Chat...`);
    
    try {
        const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, task.accountId)));
        const oauth2Client = getOAuth2Client(tokens);
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        task.scheduledMessages.forEach(msg => {
            // Kalkulasi delay dalam milidetik
            const delayMs = (parseInt(msg.hour || 0) * 3600000) + (parseInt(msg.minute || 0) * 60000);
            
            setTimeout(async () => {
                // Pastikan stream belum dimatikan
                if (!activeStreams.has(task.id)) return;
                try {
                    await youtube.liveChatMessages.insert({
                        part: 'snippet',
                        requestBody: {
                            snippet: {
                                liveChatId: liveChatId,
                                type: 'textMessageEvent',
                                textMessageDetails: { messageText: msg.text }
                            }
                        }
                    });
                    writeLog(task.id, `[CHATBOT SENDS] ✅ Pesan terkirim: "${msg.text}"`);
                } catch(e) {
                    writeLog(task.id, `[CHATBOT ERROR] Gagal mengirim pesan: ${e.message}`);
                }
            }, delayMs);
        });
    } catch (err) {
        writeLog(task.id, `[CHATBOT ERROR] Inisialisasi bot gagal: ${err.message}`);
    }
}

// --- ENGINE FFMPEG (MEMULAI LIVE) ---
const activeStreams = new Map();

function stopStreamById(id) {
    const processData = activeStreams.get(id);
    if (processData) {
        if (processData.process) processData.process.kill('SIGKILL');
        if (processData.stopTimer) clearTimeout(processData.stopTimer);
        activeStreams.delete(id);
    }
    try {
        let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        let t = tasks.find(x => x.id === id);
        if (t) { t.status = 'Berhenti'; fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2)); }
    } catch(e) {}
}

function startStreamInternal(task) {
    if (activeStreams.has(task.id)) return false; 

    const fullVideoPath = path.join(MEDIA_DIR, task.videoPath);
    if (!fs.existsSync(fullVideoPath)) {
        writeLog(task.id, `[SYSTEM ERROR] Gagal memulai ${task.taskName}: File video tidak ditemukan di server.`);
        return false;
    }

    (async () => {
        writeLog(task.id, `[SYSTEM] Memulai proses persiapan Live untuk tugas: ${task.taskName}`);

        let finalStreamKey = task.streamKey ? task.streamKey.trim() : '';
        let liveChatId = null;
        let broadcastId = null;
        let streamId = null;

        // Panggil API YouTube
        if (task.accountId) {
            const apiData = await updateYouTubeMetadata(task);
            if (apiData) {
                if (task.streamKeyMode === 'Otomatis (API v3)' && apiData.streamKey) {
                    finalStreamKey = apiData.streamKey;
                }
                liveChatId = apiData.liveChatId;
                broadcastId = apiData.broadcastId;
                streamId = apiData.streamId;
            }
        }

        // Jika mode otomatis namun key tidak didapat
        if (task.streamKeyMode === 'Otomatis (API v3)' && !finalStreamKey) {
            writeLog(task.id, `[CRITICAL ERROR] Mode API Otomatis aktif, tapi gagal menarik Stream Key. Pastikan jadwal Live sudah dibuat di YouTube Studio.`);
            activeStreams.delete(task.id);
            try {
                let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
                let t = tasks.find(x => x.id === task.id);
                if (t) { t.status = 'Error'; fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2)); }
            } catch(e) {}
            return;
        }

        if (!finalStreamKey) {
            writeLog(task.id, `[CRITICAL ERROR] Gagal mengeksekusi FFmpeg: Stream Key kosong!`);
            activeStreams.delete(task.id);
            return;
        }

        const ffmpegArgs = ['-re']; 
        if (task.videoMode === 'Satu Video (Looping)') ffmpegArgs.push('-stream_loop', '-1'); 
        
        let encoderEngine = task.encoderEngine || 'copy';
        
        // Setup Arguments FFmpeg
        ffmpegArgs.push('-i', fullVideoPath);
        
        if (encoderEngine === 'copy') {
            // Mode Jalan Tol (Paling Ringan)
            ffmpegArgs.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k');
        } else {
            // Mode Software / Hardware Transcoding
            ffmpegArgs.push('-c:v', 'libx264', '-preset', 'veryfast', '-b:v', '3000k', '-maxrate', '3000k', '-bufsize', '6000k', '-pix_fmt', 'yuv420p', '-g', '60', '-c:a', 'aac', '-b:a', '128k');
        }

        ffmpegArgs.push('-ar', '44100', '-f', 'flv', `rtmp://a.rtmp.youtube.com/live2/${finalStreamKey}`);

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
        
        // Simpan data stream untuk Auto Stop
        let stopTimer = null;
        let stopDurationMs = (parseInt(task.stopHours || 0) * 3600000) + (parseInt(task.stopMinutes || 0) * 60000);
        
        if (stopDurationMs > 0) {
            // FITUR: ANTI SPAM RANDOMIZER
            if (task.randomizeStop) {
                const varianceMs = 15 * 60000; // ±15 menit dalam milidetik
                const randomJitter = Math.floor(Math.random() * (varianceMs * 2 + 1)) - varianceMs;
                stopDurationMs += randomJitter;
                
                if (stopDurationMs < 300000) stopDurationMs = 300000; // Proteksi minimal 5 menit live
            }

            const actualHours = Math.floor(stopDurationMs / 3600000);
            const actualMinutes = Math.floor((stopDurationMs % 3600000) / 60000);
            
            writeLog(task.id, `[SYSTEM] Stream ini akan dihentikan otomatis dlm ${actualHours} Jam ${actualMinutes} Menit ${task.randomizeStop ? '(Anti-Spam Acak)' : ''}.`);
            
            stopTimer = setTimeout(() => {
                writeLog(task.id, `[SYSTEM] Waktu habis! Menghentikan tugas otomatis: ${task.taskName}`);
                stopStreamById(task.id);
            }, stopDurationMs);
        }

        activeStreams.set(task.id, { 
            process: ffmpegProcess, 
            broadcastId: broadcastId, 
            streamId: streamId, // Disimpan untuk cek health status
            accountId: task.accountId,
            viewers: 0, 
            healthStatus: 'no_data', // Status awal
            startTime: Date.now(),
            stopTimer: stopTimer
        });

        // Nyalakan Chatbot
        if (task.chatbotEnabled && liveChatId) {
            startYoutubeChatbot(task, liveChatId);
        }

        ffmpegProcess.stderr.on('data', (data) => {
            writeLog(task.id, data.toString().trim());
        });

        ffmpegProcess.on('error', (err) => {
            writeLog(task.id, `[CRITICAL ERROR] Gagal mengeksekusi FFmpeg: ${err.message}`);
            stopStreamById(task.id);
        });

        ffmpegProcess.on('close', (code) => {
            writeLog(task.id, `[SYSTEM] FFmpeg Terhenti (Kode Keluar: ${code})`);
            stopStreamById(task.id);
        });

    })(); 

    return true;
}

// --- CRON JOB (PENJADWAL OTOMATIS MINGGUAN & HARIAN) ---
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
        
        const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const todayName = dayNames[new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"})).getDay()];

        tasks.forEach(task => {
            if (task.status === 'Terjadwal' || task.status === 'Berhenti') { 
                let shouldStart = false;

                if (task.jadwalMode === 'sekali' || task.jadwalMode === 'manual') {
                    if (task.scheduleDate === currentDate && task.scheduleTime === currentTime && task.status !== 'Berhenti') {
                        shouldStart = true;
                    }
                } else if (task.jadwalMode === 'harian') {
                    if (task.scheduleTime === currentTime) {
                        shouldStart = true;
                    }
                } else if (task.jadwalMode === 'smart-weekly') {
                    if (task.scheduleGrid && task.scheduleGrid[todayName]) {
                        const gridToday = task.scheduleGrid[todayName];
                        if (gridToday.active && gridToday.start === currentTime) {
                            shouldStart = true;
                        }
                    }
                }

                if (shouldStart) {
                    writeLog(null, `[CRON] Waktunya mulai tugas otomatis: ${task.taskName}`);
                    if (startStreamInternal(task)) {
                        task.status = 'Live';
                        isModified = true;
                    }
                }
            }
        });

        if (isModified) fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    } catch (e) { console.log("[CRON ERROR] " + e.message); }
}, 60000); 

// --- CRON JOB PEMBERSIH LOG 30 MENIT ---
setInterval(() => {
    try {
        if (fs.existsSync(LOGS_DIR)) {
            const files = fs.readdirSync(LOGS_DIR);
            files.forEach(file => {
                const filePath = path.join(LOGS_DIR, file);
                fs.writeFileSync(filePath, `[SYSTEM] === LOG DIBERSIHKAN OTOMATIS (${new Date().toISOString()}) ===\n`);
            });
            writeLog(null, `[SYSTEM] Siklus 30 Menit: Semua file log dibersihkan otomatis untuk menghemat disk VPS.`);
        }
    } catch (e) { console.error("[CRON LOG CLEANER ERROR] " + e.message); }
}, 30 * 60 * 1000);

// --- REALTIME YOUTUBE ANALYTICS & HEALTH SENSOR (Tiap 2 Menit) ---
setInterval(async () => {
    for (const [taskId, streamData] of activeStreams.entries()) {
        if (streamData.accountId) {
            try {
                const tokenPath = path.join(__dirname, streamData.accountId);
                if (fs.existsSync(tokenPath)) {
                    const tokens = JSON.parse(fs.readFileSync(tokenPath));
                    const oauth2Client = getOAuth2Client(tokens);
                    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
                    
                    // Ambil Viewers
                    if (streamData.broadcastId) {
                        const res = await youtube.videos.list({ part: 'liveStreamingDetails', id: streamData.broadcastId });
                        if (res.data.items && res.data.items.length > 0) {
                            const viewers = res.data.items[0].liveStreamingDetails?.concurrentViewers || 0;
                            streamData.viewers = parseInt(viewers);
                        }
                    }

                    // Ambil Stream Health (Indikator Kondisi)
                    if (streamData.streamId) {
                        const healthRes = await youtube.liveStreams.list({ part: 'status', id: streamData.streamId });
                        if (healthRes.data.items && healthRes.data.items.length > 0) {
                            streamData.healthStatus = healthRes.data.items[0].status.healthStatus.status; // 'good', 'ok', 'bad', 'noData'
                        }
                    }
                }
            } catch(e) { console.log("Analytics Fetch Error:", e.message); }
        }
    }
}, 120000);

// --- API ROUTES ---

app.get('/api/status', (req, res) => res.json({ status: 'running', message: 'Backend VStream Aktif' }));

let previousCpuTimes = getCpuTimes();
function getCpuTimes() {
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    for (let cpu of cpus) {
        user += cpu.times.user; nice += cpu.times.nice; sys += cpu.times.sys;
        idle += cpu.times.idle; irq += cpu.times.irq;
    }
    return { idle, total: user + nice + sys + idle + irq };
}

app.get('/api/system', (req, res) => {
    const currentCpuTimes = getCpuTimes();
    const idleDiff = currentCpuTimes.idle - previousCpuTimes.idle;
    const totalDiff = currentCpuTimes.total - previousCpuTimes.total;
    let cpuUsage = 0;
    if (totalDiff > 0) cpuUsage = 100 - Math.floor((idleDiff / totalDiff) * 100);
    previousCpuTimes = currentCpuTimes;

    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();
    const ramUsage = Math.floor((usedMem / totalMem) * 100);

    res.json({
        cpu: cpuUsage,
        ram: ramUsage,
        disk: Math.floor(Math.random() * 10) + 15, 
        bandwidth: (Math.random() * 2).toFixed(1)
    });
});

app.get('/api/logs', (req, res) => {
    try {
        const taskId = req.query.taskId;
        const logFileName = taskId ? `${taskId}.log` : 'system.log';
        const logPath = path.join(LOGS_DIR, logFileName);

        if (fs.existsSync(logPath)) {
            const logContent = fs.readFileSync(logPath, 'utf8');
            const logLines = logContent.split('\n').filter(line => line.trim() !== '').slice(-100); 
            res.json({ success: true, logs: logLines });
        } else {
            res.json({ success: true, logs: [`[SYSTEM] Belum ada log untuk ${taskId ? 'tugas ini' : 'Sistem Utama'}.`] });
        }
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/tasks', (req, res) => {
    try {
        const tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        const newTask = { id: `task_${Date.now()}`, ...req.body, status: req.body.isMulaiSekarang ? 'Live' : 'Terjadwal', createdAt: new Date().toISOString() };
        tasks.push(newTask);
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));

        if (newTask.status === 'Live') startStreamInternal(newTask);

        res.json({ success: true, message: 'Tugas Live berhasil disimpan!', task: newTask });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/tasks', (req, res) => {
    try { 
        const tasks = JSON.parse(fs.readFileSync(TASKS_FILE)); 
        const tasksWithAnalytics = tasks.map(t => {
            const activeData = activeStreams.get(t.id);
            let resolution = t.outputResolution || 'Source';
            if (resolution === 'source') resolution = 'Source';
            let fps = resolution.includes('60') ? '60' : '30';

            if (activeData) {
                const uptimeMs = Date.now() - activeData.startTime;
                const hours = Math.floor(uptimeMs / 3600000).toString().padStart(2, '0');
                const minutes = Math.floor((uptimeMs % 3600000) / 60000).toString().padStart(2, '0');
                
                // Set Condition
                let condType = 'success';
                let condTitle = 'Sangat Baik (Good)';
                let statusText = 'Live';

                if (activeData.healthStatus === 'bad') {
                    condType = 'error';
                    condTitle = 'Buruk (Bad) / Putus';
                } else if (activeData.healthStatus === 'ok') {
                    condType = 'warning';
                    condTitle = 'Lemah (Poor)';
                } else if (activeData.healthStatus === 'noData' || activeData.healthStatus === 'no_data') {
                    condType = 'gray';
                    condTitle = 'Menunggu Data';
                    if (uptimeMs < 30000) statusText = 'Starting'; // Baru nyala
                }

                return { 
                    ...t, 
                    viewers: activeData.viewers, 
                    uptime: `${hours}:${minutes}`,
                    condType: condType,
                    condTitle: condTitle,
                    statusText: statusText,
                    resolution: resolution,
                    fps: fps
                };
            }
            return { 
                ...t, 
                viewers: 0, 
                uptime: '00:00',
                condType: 'gray',
                condTitle: 'Offline',
                statusText: t.status,
                resolution: resolution,
                fps: fps
            };
        });
        res.json(tasksWithAnalytics);
    } catch (e) { res.json([]); }
});

app.post('/api/stream/stop', (req, res) => {
    stopStreamById(req.body.streamId);
    res.json({ success: true, message: 'Streaming dihentikan.' });
});

app.delete('/api/tasks/:id', (req, res) => {
    try {
        stopStreamById(req.params.id);
        let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        tasks = tasks.filter(t => t.id !== req.params.id);
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/thumbnails/upload', uploadThumb.single('thumbnail'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Gagal upload thumbnail' });
    res.json({ success: true, filename: req.file.filename, url: `/thumbnails/${req.file.filename}` });
});

app.use('/thumbnails', express.static(THUMB_DIR));

app.post('/api/media/upload', uploadMedia.array('files'), (req, res) => {
    res.json({ success: true, message: `Upload berhasil.` });
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
        res.json({ url: oauth2Client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/youtube'] }) });
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