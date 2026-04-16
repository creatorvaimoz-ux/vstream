import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, PlayCircle, FolderOpen, BarChart2, 
  Settings, Terminal, Moon, Sun, Plus, Upload, 
  Video, RefreshCw, Server, Activity, Users, 
  CheckCircle2, AlertCircle, Clock, Edit, StopCircle, Trash2,
  AlertTriangle, XCircle, ChevronDown, TrendingUp, MessageSquare, ThumbsUp,
  Menu, Image, Monitor, Radio, Calendar, ShieldAlert,
  Wifi, Zap, TerminalSquare, Cpu, Bell, Bot, Send, MessageCircle,
  Cast, Film, LineChart, Sliders, ScrollText, Link as LinkIcon, ListVideo
} from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tugas-live', label: 'Tugas Live', icon: Cast },
    { id: 'media', label: 'Media', icon: Film },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'pengaturan', label: 'Pengaturan', icon: Sliders },
    { id: 'log', label: 'Log', icon: ScrollText },
  ];

  const isPreview = window.location.protocol === 'blob:' || window.location.origin === 'null';
  const API_BASE = isPreview ? 'http://localhost:7678' : '';

  const fetchAccounts = async () => {
    if (isPreview) return;
    try {
      const res = await fetch(`${API_BASE}/api/settings/accounts`);
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error('Gagal mengambil daftar Akun:', e); 
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex flex-col w-full h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden relative">
        
        <header className="shrink-0 bg-white dark:bg-slate-800 relative z-50 flex flex-col shadow-sm dark:shadow-black/20">
          <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-200 dark:border-slate-700/60">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 bg-emerald-500 dark:bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                <PlayCircle className="text-white w-5 h-5" />
              </div>
              <div className="hidden sm:flex flex-col justify-center">
                <h1 className="text-xl font-bold tracking-tight leading-none mb-1">V<span className="text-emerald-600 dark:text-emerald-400">Stream</span></h1>
                <span className="text-[9px] font-bold tracking-widest text-gray-500 dark:text-slate-400 uppercase leading-none">Vaimoz Youtube Stream V.1</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="hidden lg:flex items-center gap-1.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></div>
                Running
              </div>
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors rounded-lg"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="hidden sm:flex w-8 h-8 bg-gray-200 dark:bg-slate-700/80 rounded-full items-center justify-center shrink-0">
                <Users className="w-4 h-4 dark:text-slate-300" />
              </div>
              
              <button 
                className="md:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <XCircle className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <div className="hidden md:block border-b border-gray-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/90 px-4 md:px-6">
            <nav className="flex items-center gap-2 overflow-x-auto py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/40 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700/60 shadow-lg">
            <nav className="flex flex-col p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
        
        {isMobileMenuOpen && (
           <div 
             className="md:hidden absolute inset-0 top-16 z-30 bg-slate-900/50 backdrop-blur-sm"
             onClick={() => setIsMobileMenuOpen(false)}
           ></div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'tugas-live' && <TugasLiveView accounts={accounts} isPreview={isPreview} API_BASE={API_BASE} />}
          {activeTab === 'media' && <MediaView isPreview={isPreview} API_BASE={API_BASE} />}
          {activeTab === 'analytics' && <AnalyticsView accounts={accounts} />}
          {activeTab === 'pengaturan' && <SettingsView accounts={accounts} fetchAccounts={fetchAccounts} isPreview={isPreview} API_BASE={API_BASE} />}
          {activeTab === 'log' && <LogView />}
        </main>
        
      </div>
    </div>
  );
}

function DashboardView() {
  const [streams, setStreams] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(streams.map(s => s.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) setSelectedIds([...selectedIds, id]);
    else setSelectedIds(selectedIds.filter(itemId => itemId !== id));
  };

  const handleDeleteSelected = () => {
    setStreams(streams.filter(s => !selectedIds.includes(s.id)));
    setSelectedIds([]);
  };

  const handleDeleteSingle = (id) => {
    setStreams(streams.filter(s => s.id !== id));
    setSelectedIds(selectedIds.filter(itemId => itemId !== id));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/60 p-2.5 shadow-sm flex items-center justify-between hover:border-emerald-200 dark:hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/15">
              <Activity className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Streaming Aktif</p>
              <p className="text-base font-black text-gray-900 dark:text-slate-100 leading-none">{streams.filter(s => s.statusText === 'Live').length}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> LIVE
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/60 p-2.5 shadow-sm flex items-center justify-between hover:border-blue-200 dark:hover:border-blue-500/40 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-500/15">
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Live Terjadwal</p>
              <p className="text-base font-black text-gray-900 dark:text-slate-100 leading-none">0</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-500/20">
            STANDBY
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/60 shadow-sm p-3 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center justify-between md:flex-col md:items-start md:justify-center md:border-r md:border-gray-100 md:dark:border-slate-700/50 md:pr-4 shrink-0">
          <h3 className="text-[10px] font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1 uppercase tracking-widest">
            <Server className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" /> Resource VPS
          </h3>
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20 mt-0 md:mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> Optimal
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <ProgressBar label="CPU" percentage={0} color="bg-blue-400 dark:bg-blue-500" />
          <ProgressBar label="RAM" percentage={0} color="bg-purple-400 dark:bg-purple-500" />
          <ProgressBar label="Disk" percentage={0} color="bg-yellow-400 dark:bg-amber-400" />
          <ProgressBar 
            label="Bandwidth" 
            percentage={0} 
            color="bg-cyan-400 dark:bg-cyan-500" 
            valueText={<span>0<span className="text-[8px] text-gray-400 dark:text-slate-500 font-normal ml-0.5">GB</span></span>}
            subText="Kmrn: 0 GB"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/50">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Daftar Live Streaming
          </h3>
          
          {selectedIds.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-rose-500/15 text-red-600 dark:text-rose-400 hover:bg-red-100 dark:hover:bg-rose-500/25 rounded-md text-xs font-medium border border-red-100 dark:border-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus ({selectedIds.length})
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto w-full pb-2">
          <table className="w-full text-left min-w-[850px]">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700/60">
                <th className="px-5 py-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-emerald-500 dark:text-emerald-500 focus:ring-emerald-500 dark:focus:ring-emerald-500 transition-colors cursor-pointer bg-white dark:bg-slate-900" 
                    onChange={handleSelectAll}
                    checked={streams.length > 0 && selectedIds.length === streams.length}
                  />
                </th>
                <th className="px-5 py-3">Informasi Stream</th>
                <th className="px-5 py-3">Kualitas Output</th>
                <th className="px-5 py-3">Performa</th>
                <th className="px-5 py-3">Status Sistem</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {streams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                    Tidak ada tugas streaming yang sedang berjalan.
                  </td>
                </tr>
              ) : (
                streams.map((stream) => (
                  <tr key={stream.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-5 py-4 align-middle text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-emerald-500 dark:text-emerald-500 focus:ring-emerald-500 dark:focus:ring-emerald-500 transition-colors cursor-pointer bg-white dark:bg-slate-900"
                        checked={selectedIds.includes(stream.id)}
                        onChange={(e) => handleSelectOne(e, stream.id)}
                      />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="font-semibold text-sm text-gray-900 dark:text-slate-100 leading-tight">{stream.channel}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" /> {stream.task}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700/60 text-xs font-mono text-gray-600 dark:text-slate-300">
                        <Monitor className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                        <span>{stream.resolution}</span>
                        <span className="text-gray-300 dark:text-slate-600">•</span>
                        <span>{stream.fps}fps</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-300">
                         <div className="flex items-center gap-1.5" title="Viewers">
                           <Users className="w-4 h-4 text-gray-400 dark:text-slate-500" /> {stream.viewer}
                         </div>
                         <div className="flex items-center gap-1.5 font-mono text-xs" title="Uptime">
                           <Clock className="w-4 h-4 text-gray-400 dark:text-slate-500" /> {stream.uptime}
                         </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          {stream.statusText === 'Live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 dark:bg-emerald-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${stream.statusText === 'Live' ? 'bg-emerald-500 dark:bg-emerald-500' : stream.statusText === 'Starting' ? 'bg-blue-500' : 'bg-gray-400 dark:bg-slate-600'}`}></span>
                        </span>
                        
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium leading-none ${stream.statusText === 'Live' ? 'text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-400'}`}>
                            {stream.statusText}
                          </span>
                          <span className={`text-[11px] mt-1 ${stream.condType === 'success' ? 'text-emerald-600 dark:text-emerald-400' : stream.condType === 'warning' ? 'text-yellow-600 dark:text-amber-400' : stream.condType === 'error' ? 'text-red-600 dark:text-rose-400' : 'text-gray-500 dark:text-slate-500'}`}>
                            {stream.condTitle}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-right">
                      <TableRowMenu onDelete={() => handleDeleteSingle(stream.id)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TugasLiveView({ accounts, isPreview, API_BASE }) {
  const [streamKeyMode, setStreamKeyMode] = useState('Manual Input Key'); // Default ke manual untuk saat ini
  const [manualStreamKey, setManualStreamKey] = useState(''); // State untuk menangkap Stream Key pengguna
  const [isStarting, setIsStarting] = useState(false); // State loading saat memanggil FFmpeg

  const [videoMode, setVideoMode] = useState('Satu Video (Looping)');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [isVideoDropdownOpen, setIsVideoDropdownOpen] = useState(false);
  const [jadwalMode, setJadwalMode] = useState('manual');
  const [thumbnailMode, setThumbnailMode] = useState('random');

  const [enableFallback, setEnableFallback] = useState(false);
  const [scheduleGrid, setScheduleGrid] = useState({
    Senin: { active: true, start: '08:00', end: '22:00' },
    Selasa: { active: true, start: '08:00', end: '22:00' },
    Rabu: { active: true, start: '08:00', end: '22:00' },
    Kamis: { active: true, start: '08:00', end: '22:00' },
    Jumat: { active: true, start: '08:00', end: '22:00' },
    Sabtu: { active: false, start: '09:00', end: '20:00' },
    Minggu: { active: false, start: '09:00', end: '20:00' }
  });

  const [availableVideos, setAvailableVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (isPreview) return;
    
    // Ambil Data Video
    fetch(`${API_BASE}/api/media`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setAvailableVideos(data.map(d => d.name));
      })
      .catch(e => console.log(e));
      
    // Ambil Data Playlist  
    fetch(`${API_BASE}/api/playlists`)
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setPlaylists(data);
      })
      .catch(e => console.log(e));
  }, [API_BASE, isPreview]);

  const handleVideoSelection = (item) => {
    if (videoMode === 'Satu Video (Looping)' || videoMode === 'Play Playlist (Berurutan)') {
      setSelectedVideos([item]);
      setIsVideoDropdownOpen(false);
    } else {
      if (selectedVideos.includes(item)) {
        setSelectedVideos(selectedVideos.filter(v => v !== item));
      } else {
        setSelectedVideos([...selectedVideos, item]);
      }
    }
  };

  // FUNGSI UTAMA: MENYALAKAN FFMPEG KE BACKEND
  const handleStartLive = async () => {
    if (selectedVideos.length === 0) return alert('⚠️ Pilih minimal 1 video atau playlist dari Manajemen Media!');
    
    let keyToUse = manualStreamKey;
    if (streamKeyMode === 'Otomatis (API v3)') {
        return alert('⏳ Mode Otomatis (API v3) sedang dalam integrasi final. \n\n👉 Silakan ubah Dropdown "Stream Key Mode" ke "Manual Input Key" dan masukkan Stream Key Anda.');
    }

    if (!keyToUse) return alert('⚠️ Stream Key tidak boleh kosong!');

    if (isPreview) return alert('🖥️ Simulasi Tampilan: Perintah FFmpeg dikirim ke server!');

    setIsStarting(true);
    try {
        const res = await fetch(`${API_BASE}/api/stream/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                streamKey: keyToUse,
                videoPath: selectedVideos[0], // Mengirim video/playlist terpilih
                isLoop: videoMode === 'Satu Video (Looping)'
            })
        });
        const data = await res.json();
        if (data.success) {
            alert(`✅ ${data.message}`);
        } else {
            alert(`❌ Gagal: ${data.message}`);
        }
    } catch (e) {
        alert('❌ Gagal terhubung ke server untuk memulai stream.');
    } finally {
        setIsStarting(false);
    }
  };

  const inputClassName = "w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50 text-sm transition-all dark:text-slate-200 dark:placeholder-slate-500";
  const labelClassName = "block text-sm font-semibold mb-1.5 text-gray-700 dark:text-slate-300";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-4 mb-5 text-gray-800 dark:text-slate-100">
              <PlayCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Pengaturan Stream Utama
            </h3>
            
            <div className="flex flex-col gap-5 bg-gray-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
              <div>
                <label className={labelClassName}>Nama Tugas Live</label>
                <input type="text" placeholder="Misal: Live Berita Pagi Loop" className={inputClassName} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                   <label className={labelClassName}>Mode Video</label>
                   <select 
                     className={inputClassName}
                     value={videoMode}
                     onChange={(e) => {
                       setVideoMode(e.target.value);
                       setSelectedVideos([]); 
                     }}
                   >
                    <option value="Play Playlist (Berurutan)">Play Playlist (Berurutan)</option>
                    <option value="Acak Video Setiap Hari">Acak Video Setiap Hari</option>
                    <option value="Satu Video (Looping)">Satu Video (Looping)</option>
                  </select>
                </div>
                <div>
                   <label className={labelClassName}>Stream Key Mode</label>
                   <select 
                     className={inputClassName}
                     value={streamKeyMode}
                     onChange={(e) => setStreamKeyMode(e.target.value)}
                   >
                    <option value="Manual Input Key">Manual Input Key</option>
                    <option value="Otomatis (API v3)">Otomatis (API v3)</option>
                  </select>
                </div>
              </div>
              
              <div className="relative">
                <label className={labelClassName}>
                  {videoMode === 'Play Playlist (Berurutan)' ? 'Pilih Playlist dari Manajemen Media' : 'Pilih Video dari Manajemen Media'}
                </label>
                
                {isVideoDropdownOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setIsVideoDropdownOpen(false)}></div>
                )}

                <div 
                  className="min-h-[44px] w-full bg-white dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 cursor-pointer focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-500/50 flex flex-wrap gap-2 items-center relative z-40 transition-all shadow-sm"
                  onClick={() => setIsVideoDropdownOpen(!isVideoDropdownOpen)}
                >
                  {selectedVideos.length === 0 ? (
                    <span className="text-sm text-gray-400 dark:text-slate-500 flex items-center gap-2 px-1">
                      {videoMode === 'Play Playlist (Berurutan)' ? <ListVideo className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      Klik untuk memilih {videoMode === 'Play Playlist (Berurutan)' ? 'playlist' : 'video'}...
                    </span>
                  ) : (
                    selectedVideos.map(vid => (
                      <span key={vid} className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-500/20">
                        {videoMode === 'Play Playlist (Berurutan)' ? <ListVideo className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        {vid}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleVideoSelection(vid); }}
                          className="hover:text-emerald-900 dark:hover:text-white ml-1 opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                  <div className="ml-auto pr-1">
                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform ${isVideoDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isVideoDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/60 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-700/60 z-10 flex justify-between items-center text-xs text-gray-500 dark:text-slate-400 px-3">
                      <span>Daftar {videoMode === 'Play Playlist (Berurutan)' ? 'Playlist' : 'Media'} Tersedia</span>
                      <span>{selectedVideos.length} Terpilih</span>
                    </div>
                    
                    {videoMode === 'Play Playlist (Berurutan)' ? (
                      playlists.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">
                          Belum ada playlist. Silakan buat di menu Media.
                        </div>
                      ) : (
                        playlists.map((pl, idx) => {
                          const isSelected = selectedVideos.includes(pl.name);
                          return (
                            <div 
                              key={idx}
                              onClick={() => handleVideoSelection(pl.name)}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors ${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-500/10' : ''}`}
                            >
                              <input 
                                type="radio" 
                                checked={isSelected}
                                readOnly
                                className="w-4 h-4 text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500 dark:focus:ring-emerald-500 rounded-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600"
                              />
                              <ListVideo className={`w-4 h-4 ${isSelected ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`} />
                              <div className="flex-1 overflow-hidden">
                                 <span className={`text-sm block truncate ${isSelected ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}>
                                   {pl.name}
                                 </span>
                                 <span className="text-[10px] text-gray-400">{pl.count} video</span>
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
                            </div>
                          );
                        })
                      )
                    ) : (
                      availableVideos.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">
                          Belum ada video. Silakan upload di menu Media.
                        </div>
                      ) : (
                        availableVideos.map((vid, idx) => {
                          const isSelected = selectedVideos.includes(vid);
                          return (
                            <div 
                              key={idx}
                              onClick={() => handleVideoSelection(vid)}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors ${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-500/10' : ''}`}
                            >
                              <input 
                                type={videoMode === 'Satu Video (Looping)' ? 'radio' : 'checkbox'} 
                                checked={isSelected}
                                readOnly
                                className="w-4 h-4 text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500 dark:focus:ring-emerald-500 rounded-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600"
                              />
                              <Video className={`w-4 h-4 ${isSelected ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`} />
                              <span className={`text-sm flex-1 truncate ${isSelected ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}>
                                {vid}
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
                            </div>
                          );
                        })
                      )
                    )}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2.5 flex items-start gap-1.5 px-1">
                  <AlertCircle className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400" />
                  {videoMode === 'Satu Video (Looping)' 
                    ? 'Mode Looping: Hanya mengizinkan pemilihan 1 video utama.' 
                    : videoMode === 'Play Playlist (Berurutan)'
                    ? 'Mode Playlist: Pilih 1 playlist yang telah Anda simpan di menu Media.'
                    : 'Pilih beberapa video. Sistem akan menggabungkan otomatis.'}
                </p>
              </div>

              {/* TAMPILAN MANUAL INPUT KEY */}
              {streamKeyMode === 'Manual Input Key' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-gray-200 dark:border-slate-700/60">
                  <label className="block text-sm font-bold mb-1.5 text-red-600 dark:text-rose-400">Masukkan Stream Key (Manual)</label>
                  <input 
                    type="password" 
                    placeholder="xxxx-xxxx-xxxx-xxxx-xxxx" 
                    value={manualStreamKey}
                    onChange={(e) => setManualStreamKey(e.target.value)}
                    className={`${inputClassName} border-red-300 dark:border-rose-500/50 focus:border-red-500 dark:focus:border-rose-500 focus:ring-red-500/50 dark:focus:ring-rose-500/50 font-mono`} 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-4 mb-5 text-gray-800 dark:text-slate-100">
              <LayoutDashboard className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Metadata YouTube Studio
            </h3>
            
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClassName}>Pilih Channel</label>
                  <select className={inputClassName}>
                    <option value="">-- Pilih Channel Aktif --</option>
                    {accounts?.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClassName}>Kategori</label>
                  <select className={inputClassName}>
                    <option>News & Politics</option>
                    <option>Gaming</option>
                    <option>Entertainment</option>
                    <option>Music</option>
                    <option>People & Blogs</option>
                    <option>Education</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Judul Video <span className="text-xs text-gray-400 dark:text-slate-500 font-normal ml-1 font-mono">(Spintax Supported)</span></label>
                <input type="text" placeholder="{Live|Update} Judul Video Anda..." className={`${inputClassName} font-mono`} />
              </div>

              <div>
                <label className={labelClassName}>Deskripsi <span className="text-xs text-gray-400 dark:text-slate-500 font-normal ml-1 font-mono">(Spintax Supported)</span></label>
                <textarea rows="3" placeholder="Deskripsi video stream..." className={`${inputClassName} font-mono resize-none`}></textarea>
              </div>

              <div>
                <label className={labelClassName}>Tag Video <span className="text-xs text-gray-400 dark:text-slate-500 font-normal ml-1">(Pisahkan dengan koma)</span></label>
                <input type="text" placeholder="berita, live stream, update" className={`${inputClassName} font-mono`} />
              </div>

              <div className="mt-2 bg-gray-50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-200 dark:border-slate-700/50">
                <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500 dark:text-slate-400" /> Aturan Publikasi & Visibilitas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Status Setelah Live</label>
                    <select className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm dark:text-slate-200">
                      <option value="public">Publik</option>
                      <option value="unlisted">Tidak Publik (Unlisted)</option>
                      <option value="private">Privat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Konten Sintetis (AI)</label>
                    <select className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm dark:text-slate-200">
                      <option value="no">Tidak (Konten Asli)</option>
                      <option value="yes">Ya (Menggunakan AI)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Monetisasi (Ads)</label>
                    <select className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm dark:text-slate-200">
                      <option value="on">Aktif (On)</option>
                      <option value="off">Tidak Aktif (Off)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Playlist Target</label>
                    <select className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm truncate dark:text-slate-200">
                      <option value="none">-- Jangan tambahkan --</option>
                    </select>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-4 mb-5 text-gray-800 dark:text-slate-100">
              <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Jadwal Live
            </h3>
            
            <div className="flex flex-wrap bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl gap-1 mb-5">
              {['manual', 'sekali', 'harian', 'smart-weekly'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setJadwalMode(mode)}
                  className={`flex-1 min-w-[80px] text-[13px] py-2 px-2 rounded-lg font-semibold transition-all ${
                    jadwalMode === mode 
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-black/20' 
                      : 'text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {mode === 'smart-weekly' ? 'Mingguan' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 mb-5">
              {jadwalMode === 'manual' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Waktu Mulai Manual</label></div>
                  <input type="time" className={inputClassName} />
                  <input type="date" className={`${inputClassName} text-gray-500 dark:text-slate-400`} />
                </div>
              )}

              {jadwalMode === 'sekali' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Jadwal Satu Kali</label></div>
                  <input type="time" className={inputClassName} />
                  <input type="date" className={`${inputClassName} text-gray-500 dark:text-slate-400`} />
                </div>
              )}

              {jadwalMode === 'harian' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Jam Mulai Harian</label></div>
                  <input type="time" className={inputClassName} />
                  <input type="date" className={`${inputClassName} text-gray-500 dark:text-slate-400`} />
                </div>
              )}

              {jadwalMode === 'smart-weekly' && (
                <div className="border border-gray-200 dark:border-slate-600/60 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 px-4 py-2.5 border-b border-gray-200 dark:border-slate-600/60 flex items-center justify-between">
                    <span className="font-semibold text-[13px] text-blue-800 dark:text-blue-300">Kalender Visual (WIB)</span>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-slate-700/50 max-h-52 overflow-y-auto custom-scrollbar">
                    {Object.keys(scheduleGrid).map(day => (
                      <div key={day} className={`flex items-center justify-between p-2.5 gap-3 transition-colors ${scheduleGrid[day].active ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-slate-900/20'}`}>
                        <label className="flex items-center gap-2 cursor-pointer w-24">
                          <input 
                            type="checkbox" 
                            checked={scheduleGrid[day].active} 
                            onChange={() => setScheduleGrid({...scheduleGrid, [day]: {...scheduleGrid[day], active: !scheduleGrid[day].active}})}
                            className="w-4 h-4 rounded text-blue-600 dark:text-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 cursor-pointer" 
                          />
                          <span className={`text-[13px] ${scheduleGrid[day].active ? 'font-bold text-gray-900 dark:text-slate-100' : 'font-medium text-gray-400 dark:text-slate-500'}`}>{day}</span>
                        </label>
                        
                        <div className={`flex items-center gap-1.5 flex-1 ${scheduleGrid[day].active ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                          <input 
                            type="time" 
                            value={scheduleGrid[day].start} 
                            onChange={(e) => setScheduleGrid({...scheduleGrid, [day]: {...scheduleGrid[day], start: e.target.value}})}
                            className="bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1 text-xs w-full outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-slate-200" 
                          />
                          <span className="text-gray-400 dark:text-slate-500 text-xs">-</span>
                          <input 
                            type="time" 
                            value={scheduleGrid[day].end} 
                            onChange={(e) => setScheduleGrid({...scheduleGrid, [day]: {...scheduleGrid[day], end: e.target.value}})}
                            className="bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1 text-xs w-full outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-slate-200" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {jadwalMode !== 'smart-weekly' && (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-gray-100 dark:border-slate-700/50">
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Stop Otomatis</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1">
                    <input type="number" defaultValue={jadwalMode === 'harian' ? 12 : 0} min="0" className="w-8 bg-transparent outline-none text-sm text-center font-mono dark:text-slate-200" />
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Jam</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1">
                    <input type="number" defaultValue="0" min="0" max="59" className="w-8 bg-transparent outline-none text-sm text-center font-mono dark:text-slate-200" />
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Menit</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-4 mb-5 text-gray-800 dark:text-slate-100">
              <Cpu className="w-5 h-5 text-purple-500 dark:text-purple-400" /> Encoder & Output
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClassName}>Engine Encoder</label>
                <select className={inputClassName}>
                  <option value="copy">Direct Copy (Ringan)</option>
                  <option value="x264">x264 (Software)</option>
                  <option value="nvenc">NVENC (NVIDIA GPU)</option>
                  <option value="qsv">QuickSync (Intel)</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Resolusi Output</label>
                <select className={inputClassName}>
                  <option value="source">Sesuai Source (Asli)</option>
                  <option value="2160p60">4K (2160p) 60FPS</option>
                  <option value="2160p30">4K (2160p) 30FPS</option>
                  <option value="1440p60">2K (1440p) 60FPS</option>
                  <option value="1440p30">2K (1440p) 30FPS</option>
                  <option value="1080p60">1080p 60FPS</option>
                  <option value="1080p30">1080p 30FPS</option>
                  <option value="720p60">720p 60FPS</option>
                  <option value="720p30">720p 30FPS</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-4 mb-5 text-gray-800 dark:text-slate-100">
              <Image className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Pengaturan Thumbnail
            </h3>
            
            <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl gap-1 mb-5 w-full max-w-sm">
              {['single', 'random'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setThumbnailMode(mode)}
                  className={`flex-1 text-[13px] py-2 px-3 rounded-lg font-semibold transition-all ${
                    thumbnailMode === mode 
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-black/20' 
                      : 'text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {mode === 'single' ? 'Single Image' : 'Random Folder'}
                </button>
              ))}
            </div>

            <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-slate-600/60 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer group">
              <Upload className="w-8 h-8 text-gray-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 mb-3 transition-colors" />
              <p className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">
                {thumbnailMode === 'single' ? 'Pilih 1 File Gambar' : 'Pilih Folder Thumbnail'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Seret dan lepas (Drag & Drop) di sini</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-amber-900/30 text-orange-600 dark:text-amber-500 rounded-lg shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-slate-100">Fallback Protection</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Mencegah stream mati mendadak</p>
                  </div>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={enableFallback} onChange={() => setEnableFallback(!enableFallback)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500 dark:peer-checked:bg-amber-500"></div>
               </label>
            </div>
            
            {enableFallback && (
               <div className="bg-orange-50/60 dark:bg-amber-900/10 border border-orange-200 dark:border-amber-800/40 rounded-xl p-4 mt-5 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold mb-2 text-orange-800 dark:text-amber-400 uppercase tracking-wider">Video Loop Pengganti (Saat Error)</label>
                  <select className="w-full bg-white dark:bg-slate-900/50 border border-orange-200 dark:border-amber-800/50 rounded-lg px-3 py-2.5 outline-none focus:border-orange-500 dark:focus:border-amber-500 text-sm font-medium transition-colors dark:text-slate-200">
                    <option value="">-- Pilih Video Fallback --</option>
                  </select>
               </div>
            )}
          </div>

        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
         <div className="flex items-center gap-4 w-full sm:w-auto">
           <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
             <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
           </div>
           <div>
             <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-0.5">Status Tugas Live</p>
             <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Siap Dieksekusi</p>
           </div>
         </div>
         
         <div className="flex w-full sm:w-auto gap-3">
           <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600/60 hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200 font-semibold transition-colors text-sm">
             Simpan Draft
           </button>
           <button 
             onClick={handleStartLive}
             disabled={isStarting}
             className="flex-1 sm:flex-none px-8 py-2.5 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/20 disabled:opacity-50"
           >
             <PlayCircle className="w-5 h-5" /> {isStarting ? 'Memulai FFmpeg...' : 'Mulai Live Sekarang'}
           </button>
         </div>
      </div>

    </div>
  );
}

function MediaView({ isPreview, API_BASE }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadText, setUploadText] = useState('');
  
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showImportUrlModal, setShowImportUrlModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylistVideos, setSelectedPlaylistVideos] = useState([]);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [activeFolder, setActiveFolder] = useState('Video Berita Utama');
  
  const [editingFile, setEditingFile] = useState(null);
  const [editFileName, setEditFileName] = useState('');
  const [fileToDelete, setFileToDelete] = useState(null);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    if (isPreview) return;
    try {
      const res = await fetch(`${API_BASE}/api/media`);
      const data = await res.json();
      setMediaFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlaylists = async () => {
    if (isPreview) return;
    try {
      const res = await fetch(`${API_BASE}/api/playlists`);
      const data = await res.json();
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMedia();
    fetchPlaylists();
  }, [API_BASE, isPreview]);

  const handleActualUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (isPreview) {
      alert('Simulasi (Layar Preview): File video/media berhasil dipilih.');
      return;
    }

    setIsUploading(true);
    setUploadText('Mengunggah ke VPS...');
    setUploadProgress(10);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const res = await fetch(`${API_BASE}/api/media/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if(data.success) {
        setUploadProgress(100);
        setTimeout(() => {
           alert(data.message);
           setIsUploading(false);
           setUploadProgress(0);
           fetchMedia();
        }, 500);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert('Gagal mengunggah file.');
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportUrlSubmit = async () => {
    if (!importUrl.trim()) return alert('URL tidak boleh kosong.');
    if (isPreview) {
       alert('Simulasi: Import URL sedang berjalan.');
       setShowImportUrlModal(false);
       setImportUrl('');
       return;
    }

    setShowImportUrlModal(false);
    setIsUploading(true);
    setUploadText('Mengunduh file dari URL...');
    setUploadProgress(10);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 5, 90));
    }, 1000);

    try {
      const res = await fetch(`${API_BASE}/api/media/import-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });
      const data = await res.json();
      
      if(data.success) {
        setUploadProgress(100);
        setTimeout(() => {
           alert(data.message);
           setIsUploading(false);
           setUploadProgress(0);
           setImportUrl('');
           fetchMedia();
        }, 500);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert(err.message || 'Gagal mengimpor file dari URL.');
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleSavePlaylist = async () => {
    if (!newPlaylistName.trim() || selectedPlaylistVideos.length === 0) {
      return alert('Nama playlist dan minimal 1 video harus diisi/dipilih.');
    }

    if (isPreview) {
      alert('Simulasi: Playlist berhasil disimpan.');
      setShowPlaylistModal(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName, videos: selectedPlaylistVideos })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        setShowPlaylistModal(false);
        setNewPlaylistName('');
        setSelectedPlaylistVideos([]);
        fetchPlaylists();
        setActiveFolder('Playlist Looping');
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('Gagal menyimpan playlist ke server.');
    }
  };

  const confirmDeleteFile = async () => {
    if (isPreview) {
      setMediaFiles(mediaFiles.filter(f => f.id !== fileToDelete.id));
      setFileToDelete(null);
      return;
    }
    try {
      await fetch(`${API_BASE}/api/media/${fileToDelete.name}`, { method: 'DELETE' });
      fetchMedia();
      setFileToDelete(null);
    } catch(e) {
      alert('Gagal menghapus file.');
    }
  };

  const confirmDeletePlaylist = async () => {
    if (isPreview) {
      setPlaylists(playlists.filter(p => p.id !== playlistToDelete.id));
      setPlaylistToDelete(null);
      return;
    }
    try {
      await fetch(`${API_BASE}/api/playlists/${playlistToDelete.id}`, { method: 'DELETE' });
      fetchPlaylists();
      setPlaylistToDelete(null);
    } catch(e) {
      alert('Gagal menghapus playlist.');
    }
  };

  const toggleVideoForPlaylist = (vid) => {
    if (selectedPlaylistVideos.includes(vid)) {
      setSelectedPlaylistVideos(selectedPlaylistVideos.filter(v => v !== vid));
    } else {
      setSelectedPlaylistVideos([...selectedPlaylistVideos, vid]);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm overflow-hidden relative">
      <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/50 shrink-0">
        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <Film className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          Manajemen Media & Playlist
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowImportUrlModal(true)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-500/50 dark:hover:text-blue-400 text-gray-600 dark:text-slate-300 rounded-md flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase transition-colors shadow-sm"
          >
            <LinkIcon className={`w-3.5 h-3.5`} /> Import URL
          </button>
          
          <input 
             type="file" 
             multiple 
             accept="video/mp4,video/mkv,image/*" 
             className="hidden" 
             ref={fileInputRef} 
             onChange={handleActualUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase hover:opacity-90 transition-opacity shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Lokal
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="px-5 py-2 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30 flex items-center gap-4 shrink-0">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest w-48 truncate">{uploadText}</span>
          <div className="flex-1 h-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-60 flex flex-col border-r border-gray-100 dark:border-slate-700/60 bg-gray-50/30 dark:bg-slate-900/30 shrink-0">
          <div className="p-3 flex-1 overflow-y-auto space-y-0.5 custom-scrollbar">
            <div className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-2 pb-2 pt-1">Direktori Penyimpanan</div>
            <div onClick={() => setActiveFolder('Video Berita Utama')}>
               <FolderItem name="Semua Video / Media" count={mediaFiles.length} active={activeFolder === 'Video Berita Utama'} />
            </div>
            <div onClick={() => setActiveFolder('Playlist Looping')}>
               <FolderItem name="Playlist Tersimpan" count={playlists.length} active={activeFolder === 'Playlist Looping'} />
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-100 dark:border-slate-700/60 space-y-1.5 bg-white dark:bg-slate-800/50 shrink-0">
            <button 
              onClick={() => setShowPlaylistModal(true)}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-md transition-colors flex items-center gap-2 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Playlist Baru
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-800 p-5 overflow-y-auto relative custom-scrollbar">
          
          {/* TAMPILAN JIKA FOLDER VIDEO DIPILIH */}
          {activeFolder === 'Video Berita Utama' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {mediaFiles.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 h-40 border border-dashed border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-900/20">
                  <FolderOpen className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">Folder Media Kosong</span>
                  <p className="text-xs mt-1">Gunakan Upload Lokal atau Import URL untuk menambah video.</p>
                </div>
              ) : (
                mediaFiles.map((file) => (
                  <VideoFile 
                    key={file.id} 
                    name={file.name} 
                    size={file.size} 
                    onEdit={() => {}}
                    onDelete={() => setFileToDelete(file)}
                  />
                ))
              )}
            </div>
          )}

          {/* TAMPILAN JIKA FOLDER PLAYLIST DIPILIH */}
          {activeFolder === 'Playlist Looping' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {playlists.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 h-40 border border-dashed border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-900/20">
                  <ListVideo className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">Belum Ada Playlist</span>
                  <p className="text-xs mt-1">Klik tombol 'Buat Playlist Baru' di menu samping.</p>
                </div>
              ) : (
                playlists.map((pl) => (
                  <div key={pl.id} className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700/60 rounded-xl p-4 shadow-sm hover:shadow transition-shadow group relative">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0">
                         <ListVideo className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{pl.name}</h4>
                         <p className="text-xs text-gray-500 dark:text-slate-400">{pl.count} Video di dalam antrean</p>
                       </div>
                    </div>
                    <div className="space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700/50 max-h-24 overflow-y-auto custom-scrollbar">
                       {pl.videos.map((vid, idx) => (
                         <div key={idx} className="text-[11px] text-gray-600 dark:text-slate-300 flex items-center gap-2 truncate">
                            <span className="text-gray-400">{idx+1}.</span> {vid}
                         </div>
                       ))}
                    </div>
                    <button 
                      onClick={() => setPlaylistToDelete(pl)}
                      className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-gray-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus Playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL IMPORT URL */}
      {showImportUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowImportUrlModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl shadow-black/40 overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60 flex justify-between items-center bg-gray-50 dark:bg-slate-800/80">
              <h3 className="text-lg font-bold dark:text-slate-100 flex items-center gap-2">
                 <LinkIcon className="w-5 h-5 text-blue-500" /> Import File dari URL
              </h3>
              <button onClick={() => setShowImportUrlModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Direct Link (URL Langsung)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="Paste link Google Drive di sini..." 
                  className="w-full bg-white dark:bg-slate-900/80 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-slate-200 font-mono text-sm pr-10 shadow-sm transition-all" 
                  autoFocus
                />
                {importUrl && (
                  <button onClick={() => setImportUrl('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="mt-3 text-[11px] text-gray-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                 <strong>Perhatian:</strong> Server VPS akan mengunduh langsung dari tautan tersebut. Pastikan file GDrive Anda disetting <strong>"Siapa saja memiliki link" (Public)</strong>.
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/60 bg-gray-50 dark:bg-slate-800/80 flex justify-end gap-3">
              <button 
                onClick={() => setShowImportUrlModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600/60 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button 
                onClick={handleImportUrlSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Mulai Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Playlist Baru */}
      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/40 overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60 flex justify-between items-center bg-gray-50 dark:bg-slate-800/80">
              <h3 className="text-lg font-bold dark:text-slate-100">Buat Playlist Baru</h3>
              <button 
                onClick={() => setShowPlaylistModal(false)}
                className="text-gray-400 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-slate-300">Nama Playlist</label>
                <input 
                  type="text" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Misal: Playlist Berita Malam" 
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 dark:text-slate-200" 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium dark:text-slate-300">Pilih Video untuk Playlist</label>
                  <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 px-2 py-1 rounded-md font-medium">
                    {selectedPlaylistVideos.length} Terpilih
                  </span>
                </div>
                <div className="border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 dark:bg-slate-900/30 px-4 py-2 border-b border-gray-200 dark:border-slate-700/60 text-xs font-medium text-gray-500 dark:text-slate-400">
                    Daftar Video di Media (Bisa dipilih banyak)
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {mediaFiles.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-500 dark:text-slate-400">Belum ada video tersedia. Silakan upload terlebih dahulu.</div>
                    ) : (
                      mediaFiles.filter(f => f.name.toLowerCase().endsWith('.mp4') || f.name.toLowerCase().endsWith('.mkv')).map((file) => {
                        const isSelected = selectedPlaylistVideos.includes(file.name);
                        return (
                          <label 
                            key={file.id} 
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border ${isSelected ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-700/40'}`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleVideoForPlaylist(file.name)}
                              className="w-4 h-4 text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500 dark:focus:ring-emerald-500 cursor-pointer rounded-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600"
                            />
                            <Video className={`w-4 h-4 ${isSelected ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`} />
                            <span className={`text-sm flex-1 truncate ${isSelected ? 'font-medium text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-slate-300'}`}>
                              {file.name}
                            </span>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/60 bg-gray-50 dark:bg-slate-800/80 flex justify-end gap-3">
              <button 
                onClick={() => setShowPlaylistModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600/60 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button 
                className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                onClick={handleSavePlaylist}
              >
                Simpan Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Media */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-2xl shadow-black/40 overflow-hidden border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60 flex justify-between items-center bg-gray-50 dark:bg-slate-800/80">
              <h3 className="text-lg font-bold dark:text-slate-100">Edit Metadata File</h3>
              <button 
                onClick={() => setEditingFile(null)}
                className="text-gray-400 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Nama File Baru</label>
              <input 
                type="text" 
                value={editFileName}
                onChange={(e) => setEditFileName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 font-mono text-sm dark:text-slate-200" 
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/60 bg-gray-50 dark:bg-slate-800/80 flex justify-end gap-3">
              <button 
                onClick={() => setEditingFile(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600/60 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus File */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-2xl shadow-black/40 overflow-hidden border border-gray-200 dark:border-slate-700 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-rose-500/15 text-red-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2 dark:text-slate-100">Hapus Media?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 break-all">
              File <strong className="dark:text-slate-200">{fileToDelete.name}</strong> akan dihapus permanen.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setFileToDelete(null)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600/60 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 text-sm font-medium">Batal</button>
              <button onClick={confirmDeleteFile} className="px-4 py-2 bg-red-600 dark:bg-rose-500 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Playlist */}
      {playlistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-2xl shadow-black/40 overflow-hidden border border-gray-200 dark:border-slate-700 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-rose-500/15 text-red-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2 dark:text-slate-100">Hapus Playlist?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 break-all">
              Playlist <strong className="dark:text-slate-200">{playlistToDelete.name}</strong> akan dihapus. Video aslinya tidak akan terhapus.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setPlaylistToDelete(null)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600/60 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 text-sm font-medium">Batal</button>
              <button onClick={confirmDeletePlaylist} className="px-4 py-2 bg-red-600 dark:bg-rose-500 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsView({ accounts }) {
  const topStreams = []; 

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700/60 gap-4 shadow-sm">
         <div className="flex flex-wrap gap-4">
           <select className="bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2 outline-none text-sm font-medium focus:border-emerald-500 dark:focus:border-emerald-400 dark:text-slate-200">
              <option value="all">Semua Channel (Keseluruhan)</option>
              {accounts?.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
           </select>
           <select className="bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2 outline-none text-sm font-medium focus:border-emerald-500 dark:focus:border-emerald-400 dark:text-slate-200">
              <option>Hari Ini (Live)</option>
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
           </select>
         </div>
         <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2 bg-green-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-emerald-800/30">
            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-emerald-400 animate-pulse"></div>
            Sinkronisasi API: Real-time
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Jam Tayang</p>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">0 <span className="text-sm font-medium text-gray-500 dark:text-slate-500">Jam</span></h4>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 font-medium mt-2">
            Menunggu data stream...
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Penonton Unik</p>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">0</h4>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 font-medium mt-2">
            Menunggu data stream...
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Rata-rata Durasi Tonton</p>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">0:00 <span className="text-sm font-medium text-gray-500 dark:text-slate-500">Menit</span></h4>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-amber-900/20 text-yellow-600 dark:text-amber-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 font-medium mt-2">
            Menunggu data stream...
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Interaksi Live (Chat/Like)</p>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">0 <span className="text-sm font-medium text-gray-500 dark:text-slate-500">/ Menit</span></h4>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 font-medium mt-2">
            Menunggu interaksi...
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold dark:text-slate-100">Grafik Penonton Bersamaan (CCV)</h3>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 dark:bg-slate-700/50 dark:text-slate-400 px-2.5 py-1 rounded-md border border-transparent dark:border-slate-600">Menunggu Data</span>
          </div>
          <div className="flex-1 border-b border-l border-gray-200 dark:border-slate-700/60 relative min-h-[200px] mt-4 flex items-center justify-center">
            
            <p className="text-sm text-gray-400 dark:text-slate-500">Belum ada data grafik untuk ditampilkan.</p>
            
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
              <div className="border-t border-gray-400 dark:border-slate-400 w-full"></div>
              <div className="border-t border-gray-400 dark:border-slate-400 w-full"></div>
              <div className="border-t border-gray-400 dark:border-slate-400 w-full"></div>
              <div className="border-t border-gray-400 dark:border-slate-400 w-full"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-slate-400 mt-3 px-1">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">Performa Live Tertinggi</h3>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {topStreams.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-400 dark:text-slate-500">Belum ada aktivitas live.</p>
              </div>
            ) : (
              topStreams.map((stream, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-900/50 dark:text-slate-400'}`}>
                    #{i+1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-semibold truncate dark:text-slate-200">{stream.title}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{stream.channel}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1 justify-end">
                      <Users className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" /> {stream.view}
                    </div>
                    <div className={`text-[10px] font-medium flex items-center justify-end gap-0.5 ${stream.trend === 'up' ? 'text-green-500 dark:text-emerald-400' : 'text-red-500 dark:text-rose-400'}`}>
                      <TrendingUp className={`w-3 h-3 ${stream.trend === 'down' ? 'rotate-180' : ''}`} />
                      {stream.trend === 'up' ? 'Naik' : 'Turun'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ accounts, fetchAccounts, isPreview, API_BASE }) {
  const [notifPlatform, setNotifPlatform] = useState('telegram');
  const [notifEnabled, setNotifEnabled] = useState(false); 
  const [chatbotEnabled, setChatbotEnabled] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState([]);

  const [accountName, setAccountName] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  const [apiKeys, setApiKeys] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const inputClassName = "w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 font-mono text-sm dark:text-slate-200 transition-colors";

  useEffect(() => { 
    const fetchApiKeys = async () => {
      if (isPreview) return; 
      try {
        const res = await fetch(`${API_BASE}/api/settings/api-keys`);
        const data = await res.json();
        setApiKeys(Array.isArray(data) ? data : []);
      } catch (e) { }
    };
    fetchApiKeys(); 
  }, [API_BASE, isPreview]);

  const handleSaveGoogleCredentials = async () => {
    if (!clientId || !clientSecret) return alert('Client ID dan Client Secret harus diisi!');
    if (isPreview) return alert('Simulasi (Layar Preview): Kredensial Google berhasil divalidasi.');
    
    setIsSavingCreds(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings/google-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret })
      });
      const data = await res.json();
      alert(data.success ? 'Berhasil: ' + data.message : 'Gagal: ' + data.message);
      if (data.success) { setClientId(''); setClientSecret(''); }
    } catch (err) { alert('Terjadi kesalahan koneksi ke server.'); } 
    finally { setIsSavingCreds(false); }
  };

  const handleLoginGoogle = async () => {
    if (isPreview) return alert('Fitur otentikasi Google hanya dapat dijalankan di VPS atau Localhost.');
    try {
      const res = await fetch(`${API_BASE}/api/auth/url`);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
      else if (data.error) alert('Error: ' + data.error);
    } catch (err) { alert('Gagal mengambil URL login dari server.'); }
  };

  const handleSaveAccount = async () => {
    if (!accountName || !authUrl) return alert('Nama akun dan URL lengkap harus diisi!');
    if (isPreview) return alert('Simulasi: Akun berhasil ditambahkan.');

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName, authUrl })
      });
      const data = await res.json();
      alert(data.success ? 'Berhasil: ' + data.message : 'Gagal: ' + data.message);
      if (data.success) {
        setAccountName('');
        setAuthUrl('');
        fetchAccounts(); // Update daftar global
      }
    } catch (err) { alert('Terjadi kesalahan koneksi ke server.'); } 
    finally { setIsSaving(false); }
  };

  const deleteAccount = async (id) => {
    if (isPreview) return;
    if (!confirm('Anda yakin ingin menghapus sambungan akun ini?')) return;
    try {
      await fetch(`${API_BASE}/api/settings/account/${id}`, { method: 'DELETE' });
      fetchAccounts();
    } catch (e) { alert('Gagal menghapus akun.'); }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    if (isPreview) {
      alert('Simulasi (Layar Preview): File client_secret.json diterima.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    for (let file of files) formData.append('files', file);

    try {
      await fetch(`${API_BASE}/api/settings/upload-json`, { method: 'POST', body: formData });
      const res = await fetch(`${API_BASE}/api/settings/api-keys`);
      const data = await res.json();
      setApiKeys(Array.isArray(data) ? data : []);
      alert('File JSON berhasil diunggah.');
    } catch (e) { 
      alert('Gagal mengunggah file JSON.'); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const deleteKey = async (id) => {
    if (isPreview) return;
    if (!confirm('Anda yakin ingin menghapus API Key ini?')) return;
    try {
      await fetch(`${API_BASE}/api/settings/api-key/${id}`, { method: 'DELETE' });
      const res = await fetch(`${API_BASE}/api/settings/api-keys`);
      const data = await res.json();
      setApiKeys(Array.isArray(data) ? data : []);
    } catch (e) { alert('Gagal menghapus API key.'); }
  };

  const addScheduledMessage = () => {
    setScheduledMessages([...scheduledMessages, { id: Date.now(), hour: 0, minute: 0, text: "" }]);
  };
  const updateScheduledMessage = (id, field, value) => {
    setScheduledMessages(scheduledMessages.map(msg => msg.id === id ? { ...msg, [field]: value } : msg));
  };
  const removeScheduledMessage = (id) => {
    setScheduledMessages(scheduledMessages.filter(msg => msg.id !== id));
  };

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      
      {/* CARD 0: SETUP KREDENSIAL GOOGLE API */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
        <div className="border-b border-gray-200 dark:border-slate-700/60 pb-4 mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-500" />
            Setup Kredensial Google API
          </h3>
        </div>

        {accounts?.length > 0 && (
          <div className="mb-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 font-bold">Kredensial Valid & Aktif</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400/90 mt-1">Sistem telah terhubung dengan <strong>{accounts.length} Channel YouTube</strong>. API siap digunakan untuk Live Streaming.</p>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
          Masukkan Client ID dan Client Secret dari Google Cloud Console. Anda cukup menyimpannya sekali saja di sini. Data akan disimpan aman di server.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Client ID</label>
            <input 
              type="text" 
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Contoh: 123456789-xxxxxx.apps.googleusercontent.com" 
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Client Secret</label>
            <input 
              type="password" 
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Contoh: GOCSPX-xxxxxx_xxxxxxxxxx" 
              className={inputClassName}
            />
          </div>
          <div className="pt-2">
            <button 
              onClick={handleSaveGoogleCredentials}
              disabled={isSavingCreds}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSavingCreds ? 'Menyimpan...' : 'Simpan Kredensial API'}
            </button>
          </div>
        </div>
      </div>

      {/* CARD 0.5: DAFTAR CHANNEL YOUTUBE TERHUBUNG */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700/60 pb-4 mb-5">
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-red-500" />
            Channel YouTube Terhubung
          </h3>
          {accounts?.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {accounts.length} Channel Aktif
            </span>
          )}
        </div>

        {accounts?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all shadow-sm group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">{acc.name}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Siap digunakan
                    </p>
                  </div>
                </div>
                <button onClick={() => deleteAccount(acc.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100" title="Putus Koneksi Akun">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-slate-400 p-8 text-center border border-dashed border-gray-300 dark:border-slate-700/60 rounded-xl bg-gray-50/50 dark:bg-slate-900/20">
            <Users className="w-10 h-10 mx-auto text-gray-400 mb-3 opacity-50" />
            <p className="font-semibold text-gray-700 dark:text-slate-300 mb-1">Belum Ada Channel Terhubung</p>
            <p className="text-xs">Gunakan form &quot;Autentikasi Manual&quot; di bawah untuk menambahkan channel YouTube Anda.</p>
          </div>
        )}
      </div>

      {/* CARD 1: AUTENTIKASI MANUAL */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
        <div className="border-b border-gray-200 dark:border-slate-700/60 pb-4 mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-500" /> 
            Autentikasi Manual (Metode Localhost)
          </h3>
        </div>
        
        <div className="flex justify-center mb-8">
          <button 
            onClick={handleLoginGoogle}
            className="flex items-center gap-3 px-6 py-2.5 border-2 border-gray-200 dark:border-slate-600/60 text-gray-700 dark:text-slate-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">1. Buka Login Google</span>
          </button>
        </div>

        <div className="space-y-5 bg-gray-50 dark:bg-slate-900/30 p-5 rounded-xl border border-gray-100 dark:border-slate-700/50">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">2. Nama Akun</label>
            <input 
              type="text" 
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Contoh: ChannelGaming01" 
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">3. Tempel URL Lengkap</label>
            <textarea 
              rows="4" 
              value={authUrl}
              onChange={(e) => setAuthUrl(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-md px-4 py-3 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 font-mono text-xs break-all text-gray-600 dark:text-slate-300 shadow-sm" 
              placeholder="http://localhost/?state=ppVwnH...&code=4/0A..."
            ></textarea>
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={handleSaveAccount}
            disabled={isSaving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-md"
          >
            {isSaving ? 'Memproses...' : 'Simpan Akun'}
          </button>
        </div>
      </div>

      {/* CARD 2: MANAJEMEN API JSON */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 border-b border-gray-200 dark:border-slate-700/60 pb-4">
          <Upload className="w-6 h-6 text-gray-500 dark:text-slate-400" />
          <h3 className="text-lg font-semibold dark:text-slate-100">Manajemen API v3 (Rotasi JSON)</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Upload file JSON dari Google Cloud Console untuk menghindari limit harian (Quota Exceeded). Sistem akan otomatis mengganti token API (Auto Rotate) saat limit tercapai.
        </p>

        <label className="block border-2 border-dashed border-gray-300 dark:border-slate-600/60 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer mb-6">
          <Upload className="w-8 h-8 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-medium dark:text-slate-200">{isUploading ? 'Sedang Mengunggah...' : 'Drag & Drop file client_secret.json di sini'}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Mendukung upload banyak file sekaligus</p>
          <input type="file" multiple accept=".json" className="hidden" onChange={handleFileUpload} />
        </label>

        <div className="space-y-3">
          <h4 className="font-medium text-sm dark:text-slate-200">Status API Key Aktif ({apiKeys.length})</h4>
          <div className="space-y-2">
            {apiKeys.map(key => (
              <div key={key.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="overflow-hidden">
                  <p className="text-xs font-bold dark:text-slate-200 truncate">{key.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{key.clientId}</p>
                </div>
                <button onClick={() => deleteKey(key.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16} /></button>
              </div>
            ))}
            {apiKeys.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-slate-400 p-4 text-center border border-gray-100 dark:border-slate-700/60 rounded-lg">
                Belum ada konfigurasi API JSON yang ditambahkan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD 3: NOTIFIKASI TELEGRAM/DISCORD */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <h3 className="text-lg font-semibold dark:text-slate-100">Peringatan & Notifikasi Sistem</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={notifEnabled} onChange={() => setNotifEnabled(!notifEnabled)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500"></div>
          </label>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
          Kirim peringatan otomatis ke ponsel Anda jika terjadi kendala pada VPS atau Streaming.
        </p>

        <div className={`transition-opacity ${notifEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Platform Notifikasi</label>
              <select 
                value={notifPlatform}
                onChange={(e) => setNotifPlatform(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 dark:text-slate-200"
              >
                <option value="telegram">Telegram Bot</option>
                <option value="discord">Discord Webhook</option>
              </select>
            </div>
            
            {notifPlatform === 'telegram' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Bot Token</label>
                  <input type="password" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" className={inputClassName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Chat ID (Target Group/User)</label>
                  <input type="text" placeholder="-1001234567890" className={inputClassName} />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Webhook URL</label>
                <input type="url" placeholder="https://discord.com/api/webhooks/..." className={inputClassName} />
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/30 rounded-xl p-4 border border-gray-200 dark:border-slate-700/50">
            <h4 className="text-sm font-semibold mb-3 dark:text-slate-200">Pemicu Peringatan (Triggers)</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 dark:text-emerald-500 rounded border-gray-300 dark:border-slate-600 focus:ring-emerald-500 bg-white dark:bg-slate-800" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Stream terputus (Error) atau OBS Fallback aktif</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 dark:text-emerald-500 rounded border-gray-300 dark:border-slate-600 focus:ring-emerald-500 bg-white dark:bg-slate-800" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Penggunaan CPU VPS melebihi 85%</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 dark:text-emerald-500 rounded border-gray-300 dark:border-slate-600 focus:ring-emerald-500 bg-white dark:bg-slate-800" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Limit Quota API Google / YouTube (Rotasi JSON terjadi)</span>
              </label>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700/60 flex justify-end">
              <button className="flex items-center gap-2 px-4 py-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors">
                <Send className="w-3.5 h-3.5" /> Test Kirim Pesan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 4: FITUR BARU - YOUTUBE CHATBOT */}
      <div className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-emerald-900/10 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">YouTube Chatbot Terintegrasi</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Bot otomatis untuk Live Chat</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={chatbotEnabled} onChange={() => setChatbotEnabled(!chatbotEnabled)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className={`space-y-6 transition-opacity ${chatbotEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          
          {/* Pesan Terjadwal (Timeline) */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/60 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 dark:text-slate-200">
                <Clock className="w-4 h-4 text-gray-500 dark:text-slate-400" /> Timeline Pesan Bot
              </h4>
              <button onClick={addScheduledMessage} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">+ Tambah Jadwal</button>
            </div>
            
            <div className="space-y-3">
              {scheduledMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 bg-gray-50 dark:bg-slate-900/30 p-3 rounded-lg border border-gray-200 dark:border-slate-700/50">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-slate-400">Kirim setelah stream berjalan:</span>
                      <input 
                        type="number" 
                        min="0"
                        value={msg.hour} 
                        onChange={(e) => updateScheduledMessage(msg.id, 'hour', e.target.value)}
                        className="w-14 bg-white dark:bg-slate-900/80 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1 text-sm outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-center dark:text-slate-200" 
                      /> 
                      <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">Jam</span>
                      <input 
                        type="number" 
                        min="0"
                        max="59"
                        value={msg.minute} 
                        onChange={(e) => updateScheduledMessage(msg.id, 'minute', e.target.value)}
                        className="w-14 bg-white dark:bg-slate-900/80 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1 text-sm outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-center dark:text-slate-200" 
                      /> 
                      <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">Menit</span>
                    </div>
                    <textarea 
                      rows="2" 
                      value={msg.text}
                      onChange={(e) => updateScheduledMessage(msg.id, 'text', e.target.value)}
                      placeholder="Isi pesan bot..."
                      className="w-full bg-white dark:bg-slate-900/80 border border-gray-300 dark:border-slate-600/60 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:focus:border-emerald-400 resize-none dark:text-slate-200"
                    ></textarea>
                  </div>
                  <button 
                    onClick={() => removeScheduledMessage(msg.id)}
                    className="mt-6 p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-rose-400 transition-colors"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {scheduledMessages.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-slate-500 border border-dashed border-gray-300 dark:border-slate-700/60 rounded-lg">
                  Belum ada jadwal pesan. Klik &quot;+ Tambah Jadwal&quot;
                </div>
              )}
            </div>
          </div>

          {/* Auto Reply (Sapaan) */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/60 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 dark:text-slate-200">
                <MessageCircle className="w-4 h-4 text-gray-500 dark:text-slate-400" /> Aturan Auto-Reply (Balasan Cepat)
              </h4>
              <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">+ Tambah Aturan</button>
            </div>
            
            <div className="space-y-3">
              <div className="text-center py-4 text-sm text-gray-500 dark:text-slate-500 border border-dashed border-gray-300 dark:border-slate-700/60 rounded-lg">
                  Belum ada aturan auto-reply ditambahkan.
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}

function LogView() {
  const [logs, setLogs] = useState([]);
  const [bitrateHistory, setBitrateHistory] = useState(Array(20).fill(0));
  const [currentFps, setCurrentFps] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);
  
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Logika WebSocket sementara dihilangkan untuk fokus backend
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const createChartPath = () => {
    return bitrateHistory.map((val, i) => {
      const x = (i / 19) * 100;
      const normalizedVal = val === 0 ? 3000 : val;
      const y = 100 - (((normalizedVal - 3000) / 4000) * 100); 
      return `${x},${Math.max(0, Math.min(100, y))}`; 
    }).join(' ');
  };

  const currentBitrate = bitrateHistory[bitrateHistory.length - 1];
  const bitrateColor = currentBitrate > 0 ? (currentBitrate > 4500 ? 'text-green-500 dark:text-emerald-400' : currentBitrate > 4100 ? 'text-yellow-500 dark:text-amber-400' : 'text-red-500 dark:text-rose-400') : 'text-gray-500 dark:text-slate-500';

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* KIRI: ADVANCED STREAM HEALTH MONITOR (OBS STYLE) */}
      <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-2 dark:text-slate-100">
          <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Stream Health
        </h3>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-xl border border-gray-800 dark:border-slate-700/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] dark:shadow-none">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
              <Wifi className="w-3 h-3" /> Bitrate
            </div>
            <div className={`text-2xl font-black font-mono tracking-tighter ${bitrateColor} drop-shadow-[0_0_8px_rgba(currentColor,0.5)] dark:drop-shadow-none`}>
              {currentBitrate} <span className="text-xs font-normal text-gray-500 dark:text-slate-500">kbps</span>
            </div>
          </div>
          <div className="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-xl border border-gray-800 dark:border-slate-700/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] dark:shadow-none">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
              <Monitor className="w-3 h-3" /> FPS
            </div>
            <div className={`text-2xl font-black font-mono tracking-tighter ${currentFps >= 60 ? 'text-green-400 dark:text-emerald-400' : currentFps > 0 ? 'text-yellow-400 dark:text-amber-400' : 'text-gray-500 dark:text-slate-500'}`}>
              {currentFps} <span className="text-xs font-normal text-gray-500 dark:text-slate-500">/ 60</span>
            </div>
          </div>
          <div className="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-xl border border-gray-800 dark:border-slate-700/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] dark:shadow-none">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3" /> Frame Drops
            </div>
            <div className={`text-2xl font-black font-mono tracking-tighter ${droppedFrames > 0 ? 'text-orange-500 dark:text-amber-500' : 'text-gray-500 dark:text-slate-500'}`}>
              {droppedFrames} <span className="text-xs font-normal text-gray-500 dark:text-slate-500">(0.00%)</span>
            </div>
          </div>
          <div className="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-xl border border-gray-800 dark:border-slate-700/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] dark:shadow-none">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
              <Cpu className="w-3 h-3" /> Encoder
            </div>
            <div className="text-sm font-black font-mono mt-1 text-gray-500 dark:text-slate-500">
              Menunggu...
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">CPU: 0.0%</div>
          </div>
        </div>

        {/* Real-time Bitrate Chart */}
        <div className="bg-gray-900 dark:bg-slate-800 rounded-xl border border-gray-800 dark:border-slate-700/60 p-4 mt-2 flex-1 min-h-[200px] flex flex-col relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-400 dark:text-slate-300 uppercase tracking-widest">Network Stability</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-slate-500"></span>
              <span className="text-xs text-gray-500 dark:text-slate-500 font-medium">Menunggu Stream</span>
            </div>
          </div>
          
          {/* Chart Area */}
          <div className="flex-1 relative mt-2 w-full">
            <div className="absolute inset-0 flex flex-col justify-between opacity-10 dark:opacity-20 pointer-events-none">
              <div className="border-t border-gray-400 dark:border-slate-500 w-full"></div>
              <div className="border-t border-gray-400 dark:border-slate-500 w-full"></div>
              <div className="border-t border-gray-400 dark:border-slate-400 w-full"></div>
              <div className="border-t border-gray-400 dark:border-slate-500 w-full"></div>
            </div>
            <svg className="w-full h-full text-green-500 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradientBitrate" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polyline 
                points={`0,100 ${createChartPath()} 100,100`} 
                fill="url(#gradientBitrate)" 
              />
              <polyline 
                points={createChartPath()} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinejoin="round" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-600 dark:text-slate-400 font-mono">
            <span>T-20s</span>
            <span>T-10s</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {/* KANAN: REMOTE TERMINAL CONSOLE */}
      <div className="lg:w-2/3 bg-[#0a0a0a] dark:bg-[#020617] rounded-xl border border-gray-800 dark:border-slate-800 flex flex-col font-mono text-sm shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden h-full relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LD,I1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 dark:opacity-20 pointer-events-none"></div>

        <div className="bg-[#1a1a1a] dark:bg-[#0f172a] px-4 py-2.5 border-b border-gray-800 dark:border-slate-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-3 text-gray-400 dark:text-slate-400 text-xs">
            <TerminalSquare className="w-4 h-4" />
            <span className="font-bold tracking-wider">root@vps-vstream:~# tail -f /var/log/ffmpeg_stream.log</span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-600/80 dark:bg-slate-700/80 shadow-none"></div>
            <div className="w-3 h-3 rounded-full bg-gray-600/80 dark:bg-slate-700/80 shadow-none"></div>
            <div className="w-3 h-3 rounded-full bg-gray-600/80 dark:bg-slate-700/80 shadow-none"></div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 z-10 custom-scrollbar">
          <div className="space-y-1.5 text-[13px] leading-relaxed">
            {logs.length === 0 ? (
              <div className="text-gray-500 dark:text-slate-600 italic">Menunggu koneksi log dari server...</div>
            ) : (
              logs.map((log, index) => {
                let colorClass = "text-gray-300 dark:text-slate-300";
                if (log.type === 'system') colorClass = "text-purple-400 dark:text-purple-300 font-bold";
                if (log.type === 'info') colorClass = "text-blue-400 dark:text-blue-300";
                if (log.type === 'success') colorClass = "text-green-400 dark:text-emerald-300";
                if (log.type === 'warning') colorClass = "text-yellow-400 dark:text-amber-300";
                if (log.type === 'error') colorClass = "text-red-500 dark:text-rose-400 font-bold";
                if (log.type === 'ffmpeg') colorClass = "text-gray-400 dark:text-slate-500";

                return (
                  <div key={index} className={`${colorClass} break-all hover:bg-white/5 dark:hover:bg-white/10 px-1 rounded transition-colors`}>
                    <span className="opacity-50 dark:opacity-40 mr-2 text-xs">
                      {new Date().toISOString().split('T')[1].substring(0,8)}
                    </span>
                    {log.text}
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor, className = "" }) {
  return (
    <div className={`bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm transition-all flex items-center gap-4 ${className}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-none">{value}</p>
      </div>
    </div>
  );
}

function ProgressBar({ label, percentage, color, valueText, subText }) {
  return (
    <div className="flex flex-col justify-end w-full">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-mono font-bold text-gray-700 dark:text-slate-300">{valueText || `${percentage}%`}</span>
      </div>
      <div className="w-full rounded-full h-1.5 bg-gray-100 dark:bg-slate-700/50 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
      <div className={`mt-1.5 text-[9px] text-gray-400 dark:text-slate-500 font-medium text-right leading-none ${subText ? 'opacity-100' : 'opacity-0 select-none'}`}>
        {subText || '-'}
      </div>
    </div>
  );
}

function FolderItem({ name, count, active }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-100 dark:border-emerald-500/20' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 border border-transparent'}`}>
      <div className="flex items-center gap-2.5 overflow-hidden">
        <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`} />
        <span className="text-[11px] truncate">{name}</span>
      </div>
      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${active ? 'bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 shadow-sm' : 'bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400'}`}>
        {count}
      </span>
    </div>
  );
}

function VideoFile({ name, size, onEdit, onDelete }) {
  const isImage = name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpeg');

  return (
    <div className="group flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-gray-100 dark:border-slate-700/60 hover:border-gray-200 dark:hover:border-slate-600/60 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow dark:hover:shadow-black/20">
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${isImage ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}>
          {isImage ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </div>
        <div className="overflow-hidden">
          <p className="text-[13px] font-semibold text-gray-800 dark:text-slate-200 truncate pr-2" title={name}>{name}</p>
          <p className="text-[10px] font-mono text-gray-400 dark:text-slate-500 mt-0.5">{size}</p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white dark:from-slate-800 via-white dark:via-slate-800 pl-4 pr-1">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }} 
          className="p-1.5 text-gray-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
          title="Edit"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }} 
          className="p-1.5 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
          title="Hapus"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function TableRowMenu({ onDelete }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
      >
        <Settings className="w-4 h-4" /> Menu
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/60 rounded-xl shadow-lg dark:shadow-black/30 z-50 py-2">
          <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <Edit className="w-4 h-4" /> Edit Metadata
          </button>
          <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-green-600 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <PlayCircle className="w-4 h-4" /> Play Live
          </button>
          <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-yellow-600 dark:text-amber-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <StopCircle className="w-4 h-4" /> Stop Live
          </button>
          <div className="h-px bg-gray-200 dark:bg-slate-700/60 my-1"></div>
          <button 
            onClick={onDelete}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Hapus Live
          </button>
        </div>
      )}
    </div>
  );
}