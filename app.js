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
const NOTIF_FILE = path.join(__dirname, 'notifications.json'); 

[SECRETS_DIR, MEDIA_DIR, THUMB_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(PLAYLIST_FILE)) fs.writeFileSync(PLAYLIST_FILE, JSON.stringify([]));
if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
if (!fs.existsSync(NOTIF_FILE)) fs.writeFileSync(NOTIF_FILE, JSON.stringify({}));

// --- SERVE MEDIA STATIC (UNTUK PREVIEW VIDEO DI BROWSER) ---
app.use('/media', express.static(MEDIA_DIR));
app.use('/thumbnails', express.static(THUMB_DIR));

// --- FUNGSI HELPER PENCATATAN LOG PER TUGAS ---
function writeLog(taskId, message) {
    const logFileName = taskId ? `${taskId}.log` : 'system.log';
    const logPath = path.join(LOGS_DIR, logFileName);
    const timestamp = new Date().toISOString();
    const finalMessage = message.startsWith('[') ? message : `[${timestamp}] ${message}`;
    try { fs.appendFileSync(logPath, `${finalMessage}\n`); } catch(e) {}
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- FUNGSI PENGIRIM TELEGRAM BOT ---
function sendTelegramMessage(message) {
    try {
        if (!fs.existsSync(NOTIF_FILE)) return;
        const settings = JSON.parse(fs.readFileSync(NOTIF_FILE));
        
        if (!settings.notifEnabled || settings.notifPlatform !== 'telegram' || !settings.telegramToken || !settings.telegramChatId) return;

        const data = JSON.stringify({
            chat_id: settings.telegramChatId,
            text: `🚨 <b>VStream Alert</b>\n\n${message}`,
            parse_mode: 'HTML'
        });

        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${settings.telegramToken}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data) 
            }
        };

        const req = https.request(options, (res) => {});
        req.on('error', (e) => console.error("Gagal mengirim Telegram:", e.message));
        req.write(data);
        req.end();
    } catch (e) {
        console.error("Kesalahan fungsi Telegram:", e.message);
    }
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

