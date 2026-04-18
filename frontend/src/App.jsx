import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, PlayCircle, FolderOpen, BarChart2, 
  Settings, Terminal, Moon, Sun, Plus, Upload, 
  Video, RefreshCw, Server, Activity, Users, 
  CheckCircle2, AlertCircle, Clock, Edit, StopCircle, Trash2,
  AlertTriangle, XCircle, ChevronDown, TrendingUp, MessageSquare, ThumbsUp,
  Menu, Image, Monitor, Radio, Calendar, ShieldAlert,
  Wifi, Zap, TerminalSquare, Cpu, Bell, Bot, Send, MessageCircle,
  Cast, Film, LineChart, Sliders, ScrollText, Link as LinkIcon, ListVideo, ArrowDown, Archive, Pencil
} from 'lucide-react';

// === KONFIGURASI BRANDING APLIKASI ===
const BRAND_PREFIX = "V";           // Huruf pertama (warna gelap)
const BRAND_SUFFIX = "Stream";      // Sisa huruf (warna hijau)
const BRAND_TAGLINE = "Vaimoz Youtube Stream V.1"; // Teks kecil di bawah logo
// =====================================

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
                <h1 className="text-xl font-bold tracking-tight leading-none mb-1">{BRAND_PREFIX}<span className="text-emerald-600 dark:text-emerald-400">{BRAND_SUFFIX}</span></h1>
                <span className="text-[9px] font-bold tracking-widest text-gray-500 dark:text-slate-400 uppercase leading-none">{BRAND_TAGLINE}</span>
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
          {activeTab === 'dashboard' && <DashboardView isPreview={isPreview} API_BASE={API_BASE} />}
          {activeTab === 'tugas-live' && <TugasLiveView accounts={accounts} isPreview={isPreview} API_BASE={API_BASE} onNavigate={setActiveTab} />}
          {activeTab === 'media' && <MediaView isPreview={isPreview} API_BASE={API_BASE} />}
          {activeTab === 'analytics' && <AnalyticsView accounts={accounts} isPreview={isPreview} API_BASE={API_BASE} />}
          {activeTab === 'pengaturan' && <SettingsView accounts={accounts} fetchAccounts={fetchAccounts} isPreview={isPreview} API_BASE={API_BASE} />}
          {activeTab === 'log' && <LogView isPreview={isPreview} API_BASE={API_BASE} />}
        </main>
        
      </div>
    </div>
  );
}

