const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { exec } = require('child_process');

// Load .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7678;

app.use(cors());
app.use(express.json());

// --- API ROUTES (Untuk Komunikasi dengan Frontend) ---

// Contoh API untuk cek status stream
app.get('/api/status', (req, res) => {
    res.json({ status: 'running', message: 'Backend VStream Aktif' });
});

// Contoh API untuk memulai Live (Menjalankan FFmpeg)
app.post('/api/stream/start', (req, res) => {
    const { streamKey, videoFile } = req.body;
    
    // Ini adalah CONTOH command FFmpeg. 
    // Di tahap produksi, ini harus disesuaikan dengan path file yang benar.
    const ffmpegCommand = `ffmpeg -re -i "public/uploads/${videoFile}" -c:v libx264 -preset veryfast -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 -f flv "rtmp://a.rtmp.youtube.com/live2/${streamKey}"`;

    console.log("Memulai stream dengan command:", ffmpegCommand);
    
    // Uncomment di bawah ini jika ingin FFmpeg benar-benar jalan
    /*
    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        console.log(`FFmpeg Output: ${stdout}`);
    });
    */

    res.json({ success: true, message: 'Proses Live Dimulai (Simulasi)' });
});

// --- SERVE FRONTEND (React) ---
// Bagian ini sangat penting agar saat mengetik IP:7678 di browser, muncul App.jsx Anda
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Menggunakan regex /(.*)/ sebagai pengganti string '*' untuk menghindari PathError di Express versi baru
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// --- JALANKAN SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 VStream Server berjalan di port ${PORT}`);
    console.log(`Buka http://localhost:${PORT} di browser Anda`);
});