// --- FUNGSI YOUTUBE METADATA AUTOMATION (BYPASS STUDIO) ---

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

        let finalTitle = task.youtubeTitle ? parseSpintax(task.youtubeTitle) : task.taskName;
        if (finalTitle.length > 100) finalTitle = finalTitle.substring(0, 100);
        const finalDesc = task.youtubeDescription ? parseSpintax(task.youtubeDescription) : 'Live Stream via VStream';
        const finalCategory = task.youtubeCategory ? getCategoryId(task.youtubeCategory) : '24';
        const privacy = task.youtubePrivacy || 'public';

        writeLog(task.id, `[YOUTUBE API] Membangun Ruang Live Studio Otomatis untuk "${finalTitle}"...`);

        // 1. CREATE BROADCAST (Broadcast API tidak bisa menyuntikkan kategori/tag, ini wajar)
        const broadcastRes = await youtube.liveBroadcasts.insert({
            part: 'snippet,status,contentDetails',
            requestBody: {
                snippet: {
                    title: finalTitle,
                    description: finalDesc,
                    scheduledStartTime: new Date().toISOString()
                },
                status: {
                    privacyStatus: privacy,
                    selfDeclaredMadeForKids: false
                },
                contentDetails: {
                    enableAutoStart: true, 
                    enableAutoStop: true,  
                    enableClosedCaptions: false,
                    enableContentEncryption: false,
                    enableDvr: true,
                    recordFromStart: true,
                    startWithSlate: false
                }
            }
        });

        const broadcast = broadcastRes.data;
        resultData.broadcastId = broadcast.id; // Ini sama dengan Video ID
        resultData.liveChatId = broadcast.snippet.liveChatId;

        writeLog(task.id, `[YOUTUBE API] Ruang Live berhasil dibuat. Menerapkan Kategori & Tag ke Video...`);

        // 1.5 UPDATE VIDEO RESOURCE
        try {
            let videoParts = 'snippet';
            let videoBody = {
                id: resultData.broadcastId,
                snippet: {
                    title: finalTitle,
                    description: finalDesc,
                    categoryId: finalCategory, // Kategori dipaksa masuk di sini
                    tags: task.youtubeTags ? task.youtubeTags.split(',').map(t => t.trim()).filter(t => t) : [],
                    defaultLanguage: task.videoLanguage || 'id',
                    defaultAudioLanguage: task.videoLanguage || 'id'
                }
            };

            // Jika ada translate bahasa, masukkan juga
            if (task.localizations && Object.keys(task.localizations).length > 0) {
                videoParts = 'snippet,localizations';
                videoBody.localizations = task.localizations;
            }

            await youtube.videos.update({
                part: videoParts,
                requestBody: videoBody
            });
            
            writeLog(task.id, `[YOUTUBE API] ✅ Kategori Video sukses diperbarui ke ID: ${finalCategory}`);
        } catch (vidErr) {
            writeLog(task.id, `[YOUTUBE API WARNING] Gagal menimpa kategori video: ${vidErr.message}`);
        }

        writeLog(task.id, `[YOUTUBE API] Membuat Stream Key pengikat...`);

        // 2. CREATE STREAM KEY
        const streamRes = await youtube.liveStreams.insert({
            part: 'snippet,cdn',
            requestBody: {
                snippet: {
                    title: `VStream Auto Key - ${Date.now()}`
                },
                cdn: {
                    frameRate: 'variable',
                    ingestionType: 'rtmp',
                    resolution: 'variable'
                }
            }
        });

        resultData.streamId = streamRes.data.id;
        resultData.streamKey = streamRes.data.cdn.ingestionInfo.streamName;

        // 3. BINDING (MENGGABUNGKAN KEDUANYA)
        await youtube.liveBroadcasts.bind({
            part: 'id,contentDetails',
            id: resultData.broadcastId,
            streamId: resultData.streamId
        });

        writeLog(task.id, `[YOUTUBE API] ✅ BINDING SUKSES! VStream siap meluncurkan video.`);

        // 4. BINDING KE PLAYLIST TARGET JIKA ADA
        if (task.targetPlaylist && task.targetPlaylist !== 'none') {
            try {
                await youtube.playlistItems.insert({
                    part: 'snippet',
                    requestBody: {
                        snippet: {
                            playlistId: task.targetPlaylist,
                            resourceId: {
                                kind: 'youtube#video',
                                videoId: resultData.broadcastId
                            }
                        }
                    }
                });
                writeLog(task.id, `[YOUTUBE API] Video berhasil ditambahkan ke Playlist Target.`);
            } catch(plErr) {
                writeLog(task.id, `[YOUTUBE API WARNING] Gagal menambahkan ke playlist target: ${plErr.message}`);
            }
        }

        // 5. UPDATE THUMBNAIL (BISA DARI FOLDER MEDIA MAUPUN THUMBNAIL)
        if (task.thumbnailUrl) {
            try {
                const thumbFileName = task.thumbnailUrl.split('/').pop();
                let thumbLocalPath = path.join(THUMB_DIR, thumbFileName);
                if (!fs.existsSync(thumbLocalPath)) {
                    thumbLocalPath = path.join(MEDIA_DIR, thumbFileName);
                }

                if (fs.existsSync(thumbLocalPath)) {
                    const stats = fs.statSync(thumbLocalPath);
                    if (stats.size > 2097152) { // 2MB Limit Strict
                        writeLog(task.id, `[YOUTUBE API WARNING] Thumbnail diabaikan karena ukuran file melebihi 2MB.`);
                    } else {
                        await youtube.thumbnails.set({
                            videoId: resultData.broadcastId,
                            media: {
                                mimeType: 'image/jpeg',
                                body: fs.createReadStream(thumbLocalPath)
                            }
                        });
                        writeLog(task.id, `[YOUTUBE API] ✅ Thumbnail YouTube berhasil diunggah!`);
                    }
                }
            } catch (thumbErr) {
                writeLog(task.id, `[YOUTUBE API WARNING] Gagal mengunggah thumbnail: ${thumbErr.message}`);
            }
        }

        return resultData;
    } catch (err) {
        writeLog(task.id, `[YOUTUBE API ERROR] Gagal membypass YouTube Studio: ${err.message}`);
        return resultData;
    }
}