function DashboardView({ isPreview, API_BASE }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sysInfo, setSysInfo] = useState({ cpu: 0, ram: 0, disk: 0, bandwidth: 0 });
  
  const [tableFilter, setTableFilter] = useState('utama'); // 'utama' | 'history'

  const fetchTasks = async () => {
    if(isPreview) { setIsLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE}/api/tasks`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch(e) { console.error(e); }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => {
      fetchTasks();
      if (!isPreview) fetch(`${API_BASE}/api/system`).then(res => res.json()).then(data => setSysInfo(data)).catch(e => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [API_BASE, isPreview]);

  const handleDeleteTask = async (id) => {
      if(!window.confirm('Hapus tugas live ini? Jika sedang berjalan, maka akan dihentikan paksa.')) return;
      try { await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' }); fetchTasks(); } catch(e) {}
  };

  const handleStopStream = async (id) => {
      if(!window.confirm('Hentikan stream FFmpeg yang sedang berjalan?')) return;
      try { await fetch(`${API_BASE}/api/stream/stop`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ streamId: id }) }); fetchTasks(); } catch(e) {}
  };

  const handleStartStream = async (task) => {
      if(!window.confirm('Mulai Streaming untuk tugas ini sekarang?')) return;
      try {
          const payload = { ...task, isMulaiSekarang: true };
          await fetch(`${API_BASE}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          await fetch(`${API_BASE}/api/tasks/${task.id}`, { method: 'DELETE' }); 
          fetchTasks();
      } catch(e) {}
  };

  const getHealthStyle = (health) => {
    switch(health) {
      case 'good': return { dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', label: 'Bagus (Good)' };
      case 'poor': return { dot: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', label: 'Lemah (Poor)' };
      case 'bad': return { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400', label: 'Buruk / Putus' };
      default: return { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Sangat Baik' }; // excellent
    }
  };

  const liveTasks = tasks.filter(t => t.status === 'Live');
  const scheduledTasks = tasks.filter(t => t.status === 'Terjadwal' || t.status === 'Draft' || t.status === 'Berhenti');

  const filteredTasks = tasks.filter(t => {
      if (tableFilter === 'utama') {
          return t.status === 'Live' || t.status === 'Starting' || t.status === 'Error' || (t.status === 'Terjadwal' && ['sekali', 'manual'].includes(t.jadwalMode));
      } else {
          return t.status === 'Berhenti' || (t.status !== 'Live' && t.status !== 'Error' && ['harian', 'smart-weekly'].includes(t.jadwalMode));
      }
  });

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
              <p className="text-base font-black text-gray-900 dark:text-slate-100 leading-none">{liveTasks.length}</p>
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
              <p className="text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Tugas / Terjadwal</p>
              <p className="text-base font-black text-gray-900 dark:text-slate-100 leading-none">{scheduledTasks.length}</p>
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
          <ProgressBar label="CPU" percentage={sysInfo.cpu} color="bg-blue-400 dark:bg-blue-500" />
          <ProgressBar label="RAM" percentage={sysInfo.ram} color="bg-purple-400 dark:bg-purple-500" />
          <ProgressBar label="Disk" percentage={sysInfo.disk} color="bg-yellow-400 dark:bg-amber-400" />
          <ProgressBar label="Bandwidth" percentage={sysInfo.bandwidth * 10} color="bg-cyan-400 dark:bg-cyan-500" valueText={<span>{sysInfo.bandwidth}<span className="text-[8px] text-gray-400 dark:text-slate-500 font-normal ml-0.5">GB</span></span>} subText="Kmrn: 1.2 GB" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/50 gap-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Daftar Tugas & Streaming
          </h3>
          
          <div className="flex items-center gap-2 bg-gray-200/50 dark:bg-slate-900 p-1 rounded-lg self-start sm:self-auto">
             <button 
                onClick={() => setTableFilter('utama')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${tableFilter === 'utama' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
             >
                <PlayCircle className="w-3.5 h-3.5" /> Live & Antrean
             </button>
             <button 
                onClick={() => setTableFilter('history')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${tableFilter === 'history' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
             >
                <Archive className="w-3.5 h-3.5" /> History & Rutin
             </button>
             
             <div className="w-px h-4 bg-gray-300 dark:bg-slate-600 mx-1"></div>
             
             <button onClick={fetchTasks} className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors rounded-md" title="Refresh Data">
                <RefreshCw className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full pb-2">
          <table className="w-full text-left min-w-[850px]">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700/60">
                <th className="px-5 py-3 w-10 text-center">#</th>
                <th className="px-5 py-3">Informasi Stream</th>
                <th className="px-5 py-3">Mode & Viewers</th>
                <th className="px-5 py-3">Status Sistem</th>
                <th className="px-5 py-3 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {isLoading ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-gray-500 dark:text-slate-400">Memuat data...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                    {tableFilter === 'utama' ? 'Tidak ada tugas live yang sedang berjalan atau antre.' : 'Belum ada riwayat video yang berhenti atau jadwal rutin.'}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t, idx) => {
                  const healthStyle = getHealthStyle(t.streamHealth || 'excellent');
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-5 py-4 align-middle text-center text-xs font-mono text-gray-400">{idx+1}</td>
                      
                      <td className="px-5 py-4 align-middle">
                        <div className="font-semibold text-sm text-gray-900 dark:text-slate-100 leading-tight truncate max-w-[200px]" title={t.taskName}>
                          {t.taskName || 'Tanpa Nama'}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 truncate max-w-[200px] flex items-center gap-1">
                          {t.videoMode === 'Play Playlist (Berurutan)' ? <ListVideo className="w-3 h-3 text-gray-400" /> : <Video className="w-3 h-3 text-gray-400" />}
                          {t.videoPath || t.videoMode}
                        </div>
                      </td>
                      
                      <td className="px-5 py-4 align-middle">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700/60 text-xs text-gray-600 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{t.jadwalMode === 'smart-weekly' ? 'Mingguan' : t.jadwalMode === 'harian' ? `Harian | ${t.scheduleTime}` : t.jadwalMode === 'sekali' ? `${t.scheduleDate} | ${t.scheduleTime}` : 'Manual'}</span>
                        </div>
                        
                        {t.status === 'Live' && (
                          <div className="mt-2 space-y-1.5">
                            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                              <Users className="w-3 h-3" /> {t.viewers || 0} Penonton • {t.uptime || '00:00'}
                            </div>
                            <div className={`text-[10px] font-medium flex items-center gap-1.5 ${healthStyle.text}`}>
                              <span className={`w-2 h-2 rounded-full ${healthStyle.dot} animate-pulse`}></span>
                              Kondisi: {healthStyle.label}
                            </div>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-start gap-2">
                          <span className="relative flex h-2.5 w-2.5 mt-1 shrink-0">
                            {t.status === 'Live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 dark:bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${t.status === 'Live' ? 'bg-emerald-500' : t.status === 'Terjadwal' ? 'bg-blue-500' : t.status === 'Error' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                          </span>
                          
                          <div className="flex flex-col">
                            <span className={`text-sm font-medium leading-none ${t.status === 'Live' ? 'text-emerald-600 dark:text-emerald-400' : t.status === 'Error' ? 'text-red-600 dark:text-rose-400' : 'text-gray-600 dark:text-slate-400'}`}>
                              {t.status}
                            </span>
                            <span className={`text-[11px] mt-1 mb-1.5 ${t.condType === 'success' ? 'text-emerald-600 dark:text-emerald-400' : t.condType === 'warning' ? 'text-yellow-600 dark:text-amber-400' : t.condType === 'error' ? 'text-red-600 dark:text-rose-400' : 'text-gray-500 dark:text-slate-500'}`}>
                              {t.condTitle || 'Menunggu Waktu'}
                            </span>
                            
                            <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-slate-700/50 pt-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1">
                                <StopCircle className="w-3 h-3" /> Stop: {t.stopHours || 0}j {t.stopMinutes || 0}m {t.randomizeStop ? '(Acak)' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-5 py-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             {t.status !== 'Live' && (
                               <button 
                                 onClick={() => handleStartStream(t)} 
                                 className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-md transition-colors" 
                                 title="Mulai Live Sekarang"
                               >
                                 <PlayCircle className="w-4 h-4"/>
                               </button>
                             )}
                             {t.status === 'Live' && (
                               <button 
                                 onClick={() => handleStopStream(t.id)} 
                                 className="p-2 bg-yellow-50 dark:bg-amber-500/10 text-yellow-600 dark:text-amber-400 hover:bg-yellow-100 dark:hover:bg-amber-500/20 rounded-md transition-colors" 
                                 title="Hentikan Stream"
                               >
                                 <StopCircle className="w-4 h-4"/>
                               </button>
                             )}
                             <button 
                               onClick={() => alert('Fitur Edit Metadata sedang dikembangkan')} 
                               className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-md transition-colors" 
                               title="Edit Tugas"
                             >
                               <Edit className="w-4 h-4"/>
                             </button>
                             <button 
                               onClick={() => handleDeleteTask(t.id)} 
                               className="p-2 bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-400 hover:bg-red-100 dark:hover:bg-rose-500/20 rounded-md transition-colors" 
                               title="Hapus Tugas (Hapus dari History)"
                             >
                               <Trash2 className="w-4 h-4"/>
                             </button>
                          </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TugasLiveView({ accounts, isPreview, API_BASE, onNavigate }) {
  const [taskName, setTaskName] = useState('');
  const [streamKeyMode, setStreamKeyMode] = useState('Otomatis (API v3)'); 
  const [manualStreamKey, setManualStreamKey] = useState(''); 
  const [videoMode, setVideoMode] = useState('Satu Video (Looping)');
  const [selectedVideos, setSelectedVideos] = useState([]);
  
  const [jadwalMode, setJadwalMode] = useState('manual');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleGrid, setScheduleGrid] = useState({
    Senin: { active: true, start: '08:00', end: '22:00' }, Selasa: { active: true, start: '08:00', end: '22:00' },
    Rabu: { active: true, start: '08:00', end: '22:00' }, Kamis: { active: true, start: '08:00', end: '22:00' },
    Jumat: { active: true, start: '08:00', end: '22:00' }, Sabtu: { active: false, start: '09:00', end: '20:00' },
    Minggu: { active: false, start: '09:00', end: '20:00' }
  });
  const [stopHours, setStopHours] = useState(0);
  const [stopMinutes, setStopMinutes] = useState(0);
  const [randomizeStop, setRandomizeStop] = useState(true);
  
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const thumbInputRef = useRef(null);

  const [isVideoDropdownOpen, setIsVideoDropdownOpen] = useState(false);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const [accountId, setAccountId] = useState('');
  const [youtubeCategory, setYoutubeCategory] = useState('24');
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [youtubeDescription, setYoutubeDescription] = useState('');
  const [youtubeTags, setYoutubeTags] = useState('');
  const [youtubePrivacy, setYoutubePrivacy] = useState('public');

  const [chatbotEnabled, setChatbotEnabled] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState([]);

  const [enableFallback, setEnableFallback] = useState(false);
  const [fallbackVideo, setFallbackVideo] = useState('');
  const [encoderEngine, setEncoderEngine] = useState('copy');
  const [outputResolution, setOutputResolution] = useState('source');
  const [syntheticContent, setSyntheticContent] = useState('no');
  const [monetization, setMonetization] = useState('on');
  const [targetPlaylist, setTargetPlaylist] = useState('none');

  useEffect(() => {
    if (isPreview) return;
    fetch(`${API_BASE}/api/media`).then(res => res.json()).then(data => { if(Array.isArray(data)) setAvailableVideos(data.map(d => d.name)); }).catch(e => {});
    fetch(`${API_BASE}/api/playlists`).then(res => res.json()).then(data => { if(Array.isArray(data)) setPlaylists(data); }).catch(e => {});
  }, [API_BASE, isPreview]);

  const handleThumbUploadChange = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      if(isPreview) { setThumbnailUrl(URL.createObjectURL(file)); return alert('Simulasi: Thumbnail dipilih.'); }
      setIsUploadingThumb(true);
      const formData = new FormData();
      formData.append('thumbnail', file);
      try {
          const res = await fetch(`${API_BASE}/api/thumbnails/upload`, { method: 'POST', body: formData });
          const data = await res.json();
          if(data.success) setThumbnailUrl(API_BASE + data.url); 
          else alert(data.message);
      } catch(e) {}
      setIsUploadingThumb(false);
  };

  const handleSaveTask = async (isMulaiSekarang = false) => {
      if (!taskName.trim()) return alert('⚠️ Nama Tugas Live wajib diisi!');
      if (selectedVideos.length === 0) return alert('⚠️ Pilih minimal 1 video/playlist!');
      if (streamKeyMode === 'Manual Input Key' && !manualStreamKey.trim()) return alert('⚠️ Stream Key wajib diisi untuk mode manual!');
      if (streamKeyMode === 'Otomatis (API v3)' && !accountId) return alert('⚠️ Anda harus memilih Channel YouTube di kolom Metadata jika menggunakan Mode API Otomatis!');
      if (youtubeTitle && youtubeTitle.length > 100) return alert(`⚠️ Judul video maksimal 100 karakter! (Saat ini: ${youtubeTitle.length} karakter)`);
      
      if (jadwalMode === 'manual' || jadwalMode === 'sekali' || jadwalMode === 'harian') {
          if (!scheduleTime) { if(!isMulaiSekarang) return alert('⚠️ Jam jadwal wajib diisi!'); }
      }

      if(isPreview) return alert('Simulasi: Data berhasil disimpan.');

      const payload = {
          taskName, videoMode, videoPath: selectedVideos[0], streamKeyMode, streamKey: manualStreamKey, jadwalMode, scheduleDate, scheduleTime,
          scheduleGrid, stopHours, stopMinutes, randomizeStop, thumbnailUrl, isMulaiSekarang, accountId, youtubeCategory, youtubeTitle, youtubeDescription, youtubeTags,
          youtubePrivacy, chatbotEnabled, scheduledMessages,
          enableFallback, fallbackVideo, encoderEngine, outputResolution, syntheticContent, monetization, targetPlaylist
      };

      try {
          const res = await fetch(`${API_BASE}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const data = await res.json();
          if(data.success) { alert(`✅ Sukses! ${data.message}`); onNavigate('dashboard'); } 
          else alert(`❌ Gagal: ${data.message}`);
      } catch(e) { alert('Terjadi kesalahan saat menghubungi server.'); }
  };

  const handleVideoSelection = (item) => {
    if (videoMode === 'Satu Video (Looping)' || videoMode === 'Play Playlist (Berurutan)') { setSelectedVideos([item]); setIsVideoDropdownOpen(false); } 
    else { if (selectedVideos.includes(item)) setSelectedVideos(selectedVideos.filter(v => v !== item)); else setSelectedVideos([...selectedVideos, item]); }
  };

  const inputClassName = "w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm transition-all dark:text-slate-200 dark:placeholder-slate-500";
  const labelClassName = "block text-sm font-semibold mb-1.5 text-gray-700 dark:text-slate-300";

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: MAIN SETTINGS & METADATA */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-4 mb-5 text-gray-800 dark:text-slate-100">
              <PlayCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Pengaturan Stream Utama
            </h3>
            <div className="flex flex-col gap-5 bg-gray-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
              <div>
                <label className={labelClassName}>Nama Tugas Live <span className="text-red-500">*</span></label>
                <input type="text" value={taskName} onChange={e=>setTaskName(e.target.value)} placeholder="Misal: Live Berita Pagi Loop" className={inputClassName} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                   <label className={labelClassName}>Mode Video</label>
                   <select className={inputClassName} value={videoMode} onChange={(e) => { setVideoMode(e.target.value); setSelectedVideos([]); }}>
                    <option value="Satu Video (Looping)">Satu Video (Looping)</option>
                    <option value="Play Playlist (Berurutan)">Play Playlist (Berurutan)</option>
                    <option value="Acak Video Setiap Hari">Acak Video Setiap Hari</option>
                  </select>
                </div>
                <div>
                   <label className={labelClassName}>Stream Key Mode</label>
                   <select className={inputClassName} value={streamKeyMode} onChange={(e) => setStreamKeyMode(e.target.value)}>
                    <option value="Otomatis (API v3)">Otomatis (API v3)</option>
                    <option value="Manual Input Key">Manual Input Key</option>
                  </select>
                </div>
              </div>
              
              <div className="relative">
                <label className={labelClassName}>
                  {videoMode === 'Play Playlist (Berurutan)' ? 'Pilih Playlist' : videoMode === 'Acak Video Setiap Hari' ? 'Pilih Beberapa Video' : 'Pilih Video'} <span className="text-red-500">*</span>
                </label>
                {isVideoDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsVideoDropdownOpen(false)}></div>}
                <div className="min-h-[44px] w-full bg-white dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 cursor-pointer flex flex-wrap gap-2 items-center relative z-40" onClick={() => setIsVideoDropdownOpen(!isVideoDropdownOpen)}>
                  {selectedVideos.length === 0 ? ( <span className="text-sm text-gray-400 px-1">Klik untuk memilih...</span> ) : (
                    selectedVideos.map(vid => (
                      <span key={vid} className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-500/20">
                        {videoMode === 'Play Playlist (Berurutan)' ? <ListVideo className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        {vid} <button onClick={(e) => { e.stopPropagation(); handleVideoSelection(vid); }} className="hover:text-red-500 ml-1"><XCircle className="w-3.5 h-3.5" /></button>
                      </span>
                    ))
                  )}
                  <div className="ml-auto pr-1"><ChevronDown className={`w-4 h-4 text-gray-400 ${isVideoDropdownOpen ? 'rotate-180' : ''}`} /></div>
                </div>
                {isVideoDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/60 rounded-xl shadow-xl max-h-56 overflow-y-auto custom-scrollbar">
                    {videoMode === 'Play Playlist (Berurutan)' ? playlists.map((pl, idx) => {
                      const isSelected = selectedVideos.includes(pl.name);
                      return (
                        <div key={idx} onClick={() => handleVideoSelection(pl.name)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/40 ${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-500/10' : ''}`}>
                          <input type="radio" checked={isSelected} readOnly className="w-4 h-4 text-emerald-600 rounded-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" />
                          <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}>{pl.name} ({pl.count} video)</span>
                        </div>
                      )
                    }) : availableVideos.map((vid, idx) => {
                      const isSelected = selectedVideos.includes(vid);
                      return (
                        <div key={idx} onClick={() => handleVideoSelection(vid)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/40 ${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-500/10' : ''}`}>
                          <input type={videoMode === 'Satu Video (Looping)' ? 'radio' : 'checkbox'} checked={isSelected} readOnly className="w-4 h-4 text-emerald-600 rounded-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600" />
                          <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}>{vid}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2.5 flex items-start gap-1.5 px-1">
                  <AlertCircle className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400" />
                  {videoMode === 'Satu Video (Looping)' 
                    ? 'Mode Looping: Hanya mengizinkan pemilihan 1 video utama.' 
                    : videoMode === 'Play Playlist (Berurutan)'
                    ? 'Mode Playlist: Pilih 1 playlist yang telah Anda simpan di menu Media.'
                    : 'Pilih beberapa video. Sistem akan memutar secara acak setiap berganti hari.'}
                </p>
              </div>

              {streamKeyMode === 'Manual Input Key' ? (
                <div className="animate-in fade-in pt-2 border-t border-gray-200 dark:border-slate-700/60">
                  <label className="block text-sm font-bold mb-1.5 text-red-600 dark:text-rose-400">Masukkan Stream Key (Manual) <span className="text-red-500">*</span></label>
                  <input type="password" value={manualStreamKey} onChange={(e) => setManualStreamKey(e.target.value)} className={`${inputClassName} border-red-300 font-mono`} />
                </div>
              ) : (
                <div className="animate-in fade-in pt-2 border-t border-gray-200 dark:border-slate-700/60">
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 p-3 rounded-lg flex gap-3 text-sm text-emerald-800 dark:text-emerald-300">
                     <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                     <p>Mode API Otomatis aktif. Sistem akan langsung mengikat Stream Key dari YouTube Studio menggunakan Channel yang Anda pilih di menu Metadata di bawah.</p>
                   </div>
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
                  <label className={labelClassName}>Pilih Channel {streamKeyMode === 'Otomatis (API v3)' && <span className="text-red-500">*</span>}</label>
                  <select className={inputClassName} value={accountId} onChange={e => setAccountId(e.target.value)}>
                    <option value="">-- Pilih Channel Aktif --</option>
                    {accounts?.map(acc => ( <option key={acc.id} value={acc.id}>{acc.name}</option> ))}
                  </select>
                </div>
                <div>
                  <label className={labelClassName}>Kategori</label>
                  <select className={inputClassName} value={youtubeCategory} onChange={e => setYoutubeCategory(e.target.value)}>
                    <option value="25">News & Politics</option>
                    <option value="20">Gaming</option>
                    <option value="24">Entertainment</option>
                    <option value="10">Music</option>
                    <option value="22">People & Blogs</option>
                    <option value="27">Education</option>
                    <option value="1">Film & Animation</option>
                    <option value="2">Autos & Vehicles</option>
                    <option value="15">Pets & Animals</option>
                    <option value="17">Sports</option>
                    <option value="19">Travel & Events</option>
                    <option value="23">Comedy</option>
                    <option value="26">Howto & Style</option>
                    <option value="28">Science & Technology</option>
                    <option value="29">Nonprofits & Activism</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Judul Video <span className="text-xs font-normal ml-1 font-mono">(Spintax Supported)</span></label>
                <input type="text" value={youtubeTitle} onChange={e => setYoutubeTitle(e.target.value)} placeholder="{Live|Update} Judul Video Anda..." className={`${inputClassName} ${youtubeTitle.length > 100 ? 'border-red-500 focus:border-red-500' : ''} font-mono`} />
                <p className={`text-[10px] mt-1.5 font-medium ${youtubeTitle.length > 100 ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>{youtubeTitle.length} / 100 karakter {youtubeTitle.length > 100 && '(Terlalu panjang!)'}</p>
              </div>
              <div>
                <label className={labelClassName}>Deskripsi <span className="text-xs font-normal ml-1 font-mono">(Spintax Supported)</span></label>
                <textarea rows="3" value={youtubeDescription} onChange={e => setYoutubeDescription(e.target.value)} placeholder="Deskripsi video stream..." className={`${inputClassName} font-mono resize-none`}></textarea>
              </div>
              <div>
                <label className={labelClassName}>Tag Video <span className="text-xs font-normal ml-1">(Pisahkan dengan koma)</span></label>
                <input type="text" value={youtubeTags} onChange={e => setYoutubeTags(e.target.value)} placeholder="berita, live stream, update" className={`${inputClassName} font-mono`} />
              </div>

              <div className="mt-2 bg-gray-50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-200 dark:border-slate-700/50">
                <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500 dark:text-slate-400" /> Aturan Publikasi & Visibilitas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Status Setelah Live</label>
                    <select value={youtubePrivacy} onChange={e => setYoutubePrivacy(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm dark:text-slate-200">
                      <option value="public">Publik</option>
                      <option value="unlisted">Tidak Publik (Unlisted)</option>
                      <option value="private">Privat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Konten Sintetis (AI)</label>
                    <select value={syntheticContent} onChange={e => setSyntheticContent(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm dark:text-slate-200">
                      <option value="no">Tidak (Konten Asli)</option>
                      <option value="yes">Ya (Menggunakan AI)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Monetisasi (Ads)</label>
                    <select value={monetization} onChange={e => setMonetization(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm dark:text-slate-200">
                      <option value="on">Aktif (On)</option>
                      <option value="off">Tidak Aktif (Off)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Playlist Target</label>
                    <select value={targetPlaylist} onChange={e => setTargetPlaylist(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-sm truncate dark:text-slate-200">
                      <option value="none">-- Jangan tambahkan --</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: JADWAL, ENCODER, PERLINDUNGAN & CHATBOT */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-4 mb-5 text-gray-800 dark:text-slate-100"><Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Jadwal Live</h3>
            <div className="flex flex-wrap bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl gap-1 mb-5">
              {['manual', 'sekali', 'harian', 'smart-weekly'].map((mode) => (
                <button key={mode} onClick={() => setJadwalMode(mode)} className={`flex-1 min-w-[80px] text-[13px] py-2 px-2 rounded-lg font-semibold transition-all ${jadwalMode === mode ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:text-slate-400'}`}>
                  {mode === 'smart-weekly' ? 'Mingguan' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 mb-5">
              {(jadwalMode === 'manual' || jadwalMode === 'sekali' || jadwalMode === 'harian') && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Waktu Mulai {jadwalMode === 'manual' ? 'Manual' : jadwalMode === 'sekali' ? 'Satu Kali' : 'Harian'}
                    </label>
                  </div>
                  <input 
                    type="time" 
                    value={scheduleTime} 
                    onChange={e => setScheduleTime(e.target.value)} 
                    className={inputClassName} 
                  />
                  <input 
                    type="date" 
                    value={scheduleDate} 
                    onChange={e => setScheduleDate(e.target.value)} 
                    className={`${inputClassName} text-gray-500 dark:text-slate-400`} 
                  />
                </div>
              )}

              {jadwalMode === 'smart-weekly' && (
                <div className="border border-gray-200 dark:border-slate-600/60 rounded-xl overflow-hidden bg-white dark:bg-slate-800 mb-4">
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 px-4 py-2.5 border-b border-gray-200 dark:border-slate-600/60"><span className="font-semibold text-[13px] text-blue-800 dark:text-blue-300">Kalender Visual (WIB)</span></div>
                  <div className="divide-y divide-gray-100 dark:divide-slate-700/50 max-h-52 overflow-y-auto custom-scrollbar">
                    {Object.keys(scheduleGrid).map(day => (
                      <div key={day} className={`flex items-center justify-between p-2.5 gap-3 transition-colors ${scheduleGrid[day].active ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-slate-900/20'}`}>
                        <label className="flex items-center gap-2 cursor-pointer w-24">
                          <input type="checkbox" checked={scheduleGrid[day].active} onChange={() => setScheduleGrid({...scheduleGrid, [day]: {...scheduleGrid[day], active: !scheduleGrid[day].active}})} className="w-4 h-4 rounded text-blue-600 dark:text-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 cursor-pointer" />
                          <span className={`text-[13px] ${scheduleGrid[day].active ? 'font-bold text-gray-900 dark:text-slate-100' : 'font-medium text-gray-400 dark:text-slate-500'}`}>{day}</span>
                        </label>
                        <div className={`flex items-center gap-1.5 flex-1 ${scheduleGrid[day].active ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                          <input type="time" value={scheduleGrid[day].start} onChange={(e) => setScheduleGrid({...scheduleGrid, [day]: {...scheduleGrid[day], start: e.target.value}})} className="bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1 text-xs w-full outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-slate-200" />
                          <span className="text-gray-400 dark:text-slate-500 text-xs">-</span>
                          <input type="time" value={scheduleGrid[day].end} onChange={(e) => setScheduleGrid({...scheduleGrid, [day]: {...scheduleGrid[day], end: e.target.value}})} className="bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1 text-xs w-full outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700/50 pt-4">
                <div className="flex flex-col">
                   <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Stop Otomatis</span>
                   <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                      <input type="checkbox" checked={randomizeStop} onChange={() => setRandomizeStop(!randomizeStop)} className="w-3 h-3 text-emerald-600 rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 focus:ring-emerald-500" />
                      <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Acak ±15 mnt (Anti-Spam)</span>
                   </label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1">
                    <input type="number" value={stopHours} onChange={e=>setStopHours(e.target.value)} min="0" className="w-8 bg-transparent outline-none text-sm text-center font-mono dark:text-slate-200" /> <span className="text-[10px] font-bold text-gray-400 uppercase">Jam</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600/60 rounded-md px-2 py-1">
                    <input type="number" value={stopMinutes} onChange={e=>setStopMinutes(e.target.value)} min="0" max="59" className="w-8 bg-transparent outline-none text-sm text-center font-mono dark:text-slate-200" /> <span className="text-[10px] font-bold text-gray-400 uppercase">Menit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-4 mb-5 text-gray-800 dark:text-slate-100">
              <Cpu className="w-5 h-5 text-purple-500 dark:text-purple-400" /> Encoder & Output
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClassName}>Engine Encoder</label>
                <select value={encoderEngine} onChange={e=>setEncoderEngine(e.target.value)} className={inputClassName}>
                  <option value="copy">Direct Copy (Ringan)</option>
                  <option value="x264">x264 (Software)</option>
                  <option value="nvenc">NVENC (NVIDIA GPU)</option>
                  <option value="qsv">QuickSync (Intel)</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Resolusi Output</label>
                <select value={outputResolution} onChange={e=>setOutputResolution(e.target.value)} className={inputClassName}>
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
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-4 mb-5 text-gray-800 dark:text-slate-100"><Image className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Pengaturan Thumbnail</h3>
            <input type="file" ref={thumbInputRef} accept="image/*" onChange={handleThumbUploadChange} className="hidden" />
            <div onClick={() => thumbInputRef.current?.click()} className="flex-1 min-h-[160px] border-2 border-dashed border-gray-300 dark:border-slate-600/60 rounded-xl p-2 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer group overflow-hidden relative">
              {isUploadingThumb ? ( <span className="text-sm font-semibold text-gray-500 animate-pulse">Mengupload...</span> ) : thumbnailUrl ? ( <img src={thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover rounded-lg" /> ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 mb-3 transition-colors" />
                  <p className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Pilih File Gambar Thumbnail</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Klik di sini untuk upload</p>
                </>
              )}
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
                  <select value={fallbackVideo} onChange={e=>setFallbackVideo(e.target.value)} className="w-full bg-white dark:bg-slate-900/50 border border-orange-200 dark:border-amber-800/50 rounded-lg px-3 py-2.5 outline-none focus:border-orange-500 dark:focus:border-amber-500 text-sm font-medium transition-colors dark:text-slate-200">
                    <option value="">-- Pilih Video Fallback --</option>
                    {availableVideos.map(vid => <option key={vid} value={vid}>{vid}</option>)}
                  </select>
               </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-emerald-900/10 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-slate-700/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center"><Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div>
                <div><h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">YouTube Chatbot Terintegrasi</h3><p className="text-xs text-gray-500 dark:text-slate-400">Pesan otomatis di Live Chat</p></div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={chatbotEnabled} onChange={() => setChatbotEnabled(!chatbotEnabled)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <div className={`space-y-4 transition-opacity ${chatbotEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold flex items-center gap-2 dark:text-slate-200"><Clock className="w-4 h-4 text-gray-500" /> Timeline Pesan Bot</h4>
                <button onClick={() => setScheduledMessages([...scheduledMessages, { id: Date.now(), hour: 0, minute: 5, text: "" }])} className="text-xs text-emerald-600 font-medium">+ Tambah Jadwal</button>
              </div>
              <div className="space-y-3">
                {scheduledMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700/50">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-gray-500">Kirim setelah stream jalan:</span>
                        <input type="number" min="0" value={msg.hour} onChange={(e) => setScheduledMessages(scheduledMessages.map(m => m.id === msg.id ? { ...m, hour: e.target.value } : m))} className="w-14 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none text-center dark:text-slate-200" /> <span className="text-xs font-medium dark:text-slate-300">Jam</span>
                        <input type="number" min="0" max="59" value={msg.minute} onChange={(e) => setScheduledMessages(scheduledMessages.map(m => m.id === msg.id ? { ...m, minute: e.target.value } : m))} className="w-14 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none text-center dark:text-slate-200" /> <span className="text-xs font-medium dark:text-slate-300">Menit</span>
                      </div>
                      <textarea rows="2" value={msg.text} onChange={(e) => setScheduledMessages(scheduledMessages.map(m => m.id === msg.id ? { ...m, text: e.target.value } : m))} placeholder="Isi pesan bot..." className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded px-3 py-2 text-sm outline-none resize-none dark:text-slate-200"></textarea>
                    </div>
                    <button onClick={() => setScheduledMessages(scheduledMessages.filter(m => m.id !== msg.id))} className="mt-6 p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {scheduledMessages.length === 0 && <div className="text-center py-3 text-sm text-gray-500 border border-dashed border-gray-300 dark:border-slate-700 rounded-lg">Belum ada jadwal pesan bot.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 md:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 sticky bottom-4 z-50">
         <div className="flex items-center gap-4 w-full sm:w-auto">
           <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0"><div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div></div>
           <div><p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-0.5">Status Tugas Live</p><p className="text-sm font-bold text-blue-600 dark:text-blue-400">Siap Disimpan</p></div>
         </div>
         <div className="flex w-full sm:w-auto gap-3">
           <button onClick={() => handleSaveTask(false)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold transition-colors text-sm bg-white">💾 Simpan ke Database</button>
           <button onClick={() => handleSaveTask(true)} className="flex-1 sm:flex-none px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors text-sm shadow-md"><PlayCircle className="w-5 h-5" /> Simpan & Mulai Live</button>
         </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// TAB 3: MEDIA (DENGAN PREVIEW VIDEO BESAR & RENAME)
// -----------------------------------------------------------------------------
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
  const [fileToDelete, setFileToDelete] = useState(null);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  
  // State untuk Rename
  const [fileToRename, setFileToRename] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  
  const fileInputRef = useRef(null);

  const fetchMedia = async () => { if (isPreview) return; try { const res = await fetch(`${API_BASE}/api/media`); setMediaFiles(await res.json()); } catch (e) {} };
  const fetchPlaylists = async () => { if (isPreview) return; try { const res = await fetch(`${API_BASE}/api/playlists`); setPlaylists(await res.json()); } catch (e) {} };

  useEffect(() => { fetchMedia(); fetchPlaylists(); }, [API_BASE, isPreview]);

  const handleActualUpload = async (e) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    if (isPreview) return alert('Simulasi: File dipilih.');
    setIsUploading(true); setUploadText('Mengunggah ke VPS...'); setUploadProgress(10);
    const formData = new FormData(); for (let i = 0; i < files.length; i++) formData.append('files', files[i]);
    const progressInterval = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 500);

    try {
      const res = await fetch(`${API_BASE}/api/media/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if(data.success) { setUploadProgress(100); setTimeout(() => { alert(data.message); setIsUploading(false); setUploadProgress(0); fetchMedia(); }, 500); } 
      else throw new Error(data.message);
    } catch (err) { alert('Gagal mengunggah file.'); setIsUploading(false); setUploadProgress(0); } finally { clearInterval(progressInterval); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleImportUrlSubmit = async () => {
    if (!importUrl.trim()) return alert('URL tidak boleh kosong.');
    if (isPreview) { setShowImportUrlModal(false); setImportUrl(''); return alert('Simulasi: Import URL.'); }
    setShowImportUrlModal(false); setIsUploading(true); setUploadText('Mengunduh file...'); setUploadProgress(10);
    const progressInterval = setInterval(() => setUploadProgress(prev => Math.min(prev + 5, 90)), 1000);

    try {
      const res = await fetch(`${API_BASE}/api/media/import-url`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: importUrl }) });
      const data = await res.json();
      if(data.success) { setUploadProgress(100); setTimeout(() => { alert(data.message); setIsUploading(false); setUploadProgress(0); setImportUrl(''); fetchMedia(); }, 500); } 
      else throw new Error(data.message);
    } catch (err) { alert(err.message || 'Gagal mengimpor.'); setIsUploading(false); setUploadProgress(0); } finally { clearInterval(progressInterval); }
  };

  const handleSavePlaylist = async () => {
    if (!newPlaylistName.trim() || selectedPlaylistVideos.length === 0) return alert('Nama playlist dan minimal 1 video harus diisi/dipilih.');
    if (isPreview) { setShowPlaylistModal(false); return alert('Simulasi: Playlist disimpan.'); }
    try {
      const res = await fetch(`${API_BASE}/api/playlists`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newPlaylistName, videos: selectedPlaylistVideos }) });
      const data = await res.json();
      if (data.success) { alert(data.message); setShowPlaylistModal(false); setNewPlaylistName(''); setSelectedPlaylistVideos([]); fetchPlaylists(); setActiveFolder('Playlist Looping'); } 
      else alert(data.message);
    } catch (e) { alert('Gagal menyimpan playlist.'); }
  };

  const confirmDeleteFile = async () => {
    if (isPreview) { setMediaFiles(mediaFiles.filter(f => f.id !== fileToDelete.id)); setFileToDelete(null); return; }
    try { await fetch(`${API_BASE}/api/media/${fileToDelete.name}`, { method: 'DELETE' }); fetchMedia(); setFileToDelete(null); } catch(e) {}
  };

  const confirmDeletePlaylist = async () => {
    if (isPreview) { setPlaylists(playlists.filter(p => p.id !== playlistToDelete.id)); setPlaylistToDelete(null); return; }
    try { await fetch(`${API_BASE}/api/playlists/${playlistToDelete.id}`, { method: 'DELETE' }); fetchPlaylists(); setPlaylistToDelete(null); } catch(e) {}
  };

  const handleRenameFile = async () => {
    if(!newFileName.trim()) return alert('Nama baru tidak boleh kosong!');
    if(isPreview) { setFileToRename(null); return alert('Simulasi: File berhasil diubah nama.'); }
    
    // Pastikan tidak ada spasi agar FFmpeg tidak bingung
    const safeNewName = newFileName.replace(/\s+/g, '_');
    
    try {
      const res = await fetch(`${API_BASE}/api/media/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName: fileToRename.name, newName: safeNewName })
      });
      const data = await res.json();
      if(data.success) {
        fetchMedia();
        fetchPlaylists(); // Refresh playlist karena nama file berubah
        setFileToRename(null);
      } else {
        alert(data.message);
      }
    } catch(e) { alert('Terjadi kesalahan saat mengganti nama file.'); }
  };

  const toggleVideoForPlaylist = (vid) => {
    if (selectedPlaylistVideos.includes(vid)) setSelectedPlaylistVideos(selectedPlaylistVideos.filter(v => v !== vid));
    else setSelectedPlaylistVideos([...selectedPlaylistVideos, vid]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm overflow-hidden relative">
      <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/50 shrink-0">
        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Film className="w-4 h-4 text-gray-400 dark:text-slate-500" /> Manajemen Media & Playlist</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowImportUrlModal(true)} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 hover:text-blue-600 dark:text-slate-300 rounded-md flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase transition-colors"><LinkIcon className={`w-3.5 h-3.5`} /> Import URL</button>
          <input type="file" multiple accept="video/mp4,video/mkv,image/*" className="hidden" ref={fileInputRef} onChange={handleActualUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase transition-opacity"><Upload className="w-3.5 h-3.5" /> Upload Lokal</button>
        </div>
      </div>

      {isUploading && (
        <div className="px-5 py-2 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30 flex items-center gap-4 shrink-0">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest w-48 truncate">{uploadText}</span>
          <div className="flex-1 h-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden"><div className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div></div>
          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-60 flex flex-col border-r border-gray-100 dark:border-slate-700/60 bg-gray-50/30 dark:bg-slate-900/30 shrink-0">
          <div className="p-3 flex-1 overflow-y-auto space-y-0.5 custom-scrollbar">
            <div className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-2 pb-2 pt-1">Direktori Penyimpanan</div>
            <div onClick={() => setActiveFolder('Video Berita Utama')}><FolderItem name="Semua Video / Media" count={mediaFiles.length} active={activeFolder === 'Video Berita Utama'} /></div>
            <div onClick={() => setActiveFolder('Playlist Looping')}><FolderItem name="Playlist Tersimpan" count={playlists.length} active={activeFolder === 'Playlist Looping'} /></div>
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-slate-700/60 space-y-1.5 bg-white dark:bg-slate-800/50 shrink-0">
            <button onClick={() => setShowPlaylistModal(true)} className="w-full text-left px-3 py-2 text-xs font-medium text-gray-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> Buat Playlist Baru</button>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-800 p-5 overflow-y-auto relative custom-scrollbar">
          {activeFolder === 'Video Berita Utama' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mediaFiles.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 h-40 border border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                  <FolderOpen className="w-8 h-8 mb-2 opacity-50" /><span className="text-sm">Folder Media Kosong</span>
                </div>
              ) : ( 
                mediaFiles.map((file) => (
                  <VideoPreviewCard 
                    key={file.id} 
                    name={file.name} 
                    size={file.size} 
                    API_BASE={API_BASE}
                    onEdit={() => { setFileToRename(file); setNewFileName(file.name); }}
                    onDelete={() => setFileToDelete(file)} 
                  />
                )) 
              )}
            </div>
          )}

          {activeFolder === 'Playlist Looping' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {playlists.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 h-40 border border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                  <ListVideo className="w-8 h-8 mb-2 opacity-50" /><span className="text-sm">Belum Ada Playlist</span>
                </div>
              ) : (
                playlists.map((pl) => (
                  <div key={pl.id} className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700/60 rounded-xl p-4 shadow-sm hover:shadow transition-shadow group relative">
                    <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><ListVideo className="w-5 h-5" /></div><div><h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{pl.name}</h4><p className="text-xs text-gray-500">{pl.count} Video</p></div></div>
                    <div className="space-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700/50 max-h-24 overflow-y-auto custom-scrollbar">
                       {pl.videos.map((vid, idx) => <div key={idx} className="text-[11px] text-gray-600 dark:text-slate-300 flex items-center gap-2 truncate"><span className="text-gray-400">{idx+1}.</span> {vid}</div>)}
                    </div>
                    <button onClick={() => setPlaylistToDelete(pl)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-gray-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showImportUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowImportUrlModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl shadow-black/40 overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60 flex justify-between items-center"><h3 className="text-lg font-bold dark:text-slate-100 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-blue-500" /> Import File URL</h3><button onClick={() => setShowImportUrlModal(false)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6" /></button></div>
            <div className="p-6">
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">URL Langsung</label>
              <input type="text" value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="Paste link di sini..." className="w-full bg-white dark:bg-slate-900/80 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-3 outline-none font-mono text-sm shadow-sm" autoFocus />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/60 flex justify-end gap-3"><button onClick={() => setShowImportUrlModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm">Batal</button><button onClick={handleImportUrlSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Mulai Import</button></div>
          </div>
        </div>
      )}

      {/* Modal Rename */}
      {fileToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setFileToRename(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl shadow-black/40 overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60 flex justify-between items-center"><h3 className="text-lg font-bold dark:text-slate-100 flex items-center gap-2"><Pencil className="w-5 h-5 text-blue-500" /> Ganti Nama File</h3><button onClick={() => setFileToRename(null)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6" /></button></div>
            <div className="p-6">
              <label className="block text-sm font-medium mb-2 dark:text-slate-300">Nama File Baru</label>
              <input type="text" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-900/80 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-3 outline-none font-mono text-sm shadow-sm dark:text-white" autoFocus />
              <p className="text-xs text-gray-500 mt-2">Catatan: Spasi akan otomatis diubah menjadi garis bawah (_) agar sistem FFmpeg tidak error.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/60 flex justify-end gap-3"><button onClick={() => setFileToRename(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm">Batal</button><button onClick={handleRenameFile} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Simpan</button></div>
          </div>
        </div>
      )}

      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/40 overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60 flex justify-between items-center"><h3 className="text-lg font-bold dark:text-slate-100">Buat Playlist</h3><button onClick={() => setShowPlaylistModal(false)} className="text-gray-400 hover:text-emerald-500"><XCircle className="w-6 h-6" /></button></div>
            <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
              <div><label className="block text-sm font-medium mb-1.5 dark:text-slate-300">Nama Playlist</label><input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 outline-none" /></div>
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 mb-2">Pilih Video</label>
                <div className="border border-gray-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
                  <div className="max-h-48 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {mediaFiles.map((file) => {
                      const isSelected = selectedPlaylistVideos.includes(file.name);
                      return (
                        <label key={file.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border ${isSelected ? 'bg-emerald-50 border-emerald-200' : 'border-transparent hover:bg-gray-100'}`}>
                          <input type="checkbox" checked={isSelected} onChange={() => {
                            if (isSelected) setSelectedPlaylistVideos(selectedPlaylistVideos.filter(v => v !== file.name));
                            else setSelectedPlaylistVideos([...selectedPlaylistVideos, file.name]);
                          }} className="w-4 h-4 text-emerald-600" />
                          <Video className="w-4 h-4 text-gray-400" /><span className="text-sm flex-1 truncate">{file.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3"><button onClick={() => setShowPlaylistModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm">Batal</button><button onClick={handleSavePlaylist} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Simpan Playlist</button></div>
          </div>
        </div>
      )}

      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-2xl p-6 text-center border border-gray-200 dark:border-slate-700">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="text-lg font-bold mb-2 dark:text-slate-100">Hapus Media?</h3>
            <p className="text-sm text-gray-500 mb-6">File <strong>{fileToDelete.name}</strong> akan dihapus permanen.</p>
            <div className="flex justify-center gap-3"><button onClick={() => setFileToDelete(null)} className="px-4 py-2 border rounded-lg text-sm">Batal</button><button onClick={confirmDeleteFile} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Hapus</button></div>
          </div>
        </div>
      )}

      {playlistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-2xl p-6 text-center border border-gray-200 dark:border-slate-700">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="text-lg font-bold mb-2 dark:text-slate-100">Hapus Playlist?</h3>
            <p className="text-sm text-gray-500 mb-6">Playlist <strong>{playlistToDelete.name}</strong> akan dihapus.</p>
            <div className="flex justify-center gap-3"><button onClick={() => setPlaylistToDelete(null)} className="px-4 py-2 border rounded-lg text-sm">Batal</button><button onClick={confirmDeletePlaylist} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Hapus</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// KOMPONEN BARU: VIDEO PREVIEW CARD (TAMPILAN BESAR)
function VideoPreviewCard({ name, size, onEdit, onDelete, API_BASE }) {
  const isImage = name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i);
  const mediaUrl = `${API_BASE}/media/${name}`;
  const videoRef = useRef(null);

  // Fungsi agar video berputar otomatis tanpa suara saat di-hover
  const handleMouseEnter = () => {
      if (videoRef.current) {
          videoRef.current.play().catch(() => {});
      }
  };

  // Fungsi agar video berhenti dan kembali ke awal saat mouse dijauhkan
  const handleMouseLeave = () => {
      if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 1; // Kembali ke detik 1 (thumbnail)
      }
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-48 relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* BAGIAN GAMBAR / VIDEO PREVIEW BESAR */}
      <div className="flex-1 bg-gray-900 dark:bg-black relative overflow-hidden flex items-center justify-center">
        {isImage ? (
          <img src={mediaUrl} alt={name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <video 
             ref={videoRef}
             src={`${mediaUrl}#t=1`} 
             className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" 
             muted 
             loop
             playsInline
             preload="metadata" 
          />
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
           {!isImage && <PlayCircle className="w-10 h-10 text-white opacity-80 scale-90 group-hover:scale-100 transition-transform" />}
        </div>
      </div>

      {/* BAGIAN INFORMASI & TOMBOL RENAME/HAPUS BAWAH */}
      <div className="p-3 bg-white dark:bg-slate-800 flex items-center justify-between gap-2 shrink-0 border-t border-gray-100 dark:border-slate-700/50">
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate" title={name}>{name}</p>
          <p className="text-[10px] font-mono text-gray-500 mt-0.5">{size}</p>
        </div>
        <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 text-gray-500 hover:text-blue-500 bg-gray-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Ganti Nama"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}


function AnalyticsView({ accounts, API_BASE }) {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks`);
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } catch (e) {}
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  const activeLiveTasks = tasks.filter(t => t.status === 'Live');
  const totalViewers = activeLiveTasks.reduce((sum, t) => sum + (t.viewers || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700/60 gap-4 shadow-sm">
         <div className="flex flex-wrap gap-4">
           <select className="bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2 outline-none text-sm font-medium focus:border-emerald-500 dark:focus:border-emerald-400 dark:text-slate-200">
              <option value="all">Semua Channel (Keseluruhan)</option>
              {accounts?.map(acc => ( <option key={acc.id} value={acc.id}>{acc.name}</option> ))}
           </select>
           <select className="bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2 outline-none text-sm font-medium focus:border-emerald-500 dark:focus:border-emerald-400 dark:text-slate-200">
              <option>Hari Ini (Live)</option><option>7 Hari Terakhir</option><option>30 Hari Terakhir</option>
           </select>
         </div>
         <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2 bg-green-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-emerald-800/30">
            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-emerald-400 animate-pulse"></div>
            Sinkronisasi API: Real-time (2 Min)
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Penonton (CCV)" value={totalViewers} icon={Users} color="text-blue-600" bgColor="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard title="Live Stream Aktif" value={activeLiveTasks.length} icon={Activity} color="text-purple-600" bgColor="bg-purple-50 dark:bg-purple-900/20" />
        <StatCard title="Total Tugas Disimpan" value={tasks.length} icon={FolderOpen} color="text-yellow-600" bgColor="bg-yellow-50 dark:bg-amber-900/20" />
        <StatCard title="Status Mesin Server" value="Optimal" icon={Server} color="text-emerald-600" bgColor="bg-emerald-50 dark:bg-emerald-900/20" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-6 dark:text-slate-100">Pemantauan Penonton Live</h3>
          <div className="flex-1 overflow-x-auto pb-2">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-200 dark:border-slate-700/60">
                  <th className="pb-3">NAMA TUGAS</th><th className="pb-3 text-center">PENONTON (CCV)</th><th className="pb-3 text-right">DURASI (UPTIME)</th>
                </tr>
              </thead>
              <tbody>
                {activeLiveTasks.length === 0 ? (
                  <tr><td colSpan="3" className="py-8 text-center text-sm text-gray-400">Tidak ada Live Streaming yang berjalan.</td></tr>
                ) : (
                  activeLiveTasks.map(t => (
                    <tr key={t.id} className="border-b border-gray-100 dark:border-slate-700/30">
                      <td className="py-4 font-medium dark:text-slate-200">{t.taskName}</td>
                      <td className="py-4 text-center font-bold text-emerald-600">{t.viewers || 0}</td>
                      <td className="py-4 text-right font-mono text-gray-500">{t.uptime || '00:00'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">Top Performa Live</h3>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {activeLiveTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-400">Belum ada aktivitas live.</p></div>
            ) : (
              [...activeLiveTasks].sort((a,b) => (b.viewers || 0) - (a.viewers || 0)).map((stream, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 dark:bg-slate-900/50'}`}>#{i+1}</div>
                  <div className="flex-1 overflow-hidden"><div className="text-sm font-semibold truncate dark:text-slate-200">{stream.taskName}</div></div>
                  <div className="text-right"><div className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1 justify-end"><Users className="w-3.5 h-3.5 text-gray-400" /> {stream.viewers || 0}</div></div>
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
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [triggerError, setTriggerError] = useState(true);
  const [triggerCpu, setTriggerCpu] = useState(true);
  
  const [accountName, setAccountName] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  const inputClassName = "w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 font-mono text-sm dark:text-slate-200 transition-colors";

  useEffect(() => {
    if (isPreview) return;
    fetch(`${API_BASE}/api/settings/notifications`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setNotifEnabled(data.settings.notifEnabled || false);
          setNotifPlatform(data.settings.notifPlatform || 'telegram');
          setTelegramToken(data.settings.telegramToken || '');
          setTelegramChatId(data.settings.telegramChatId || '');
          setTriggerError(data.settings.triggerError ?? true);
          setTriggerCpu(data.settings.triggerCpu ?? true);
        }
      }).catch(e => {});
  }, [API_BASE, isPreview]);

  const handleSaveNotif = async () => {
    if (isPreview) return alert('Simulasi: Pengaturan notifikasi disimpan.');
    try {
      const payload = { notifEnabled, notifPlatform, telegramToken, telegramChatId, triggerError, triggerCpu };
      await fetch(`${API_BASE}/api/settings/notifications`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      alert('Pengaturan notifikasi berhasil disimpan!');
    } catch(e) { alert('Gagal menyimpan pengaturan notifikasi.'); }
  };

  const handleTestNotif = async () => {
    if (isPreview) return alert('Simulasi: Pesan test terkirim.');
    if (!telegramToken || !telegramChatId) return alert('Silakan isi Token dan Chat ID Telegram terlebih dahulu.');
    try {
      const res = await fetch(`${API_BASE}/api/notifications/test`, { method: 'POST' });
      const data = await res.json();
      alert(data.message);
    } catch(e) { alert('Gagal mengirim pesan test.'); }
  };

  const handleSaveGoogleCredentials = async () => {
    if (!clientId || !clientSecret) return alert('Client ID dan Client Secret harus diisi!');
    if (isPreview) return alert('Simulasi (Layar Preview): Kredensial Google berhasil divalidasi.');
    setIsSavingCreds(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings/google-credentials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId, clientSecret }) });
      const data = await res.json();
      alert(data.success ? 'Berhasil: ' + data.message : 'Gagal: ' + data.message);
      if (data.success) { setClientId(''); setClientSecret(''); }
    } catch (err) {} finally { setIsSavingCreds(false); }
  };

  const handleLoginGoogle = async () => {
    if (isPreview) return alert('Fitur otentikasi Google hanya dapat dijalankan di VPS atau Localhost.');
    try {
      const res = await fetch(`${API_BASE}/api/auth/url`);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank'); else if (data.error) alert('Error: ' + data.error);
    } catch (err) {}
  };

  const handleSaveAccount = async () => {
    if (!accountName || !authUrl) return alert('Nama akun dan URL lengkap harus diisi!');
    if (isPreview) return alert('Simulasi: Akun berhasil ditambahkan.');
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountName, authUrl }) });
      const data = await res.json();
      alert(data.success ? 'Berhasil: ' + data.message : 'Gagal: ' + data.message);
      if (data.success) { setAccountName(''); setAuthUrl(''); fetchAccounts(); }
    } catch (err) {} finally { setIsSaving(false); }
  };

  const deleteAccount = async (id) => {
    if (isPreview) return;
    if (!window.confirm('Anda yakin ingin menghapus sambungan akun ini?')) return;
    try { await fetch(`${API_BASE}/api/settings/account/${id}`, { method: 'DELETE' }); fetchAccounts(); } catch (e) {}
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Kolom Kiri */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
          <div className="border-b border-gray-200 dark:border-slate-700/60 pb-4 mb-4"><h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Sliders className="w-5 h-5 text-emerald-500" /> Setup Kredensial Google API</h3></div>
          {accounts?.length > 0 && (
            <div className="mb-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div><p className="text-sm text-emerald-800 dark:text-emerald-300 font-bold">Kredensial Valid & Aktif</p><p className="text-xs text-emerald-600 dark:text-emerald-400/90 mt-1">Sistem telah terhubung dengan <strong>{accounts.length} Channel YouTube</strong>. API siap digunakan untuk Live Streaming Otomatis dan Fitur Chatbot.</p></div>
            </div>
          )}
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Client ID</label><input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Contoh: 123456789-xxxxxx.apps.googleusercontent.com" className={inputClassName} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Client Secret</label><input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} placeholder="Contoh: GOCSPX-xxxxxx_xxxxxxxxxx" className={inputClassName} /></div>
            <div className="pt-2"><button onClick={handleSaveGoogleCredentials} disabled={isSavingCreds} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">{isSavingCreds ? 'Menyimpan...' : 'Simpan Kredensial API'}</button></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
          <div className="border-b border-gray-200 dark:border-slate-700/60 pb-4 mb-4"><h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><Radio className="w-5 h-5 text-emerald-500" /> Autentikasi Manual (Login)</h3></div>
          <div className="flex justify-center mb-8">
            <button onClick={handleLoginGoogle} className="flex items-center gap-3 px-6 py-2.5 border-2 border-gray-200 dark:border-slate-600/60 text-gray-700 dark:text-slate-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">1. Buka Login Google</span>
            </button>
          </div>
          <div className="space-y-5 bg-gray-50 dark:bg-slate-900/30 p-5 rounded-xl border border-gray-100 dark:border-slate-700/50">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">2. Nama Akun</label><input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Contoh: ChannelGaming01" className={inputClassName} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">3. Tempel URL Lengkap</label><textarea rows="4" value={authUrl} onChange={(e) => setAuthUrl(e.target.value)} className="w-full bg-white dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600/60 rounded-md px-4 py-3 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 font-mono text-xs break-all text-gray-600 dark:text-slate-300 shadow-sm" placeholder="http://localhost/?state=ppVwnH...&code=4/0A..."></textarea></div>
          </div>
          <div className="mt-6"><button onClick={handleSaveAccount} disabled={isSaving} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-md">{isSaving ? 'Memproses...' : 'Simpan Akun'}</button></div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700/60 pb-4 mb-5"><h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2"><PlayCircle className="w-5 h-5 text-red-500" /> Channel YouTube Terhubung</h3></div>
          {accounts?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all shadow-sm group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0"><PlayCircle className="w-5 h-5" /></div>
                    <div className="overflow-hidden"><p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">{acc.name}</p><p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5"><CheckCircle2 className="w-3 h-3" /> Siap digunakan</p></div>
                  </div>
                  <button onClick={() => deleteAccount(acc.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100" title="Putus Koneksi Akun"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-slate-400 p-8 text-center border border-dashed border-gray-300 dark:border-slate-700/60 rounded-xl bg-gray-50/50 dark:bg-slate-900/20"><Users className="w-10 h-10 mx-auto text-gray-400 mb-3 opacity-50" /><p className="font-semibold text-gray-700 dark:text-slate-300 mb-1">Belum Ada Channel Terhubung</p></div>
          )}
        </div>
      </div>

      {/* Kolom Kanan */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h3 className="text-lg font-semibold dark:text-slate-100">Peringatan & Notifikasi Sistem</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notifEnabled} onChange={(e) => setNotifEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
            Kirim peringatan otomatis ke ponsel Anda jika terjadi kendala pada VPS atau Streaming.
          </p>

          <div className={`transition-opacity ${notifEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Platform Notifikasi</label>
                <select 
                  value={notifPlatform}
                  onChange={(e) => setNotifPlatform(e.target.value)}
                  className={inputClassName}
                >
                  <option value="telegram">Telegram Bot</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Bot Token</label>
                <input 
                   type="password" 
                   value={telegramToken}
                   onChange={(e) => setTelegramToken(e.target.value)}
                   placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" 
                   className={inputClassName} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Chat ID (Target Group/User)</label>
                <input 
                   type="text" 
                   value={telegramChatId}
                   onChange={(e) => setTelegramChatId(e.target.value)}
                   placeholder="123456789" 
                   className={inputClassName} 
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900/30 rounded-xl p-4 border border-gray-200 dark:border-slate-700/50">
              <h4 className="text-sm font-semibold mb-3 dark:text-slate-200">Pemicu Peringatan (Triggers)</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={triggerError} onChange={(e) => setTriggerError(e.target.checked)} className="w-4 h-4 text-emerald-600 dark:text-emerald-500 rounded border-gray-300 dark:border-slate-600 focus:ring-emerald-500 bg-white dark:bg-slate-800" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Stream dimulai, terputus (Error), atau dihentikan.</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={triggerCpu} onChange={(e) => setTriggerCpu(e.target.checked)} className="w-4 h-4 text-emerald-600 dark:text-emerald-500 rounded border-gray-300 dark:border-slate-600 focus:ring-emerald-500 bg-white dark:bg-slate-800" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Penggunaan CPU VPS melebihi 85%</span>
                </label>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-200 dark:border-slate-700/60 flex flex-wrap gap-3 justify-end">
                <button 
                  onClick={handleSaveNotif}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  💾 Simpan Pengaturan
                </button>
                <button 
                  onClick={handleTestNotif}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Test Kirim Pesan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function LogView({ isPreview, API_BASE }) {
  const [logs, setLogs] = useState([{ type: 'info', text: 'Menghubungkan ke log server VPS...' }]);
  const [bitrateHistory, setBitrateHistory] = useState(Array(20).fill(0));
  const [currentFps, setCurrentFps] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [currentBitrateStr, setCurrentBitrateStr] = useState('0');
  
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [autoScroll, setAutoScroll] = useState(true); 

  const logsEndRef = useRef(null);
  const logContainerRef = useRef(null);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20;
    setAutoScroll(isNearBottom);
  };

  useEffect(() => {
    if (isPreview) return;
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setTasks(data);
          if (!selectedTaskId && data.length > 0) {
             const activeTask = data.find(t => t.status === 'Live') || data[0];
             if (activeTask) setSelectedTaskId(activeTask.id);
          }
        }
      } catch(e) {}
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, [API_BASE, isPreview, selectedTaskId]);

  useEffect(() => {
    if (isPreview) return;
    const fetchLogs = async () => {
      try {
        const url = selectedTaskId ? `${API_BASE}/api/logs?taskId=${selectedTaskId}` : `${API_BASE}/api/logs`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.logs) {
          const formattedLogs = data.logs.filter(l => l.trim() !== '').map(text => {
            let type = 'ffmpeg';
            if (text.includes('[SYSTEM]')) type = 'system';
            else if (text.includes('[CHATBOT')) type = 'success';
            else if (text.includes('[YOUTUBE API')) type = 'info';
            else if (text.toLowerCase().includes('error') || text.toLowerCase().includes('failed') || text.toLowerCase().includes('could not')) type = 'error';
            return { type, text };
          });
          
          if(formattedLogs.length > 0) {
             setLogs(formattedLogs);
             const lastLog = formattedLogs[formattedLogs.length - 1].text;
             const fpsMatch = lastLog.match(/fps=\s*(\d+)/);
             const bitrateMatch = lastLog.match(/bitrate=\s*([\d.]+)kbits\/s/);
             const dropMatch = lastLog.match(/drop=\s*(\d+)/);
             
             if (fpsMatch) setCurrentFps(parseInt(fpsMatch[1]));
             if (dropMatch) setDroppedFrames(parseInt(dropMatch[1]));
             if (bitrateMatch) {
                const br = parseFloat(bitrateMatch[1]);
                setCurrentBitrateStr(br.toFixed(0));
                setBitrateHistory(prev => { const next = [...prev.slice(1), br * 1000]; return next; });
             }
          }
        }
      } catch(e) {}
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000); 
    return () => clearInterval(interval);
  }, [API_BASE, isPreview, selectedTaskId]);

  useEffect(() => { 
      if (autoScroll) {
          logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
      }
  }, [logs]); 

  const createChartPath = () => {
    return bitrateHistory.map((val, i) => {
      const x = (i / 19) * 100;
      const normalizedVal = val === 0 ? 3000 : val;
      const y = 100 - (((normalizedVal - 3000) / 4000) * 100); 
      return `${x},${Math.max(0, Math.min(100, y))}`; 
    }).join(' ');
  };

  const currentBitrateNum = bitrateHistory[bitrateHistory.length - 1];
  const bitrateColor = currentBitrateNum > 0 ? (currentBitrateNum > 4500000 ? 'text-green-500 dark:text-emerald-400' : currentBitrateNum > 2000000 ? 'text-yellow-500 dark:text-amber-400' : 'text-red-500 dark:text-rose-400') : 'text-gray-500 dark:text-slate-500';

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-2 dark:text-slate-100"><Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> Stream Health</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-xl border border-gray-800 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1"><Wifi className="w-3 h-3" /> Bitrate</div>
            <div className={`text-2xl font-black font-mono tracking-tighter ${bitrateColor}`}>{currentBitrateStr} <span className="text-xs font-normal text-gray-500 dark:text-slate-500">kbps</span></div>
          </div>
          <div className="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-xl border border-gray-800 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1"><Monitor className="w-3 h-3" /> FPS</div>
            <div className={`text-2xl font-black font-mono tracking-tighter ${currentFps >= 30 ? 'text-green-400 dark:text-emerald-400' : currentFps > 0 ? 'text-yellow-400 dark:text-amber-400' : 'text-gray-500 dark:text-slate-500'}`}>{currentFps} <span className="text-xs font-normal text-gray-500 dark:text-slate-500">/ 60</span></div>
          </div>
          <div className="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-xl border border-gray-800 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1"><Zap className="w-3 h-3" /> Frame Drops</div>
            <div className={`text-2xl font-black font-mono tracking-tighter ${droppedFrames > 0 ? 'text-orange-500 dark:text-amber-500' : 'text-gray-500 dark:text-slate-500'}`}>{droppedFrames}</div>
          </div>
          <div className="bg-gray-900 dark:bg-slate-800 text-white p-4 rounded-xl border border-gray-800 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1"><Cpu className="w-3 h-3" /> Encoder</div>
            <div className="text-sm font-black font-mono mt-1 text-gray-500 dark:text-slate-500">x264 (Software)</div>
            <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">Preset: veryfast</div>
          </div>
        </div>

        <div className="bg-gray-900 dark:bg-slate-800 rounded-xl border border-gray-800 dark:border-slate-700/60 p-4 mt-2 flex-1 min-h-[200px] flex flex-col relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-400 dark:text-slate-300 uppercase tracking-widest">Network Stability</span>
            <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${currentBitrateNum > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500 dark:bg-slate-500'}`}></span><span className="text-xs text-gray-500 dark:text-slate-500 font-medium">{currentBitrateNum > 0 ? 'Streaming Live' : 'Menunggu Stream'}</span></div>
          </div>
          <div className="flex-1 relative mt-2 w-full">
            <div className="absolute inset-0 flex flex-col justify-between opacity-10 dark:opacity-20 pointer-events-none"><div className="border-t border-gray-400 dark:border-slate-500 w-full"></div><div className="border-t border-gray-400 dark:border-slate-500 w-full"></div><div className="border-t border-gray-400 dark:border-slate-400 w-full"></div><div className="border-t border-gray-400 dark:border-slate-500 w-full"></div></div>
            <svg className="w-full h-full text-green-500 dark:text-emerald-400 opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="gradientBitrate" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="currentColor" stopOpacity="0.4" /><stop offset="100%" stopColor="currentColor" stopOpacity="0.0" /></linearGradient></defs><polyline points={`0,100 ${createChartPath()} 100,100`} fill="url(#gradientBitrate)" /><polyline points={createChartPath()} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-600 dark:text-slate-400 font-mono"><span>T-20s</span><span>T-10s</span><span>Now</span></div>
        </div>
      </div>

      <div className="lg:w-2/3 bg-[#0a0a0a] dark:bg-[#020617] rounded-xl border border-gray-800 dark:border-slate-800 flex flex-col font-mono text-sm shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden h-full relative">
        <div className="bg-[#1a1a1a] dark:bg-[#0f172a] px-4 py-2.5 border-b border-gray-800 dark:border-slate-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-3 text-gray-400 dark:text-slate-400 text-xs">
            <TerminalSquare className="w-4 h-4 shrink-0" />
            <span className="font-bold tracking-wider hidden sm:inline">root@vstream:~#</span>
            <select 
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                setLogs([{ type: 'info', text: 'Memuat log...' }]); 
              }}
              className="bg-transparent border-none outline-none text-emerald-400 font-bold focus:ring-0 cursor-pointer text-xs truncate max-w-[200px]"
            >
              <option value="">[Log Sistem Utama]</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.taskName} ({t.status})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-gray-600/80 dark:bg-slate-700/80"></div><div className="w-3 h-3 rounded-full bg-gray-600/80 dark:bg-slate-700/80"></div><div className="w-3 h-3 rounded-full bg-gray-600/80 dark:bg-slate-700/80"></div></div>
        </div>
        <div 
          className="p-4 overflow-y-auto flex-1 z-10 custom-scrollbar relative"
          ref={logContainerRef}
          onScroll={handleScroll}
        >
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
                    {log.text}
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
        
        {!autoScroll && (
          <button 
            onClick={() => { setAutoScroll(true); logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            className="absolute bottom-6 right-6 p-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow-lg transition-colors z-20 flex items-center justify-center animate-bounce"
            title="Kembali ke Log Terbaru"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor, className = "" }) {
  return (
    <div className={`bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm transition-all flex items-center gap-4 ${className}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}><Icon className={`w-5 h-5 ${color}`} /></div>
      <div><p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">{title}</p><p className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-none">{value}</p></div>
    </div>
  );
}

function ProgressBar({ label, percentage, color, valueText, subText }) {
  return (
    <div className="flex flex-col justify-end w-full">
      <div className="flex justify-between items-end mb-1.5"><span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</span><span className="text-[10px] font-mono font-bold text-gray-700 dark:text-slate-300">{valueText || `${percentage}%`}</span></div>
      <div className="w-full rounded-full h-1.5 bg-gray-100 dark:bg-slate-700/50 overflow-hidden"><div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div></div>
      <div className={`mt-1.5 text-[9px] text-gray-400 dark:text-slate-500 font-medium text-right leading-none ${subText ? 'opacity-100' : 'opacity-0 select-none'}`}>{subText || '-'}</div>
    </div>
  );
}

function FolderItem({ name, count, active }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-100 dark:border-emerald-500/20' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 border border-transparent'}`}>
      <div className="flex items-center gap-2.5 overflow-hidden"><FolderOpen className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`} /><span className="text-[11px] truncate">{name}</span></div>
      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${active ? 'bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 shadow-sm' : 'bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400'}`}>{count}</span>
    </div>
  );
}