// --- FUNGSI UPDATE PRIVASI REPLAY ---
async function updateReplayPrivacy(broadcastId, privacy, accountId, taskId) {
    if (!broadcastId || !accountId || privacy === 'public') return;
    try {
        const tokenPath = path.join(__dirname, accountId);
        if (!fs.existsSync(tokenPath)) return;
        const tokens = JSON.parse(fs.readFileSync(tokenPath));
        const oauth2Client = getOAuth2Client(tokens);
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        
        try {
            await youtube.liveBroadcasts.transition({
                broadcastStatus: 'complete',
                id: broadcastId,
                part: 'id,status'
            });
            writeLog(taskId, `[YOUTUBE API] Broadcast berhasil ditutup (Complete).`);
        } catch(e) {}

        await youtube.videos.update({
            part: 'status',
            requestBody: {
                id: broadcastId,
                status: { privacyStatus: privacy }
            }
        });
        writeLog(taskId, `[YOUTUBE API] Privasi Replay video berhasil diubah ke: ${privacy.toUpperCase()}`);
    } catch (e) {
        writeLog(taskId, `[YOUTUBE API WARNING] Gagal mengubah Privasi Replay: ${e.message}`);
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
            const delayMs = (parseInt(msg.hour || 0) * 3600000) + (parseInt(msg.minute || 0) * 60000);
            
            setTimeout(async () => {
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

function stopStreamById(id, isError = false) {
    const processData = activeStreams.get(id);
    let broadcastIdToUpdate = null;
    let accountIdToUpdate = null;

    if (processData) {
        broadcastIdToUpdate = processData.broadcastId;
        accountIdToUpdate = processData.accountId;

        if (processData.process) processData.process.kill('SIGKILL');
        if (processData.stopTimer) clearTimeout(processData.stopTimer);
        activeStreams.delete(id);
    }
    
    try {
        let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        let t = tasks.find(x => x.id === id);
        if (t) { 
            t.status = isError ? 'Error' : 'Berhenti'; 
            fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2)); 

            // UBAH PRIVASI JIKA BUKAN ERROR & FITUR REPLAY PRIVACY AKTIF
            if (!isError && t.replayPrivacy && t.replayPrivacy !== t.youtubePrivacy && broadcastIdToUpdate && accountIdToUpdate) {
                updateReplayPrivacy(broadcastIdToUpdate, t.replayPrivacy, accountIdToUpdate, id);
            }
        }
    } catch(e) {}
}

function startStreamInternal(task, isFallback = false) {
    if (activeStreams.has(task.id) && !isFallback) return false; 

    const videoFileName = isFallback ? task.fallbackVideo : task.videoPath;
    const fullVideoPath = path.join(MEDIA_DIR, videoFileName);
    
    if (!fs.existsSync(fullVideoPath)) {
        writeLog(task.id, `[SYSTEM ERROR] Gagal memulai ${task.taskName}: File video tidak ditemukan di server.`);
        return false;
    }

    (async () => {
        writeLog(task.id, `[SYSTEM] ${isFallback ? '🔄 MENJALANKAN FALLBACK VIDEO' : 'Memulai proses persiapan Live'} untuk tugas: ${task.taskName}`);

        // ACAK THUMBNAIL DARI MEDIA ATAU FOLDER THUMBNAIL
        if (task.randomizeThumbnail && !isFallback) {
            if (task.availableImages && task.availableImages.length > 0) {
                const randomThumb = task.availableImages[Math.floor(Math.random() * task.availableImages.length)];
                task.thumbnailUrl = `/media/${randomThumb}`;
                writeLog(task.id, `[SYSTEM] Menggunakan Acak Thumbnail Media: ${randomThumb}`);
            } else {
                try {
                    const files = fs.readdirSync(THUMB_DIR).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
                    if (files.length > 0) {
                        const randomThumb = files[Math.floor(Math.random() * files.length)];
                        task.thumbnailUrl = `/thumbnails/${randomThumb}`;
                        writeLog(task.id, `[SYSTEM] Menggunakan Acak Thumbnail Direktori: ${randomThumb}`);
                    }
                } catch (e) {}
            }
        }

        let finalStreamKey = task.streamKey ? task.streamKey.trim() : '';
        let liveChatId = null;
        let broadcastId = null;
        let streamId = null;

        if (task.streamKeyMode === 'Otomatis (API v3)' && task.accountId && !isFallback) {
            const apiData = await updateYouTubeMetadata(task);
            if (apiData && apiData.streamKey) {
                finalStreamKey = apiData.streamKey;
                liveChatId = apiData.liveChatId;
                broadcastId = apiData.broadcastId;
                streamId = apiData.streamId;
            } else {
                writeLog(task.id, `[CRITICAL ERROR] Mode API Otomatis aktif, tapi gagal membuat Stream Key dari YouTube.`);
                activeStreams.delete(task.id);
                try {
                    let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
                    let t = tasks.find(x => x.id === task.id);
                    if (t) { t.status = 'Error'; fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2)); }
                } catch(e) {}
                return;
            }
        } else if (isFallback && task.streamKeyMode === 'Otomatis (API v3)') {
            const existingTasks = JSON.parse(fs.readFileSync(TASKS_FILE));
            const existingTask = existingTasks.find(x => x.id === task.id);
            if (existingTask && existingTask.streamKey) {
                finalStreamKey = existingTask.streamKey;
            }
        }

        if (!finalStreamKey) {
            writeLog(task.id, `[CRITICAL ERROR] Gagal mengeksekusi FFmpeg: Stream Key kosong!`);
            activeStreams.delete(task.id);
            return;
        }

        if (!isFallback) {
            let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
            let t = tasks.find(x => x.id === task.id);
            if (t) { t.streamKey = finalStreamKey; fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2)); }
        }

        // --- MENYUSUN ARGUMEN FFMPEG ---
        const ffmpegArgs = ['-re']; 
        if ((task.videoMode === 'Satu Video (Looping)' && !isFallback) || isFallback) {
            ffmpegArgs.push('-stream_loop', '-1'); 
        }
        
        ffmpegArgs.push('-i', fullVideoPath);

        let w = -1, h = -1;
        let needsTranscode = false;
        let encoderEngine = task.encoderEngine || 'copy';

        // 1. Tentukan Resolusi Dasar
        if (task.outputResolution && task.outputResolution !== 'source') {
            needsTranscode = true;
            if (task.outputResolution.includes('2160p')) { w=3840; h=2160; }
            else if (task.outputResolution.includes('1440p')) { w=2560; h=1440; }
            else if (task.outputResolution.includes('1080p')) { w=1920; h=1080; }
            else if (task.outputResolution.includes('720p')) { w=1280; h=720; }
        }

        // 2. Putar Resolusi Jika Mode Vertikal (Shorts)
        if (task.orientation === 'vertical') {
            needsTranscode = true;
            if (w !== -1) { let temp = w; w = h; h = temp; } 
            else { w = 1080; h = 1920; } 
        }

        // 3. Susun Filter
        let vfFilters = [];
        if (w !== -1) {
            vfFilters.push(`scale=${w}:${h}:force_original_aspect_ratio=decrease`);
            vfFilters.push(`pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2`);
        }

        if (needsTranscode && encoderEngine === 'copy') {
            encoderEngine = 'x264';
            writeLog(task.id, `[SYSTEM] Perhatian: Mode 'Direct Copy' otomatis dialihkan ke 'x264' karena filter Orientasi/Resolusi aktif.`);
        }

        if (vfFilters.length > 0) {
            ffmpegArgs.push('-vf', vfFilters.join(','));
        }

        let framerate = '';
        if (task.outputResolution && task.outputResolution.includes('60')) framerate = '60';
        else if (task.outputResolution && task.outputResolution.includes('30')) framerate = '30';

        if (framerate && needsTranscode) ffmpegArgs.push('-r', framerate);

        if (encoderEngine === 'copy') {
            ffmpegArgs.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k');
        } else if (encoderEngine === 'nvenc') {
            ffmpegArgs.push('-c:v', 'h264_nvenc', '-preset', 'p4', '-b:v', '3000k', '-maxrate', '3000k', '-bufsize', '6000k', '-c:a', 'aac', '-b:a', '128k');
        } else if (encoderEngine === 'qsv') {
            ffmpegArgs.push('-c:v', 'h264_qsv', '-preset', 'faster', '-b:v', '3000k', '-c:a', 'aac', '-b:a', '128k');
        } else {
            ffmpegArgs.push('-c:v', 'libx264', '-preset', 'veryfast', '-b:v', '3000k', '-maxrate', '3000k', '-bufsize', '6000k', '-pix_fmt', 'yuv420p', '-g', '60', '-c:a', 'aac', '-b:a', '128k');
        }

        ffmpegArgs.push('-ar', '44100', '-f', 'flv', `rtmp://a.rtmp.youtube.com/live2/${finalStreamKey}`);

        writeLog(task.id, `[FFMPEG] Menjalankan FFmpeg dengan Engine: ${encoderEngine.toUpperCase()}`);
        
        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
        
        let stopTimer = null;
        let stopDurationMs = (parseInt(task.stopHours || 0) * 3600000) + (parseInt(task.stopMinutes || 0) * 60000);
        
        if (stopDurationMs > 0 && !isFallback) {
            if (task.randomizeStop) {
                const varianceMs = 15 * 60000;
                const randomJitter = Math.floor(Math.random() * (varianceMs * 2 + 1)) - varianceMs;
                stopDurationMs += randomJitter;
                if (stopDurationMs < 300000) stopDurationMs = 300000;
            }

            const actualHours = Math.floor(stopDurationMs / 3600000);
            const actualMinutes = Math.floor((stopDurationMs % 3600000) / 60000);
            
            writeLog(task.id, `[SYSTEM] Stream ini akan dihentikan otomatis dlm ${actualHours} Jam ${actualMinutes} Menit ${task.randomizeStop ? '(Anti-Spam Acak)' : ''}.`);
            
            // FUNGSI SMART STOP
            const checkAndStop = () => {
                const streamData = activeStreams.get(task.id);
                if (streamData && task.smartStopEnabled && streamData.viewers > 0) {
                    writeLog(task.id, `[SYSTEM] Smart Stop Aktif: Penutupan ditunda karena masih ada ${streamData.viewers} penonton.`);
                    streamData.stopTimer = setTimeout(checkAndStop, 60000); // Tunda 1 Menit, cek lagi
                } else {
                    writeLog(task.id, `[SYSTEM] Waktu habis! Menghentikan tugas otomatis: ${task.taskName}`);
                    stopStreamById(task.id, false); 
                    
                    const notifSettings = fs.existsSync(NOTIF_FILE) ? JSON.parse(fs.readFileSync(NOTIF_FILE)) : {};
                    if (notifSettings.notifEnabled) {
                        sendTelegramMessage(`🟡 <b>Stream Terhenti Otomatis</b>\n\nTugas: <b>${escapeHtml(task.taskName)}</b>\n\nBerhenti sesuai jadwal timer pengaturan.`);
                    }
                }
            };

            stopTimer = setTimeout(checkAndStop, stopDurationMs);
        }

        activeStreams.set(task.id, { 
            process: ffmpegProcess, 
            broadcastId: broadcastId, 
            streamId: streamId, 
            accountId: task.accountId,
            viewers: 0, 
            healthStatus: 'no_data', 
            startTime: Date.now(),
            stopTimer: stopTimer
        });

        if (!isFallback) {
            const notifSettings = fs.existsSync(NOTIF_FILE) ? JSON.parse(fs.readFileSync(NOTIF_FILE)) : {};
            if (notifSettings.notifEnabled) {
                sendTelegramMessage(`🟢 <b>Stream Berhasil Dimulai</b>\n\nTugas: <b>${escapeHtml(task.taskName)}</b>\nStatus: Mengirim data video ke YouTube 🚀`);
            }
        }

        if (task.chatbotEnabled && liveChatId && !isFallback) {
            startYoutubeChatbot(task, liveChatId);
        }

        ffmpegProcess.stderr.on('data', (data) => {
            const str = data.toString();
            if (str.includes('fps=') || str.includes('bitrate=')) {
                writeLog(task.id, str.trim());
            } else if (str.toLowerCase().includes('error')) {
                writeLog(task.id, str.trim());
            }
        });

        ffmpegProcess.on('error', (err) => {
            writeLog(task.id, `[CRITICAL ERROR] Gagal mengeksekusi FFmpeg: ${err.message}`);
            stopStreamById(task.id, true);
        });

        ffmpegProcess.on('close', (code) => {
            writeLog(task.id, `[SYSTEM] FFmpeg Terhenti (Kode Keluar: ${code})`);
            const isError = (code !== 0 && code !== 255 && code !== null);
            
            // --- LOGIKA FALLBACK ---
            if (isError && task.enableFallback && task.fallbackVideo && !isFallback) {
                writeLog(task.id, `[WARNING] Terdeteksi Error Putus Stream! Menjalankan Video Fallback dalam 5 detik...`);
                const notifSettings = fs.existsSync(NOTIF_FILE) ? JSON.parse(fs.readFileSync(NOTIF_FILE)) : {};
                if (notifSettings.triggerError) {
                    sendTelegramMessage(`⚠️ <b>Peringatan: Stream Terputus!</b>\n\nFallback Video (Loop) diaktifkan untuk menjaga live tetap menyala pada tugas: <b>${escapeHtml(task.taskName)}</b>`);
                }
                
                activeStreams.delete(task.id);
                setTimeout(() => startStreamInternal(task, true), 5000);
                return;
            }

            stopStreamById(task.id, isError); 
            
            if (isError && !isFallback) {
                const notifSettings = fs.existsSync(NOTIF_FILE) ? JSON.parse(fs.readFileSync(NOTIF_FILE)) : {};
                if (notifSettings.triggerError) {
                    sendTelegramMessage(`🔴 <b>Streaming Terputus!</b>\n\nTugas: <b>${escapeHtml(task.taskName)}</b>\nTerputus secara tiba-tiba (Kode Exit: ${code}).\nSilakan periksa server atau koneksi internet VPS.`);
                }
            }
        });

    })(); 

    return true;
}

// --- CRON JOB UNTUK JADWAL ---
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

// --- FETCH ANALYTICS (PULL YOUTUBE API) ---
setInterval(async () => {
    for (const [taskId, streamData] of activeStreams.entries()) {
        if (streamData.accountId) {
            try {
                const tokenPath = path.join(__dirname, streamData.accountId);
                if (fs.existsSync(tokenPath)) {
                    const tokens = JSON.parse(fs.readFileSync(tokenPath));
                    const oauth2Client = getOAuth2Client(tokens);
                    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
                    
                    if (streamData.broadcastId) {
                        const res = await youtube.videos.list({ part: 'liveStreamingDetails', id: streamData.broadcastId });
                        if (res.data.items && res.data.items.length > 0) {
                            const viewers = res.data.items[0].liveStreamingDetails?.concurrentViewers || 0;
                            streamData.viewers = parseInt(viewers);
                        }
                    }

                    if (streamData.streamId) {
                        const healthRes = await youtube.liveStreams.list({ part: 'status', id: streamData.streamId });
                        if (healthRes.data.items && healthRes.data.items.length > 0) {
                            streamData.healthStatus = healthRes.data.items[0].status.healthStatus.status; 
                        }
                    }
                }
            } catch(e) { console.log("Analytics Fetch Error:", e.message); }
        }
    }
}, 120000);

let lastCpuAlertTime = 0;
let prevCpuForMonitor = getCpuTimes();

setInterval(() => {
    try {
        const currentCpu = getCpuTimes();
        const idleDiff = currentCpu.idle - prevCpuForMonitor.idle;
        const totalDiff = currentCpu.total - prevCpuForMonitor.total;
        let cpuUsage = 0;
        if (totalDiff > 0) cpuUsage = 100 - Math.floor((idleDiff / totalDiff) * 100);
        prevCpuForMonitor = currentCpu;

        if (cpuUsage > 85) {
            const now = Date.now();
            if (now - lastCpuAlertTime > 15 * 60 * 1000) { 
                const notifSettings = fs.existsSync(NOTIF_FILE) ? JSON.parse(fs.readFileSync(NOTIF_FILE)) : {};
                if (notifSettings.triggerCpu) {
                    sendTelegramMessage(`⚠️ <b>Peringatan Kinerja Server!</b>\n\nPenggunaan CPU VPS Anda mencapai <b>${cpuUsage}%</b>. Beban yang terlalu tinggi dapat membuat streaming Anda patah-patah atau terputus.\n\nSilakan periksa pengaturan Encoder Anda.`);
                    lastCpuAlertTime = now;
                }
            }
        }
    } catch(e) {}
}, 60000);


// --- API ROUTES UNTUK FRONTEND ---

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

    res.json({ cpu: cpuUsage, ram: ramUsage, disk: Math.floor(Math.random() * 10) + 15, bandwidth: (Math.random() * 2).toFixed(1) });
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

// EDIT TUGAS LIVE
app.put('/api/tasks/:id', (req, res) => {
    try {
        let tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        const index = tasks.findIndex(t => t.id === req.params.id);
        if (index === -1) return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan.' });

        if (activeStreams.has(req.params.id)) stopStreamById(req.params.id, false);

        const updatedTask = { ...tasks[index], ...req.body, updatedAt: new Date().toISOString() };
        if (req.body.isMulaiSekarang) updatedTask.status = 'Live';

        tasks[index] = updatedTask;
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));

        if (req.body.isMulaiSekarang) startStreamInternal(updatedTask);

        res.json({ success: true, message: 'Tugas berhasil diperbarui!' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/tasks', (req, res) => {
    try { 
        const tasks = JSON.parse(fs.readFileSync(TASKS_FILE)); 
        let needsSave = false;

        const tasksWithAnalytics = tasks.map(t => {
            const activeData = activeStreams.get(t.id);
            
            if (activeData && t.status !== 'Live') {
                t.status = 'Live'; 
                needsSave = true;
            } else if (!activeData && t.status === 'Live') {
                t.status = 'Berhenti'; 
                needsSave = true;
            }

            let resolution = t.outputResolution || 'Source';
            if (resolution === 'source') resolution = 'Source';
            let fps = resolution.includes('60') ? '60' : '30';

            if (activeData) {
                const uptimeMs = Date.now() - activeData.startTime;
                const hours = Math.floor(uptimeMs / 3600000).toString().padStart(2, '0');
                const minutes = Math.floor((uptimeMs % 3600000) / 60000).toString().padStart(2, '0');
                
                let condType = 'success';
                let condTitle = 'Sangat Baik (Good)';
                let statusText = 'Live';

                if (activeData.healthStatus === 'bad') {
                    condType = 'error';
                    condTitle = 'Buruk (Bad) / Putus';
                } else if (activeData.healthStatus === 'ok' || activeData.healthStatus === 'poor') {
                    condType = 'warning';
                    condTitle = 'Lemah (Poor)';
                } else if (activeData.healthStatus === 'noData' || activeData.healthStatus === 'no_data') {
                    condType = 'gray';
                    condTitle = 'Menunggu Data';
                    if (uptimeMs < 30000) statusText = 'Starting'; 
                }

                return { 
                    ...t, 
                    viewers: activeData.viewers, 
                    uptime: `${hours}:${minutes}`,
                    streamHealth: activeData.healthStatus || 'good',
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
                streamHealth: 'no_data',
                condType: 'gray',
                condTitle: 'Offline',
                statusText: t.status,
                resolution: resolution,
                fps: fps
            };
        });

        if (needsSave) fs.writeFileSync(TASKS_FILE, JSON.stringify(tasksWithAnalytics, null, 2));

        res.json(tasksWithAnalytics);
    } catch (e) { res.json([]); }
});

app.post('/api/stream/stop', (req, res) => {
    stopStreamById(req.body.streamId, false);
    res.json({ success: true, message: 'Streaming dihentikan.' });
});

app.delete('/api/tasks/:id', (req, res) => {
    try {
        stopStreamById(req.params.id, false);
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

app.put('/api/media/rename', (req, res) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) return res.status(400).json({ success: false, message: 'Nama file tidak lengkap.' });

        const safeOldName = path.basename(oldName);
        const safeNewName = path.basename(newName).replace(/\s+/g, '_'); 

        const oldPath = path.join(MEDIA_DIR, safeOldName);
        const newPath = path.join(MEDIA_DIR, safeNewName);

        if (!fs.existsSync(oldPath)) return res.status(404).json({ success: false, message: 'File sumber tidak ditemukan.' });
        if (fs.existsSync(newPath)) return res.status(400).json({ success: false, message: 'Sudah ada file dengan nama tersebut.' });

        fs.renameSync(oldPath, newPath);

        const tasks = JSON.parse(fs.readFileSync(TASKS_FILE));
        let taskUpdated = false;
        tasks.forEach(t => {
            if (t.videoPath === safeOldName) {
                t.videoPath = safeNewName;
                taskUpdated = true;
            }
        });
        if(taskUpdated) fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));

        const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
        let plUpdated = false;
        playlists.forEach(pl => {
            const idx = pl.videos.indexOf(safeOldName);
            if (idx !== -1) {
                pl.videos[idx] = safeNewName;
                plUpdated = true;
            }
        });
        if(plUpdated) fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists, null, 2));

        res.json({ success: true, message: 'Berhasil mengganti nama file!' });
    } catch(e) {
        res.status(500).json({ success: false, message: e.message });
    }
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

app.get('/api/youtube/playlists', async (req, res) => {
    try {
        const { accountId } = req.query;
        const tokenPath = path.join(__dirname, accountId);
        
        if (!fs.existsSync(tokenPath)) return res.json({ success: false, message: 'Akun tidak ditemukan' });

        const tokens = JSON.parse(fs.readFileSync(tokenPath));
        const oauth2Client = getOAuth2Client(tokens);
        if (!oauth2Client) return res.json({ success: false });

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const response = await youtube.playlists.list({ part: 'snippet', mine: true, maxResults: 50 });
        const playlists = response.data.items.map(item => ({ id: item.id, title: item.snippet.title }));
        res.json({ success: true, playlists });
    } catch (error) {
        res.json({ success: false, playlists: [] });
    }
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
        oauth2Client.setCredentials(tokens);

        // Tarik nama channel asli dari YouTube API
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const channelRes = await youtube.channels.list({ part: 'snippet', mine: true });
        
        let realChannelName = "Channel_" + Date.now();
        if (channelRes.data.items && channelRes.data.items.length > 0) {
            realChannelName = channelRes.data.items[0].snippet.title;
        }

        // Simpan token dengan nama channel yang asli
        const safeName = realChannelName.replace(/[^a-zA-Z0-9]/g, '_');
        fs.writeFileSync(path.join(__dirname, `token_${safeName}.json`), JSON.stringify(tokens, null, 2));
        
        res.json({ success: true, message: `Akun "${realChannelName}" berhasil tersambung!` });
    } catch (e) { 
        res.status(500).json({ success: false, message: e.message }); 
    }
});

app.get('/api/settings/notifications', (req, res) => {
    try {
        const settings = fs.existsSync(NOTIF_FILE) ? JSON.parse(fs.readFileSync(NOTIF_FILE)) : {};
        res.json({ success: true, settings });
    } catch(e) { res.status(500).json({ success: false }); }
});

app.post('/api/settings/notifications', (req, res) => {
    try {
        fs.writeFileSync(NOTIF_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: 'Notifikasi berhasil disimpan!' });
    } catch(e) { res.status(500).json({ success: false }); }
});

app.post('/api/notifications/test', (req, res) => {
    try {
        if (!fs.existsSync(NOTIF_FILE)) return res.json({ message: "Pengaturan belum disimpan." });
        const settings = JSON.parse(fs.readFileSync(NOTIF_FILE));
        
        if (!settings.telegramToken || !settings.telegramChatId) {
            return res.status(400).json({ message: "Silakan isi Token dan Chat ID Telegram terlebih dahulu." });
        }
        
        const data = JSON.stringify({
            chat_id: settings.telegramChatId,
            text: `✅ <b>Test Notifikasi Berhasil!</b>\n\nSistem VStream Anda telah berhasil terhubung ke Telegram.\nAnda akan menerima pesan otomatis di sini jika terjadi error pada Stream atau penggunaan CPU Overload.`,
            parse_mode: 'HTML'
        });

        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${settings.telegramToken}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const reqTest = https.request(options, (resTest) => {
            res.json({ success: true, message: 'Pesan test berhasil dikirim ke Telegram Anda!' });
        });
        
        reqTest.on('error', (e) => {
            res.status(500).json({ message: `Gagal mengirim Telegram: ${e.message}` });
        });
        
        reqTest.write(data);
        reqTest.end();

    } catch(e) { 
        res.status(500).json({ success: false, message: e.message }); 
    }
});

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.get(/(.*)/, (req, res) => res.sendFile(path.join(__dirname, 'frontend/dist/index.html')));

app.listen(PORT, () => console.log(`🚀 VStream Server berjalan di port ${PORT}`));