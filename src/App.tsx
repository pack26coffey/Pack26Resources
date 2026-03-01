import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Share2, 
  Plus, 
  Edit2, 
  Trash2, 
  Tent, 
  Calendar, 
  MapPin, 
  Info, 
  BookOpen, 
  Camera, 
  MessageSquare,
  Shield,
  Star, 
  Globe,
  X,
  Sun,
  Moon,
  Terminal
} from 'lucide-react';

/** * FAIL-SAFE CSS: 
 * These styles ensure the app looks correct even if Tailwind CSS 
 * fails to load in the production environment.
 */
const GlobalStyles = () => (
  <style>{`
    :root {
      --bsa-blue: #003F87;
      --bsa-gold: #FDC82F;
    }
    #root { 
      max-width: 100% !important; 
      margin: 0 !important; 
      padding: 0 !important; 
      text-align: left !important;
      width: 100%;
    }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
    }
    .dark body { background-color: #020617; }
    
    /* Manual Grid Layout Backup */
    .resource-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1.5rem;
      padding: 1rem;
    }
    
    /* Header styling backup */
    .bsa-header {
      background-color: var(--bsa-blue);
      border-bottom: 4px solid var(--bsa-gold);
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .tile-card {
      background: white;
      border-radius: 1.5rem;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      transition: transform 0.2s;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
    }
    .tile-card:hover { transform: translateY(-4px); }
    .dark .tile-card { background: #0f172a; border-color: #1e293b; color: white; }
  `}</style>
);

interface ScoutLink {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  iconName?: string; 
}

const DEFAULT_LINKS: ScoutLink[] = [
  {
    id: '1',
    title: 'Scoutbook',
    url: 'https://scoutbook.scouting.org/',
    imageUrl: 'https://help.scoutbook.scouting.org/wp-content/uploads/2019/11/SB-logo-2.png',
    iconName: 'BookOpen'
  },
  {
    id: '2',
    title: 'Boy Scouts of America',
    url: 'https://www.scouting.org/',
    imageUrl: 'https://www.scouting.org/wp-content/themes/bsa-master/images/fleur-de-lis.png',
    iconName: 'Shield'
  }
];

const ICON_MAP: Record<string, any> = {
  Tent, Calendar, MapPin, Info, BookOpen, Camera, MessageSquare, Shield, Star, Globe
};

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <span className="text-sm font-semibold tracking-wide">{message}</span>
    </div>
  );
};

const TileImage = ({ src, alt, iconName }: { src: string; alt: string; iconName?: string }) => {
  const [error, setError] = useState(false);
  const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Tent;
  
  if ((!src || error) || (!src && iconName)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-slate-800 text-[#003F87] dark:text-blue-400 min-h-[150px]">
        <IconComponent size={48} strokeWidth={1.5} />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-white dark:bg-slate-200 min-h-[150px]">
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full max-h-[120px] object-contain" 
        onError={() => setError(true)}
      />
    </div>
  );
};

export default function App() {
  const [links, setLinks] = useState<ScoutLink[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ScoutLink | null>(null);
  const [formData, setFormData] = useState<ScoutLink>({ id: '', title: '', url: '', imageUrl: '', iconName: 'Tent' });
  
  const [toastMsg, setToastMsg] = useState('');

  const appId = typeof (window as any).__app_id !== 'undefined' ? (window as any).__app_id : 'Local Dev';

  useEffect(() => {
    const savedTheme = localStorage.getItem('scoutTheme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(data)));
        const restored: ScoutLink[] = decoded.map((l: any) => ({
          id: l.i, title: l.t, url: l.u, imageUrl: l.img, iconName: l.icon || 'Tent'
        }));
        setLinks(restored);
        setIsDataLoaded(true);
        return;
      } catch (e) {
        console.error("Failed to parse shared link data", e);
      }
    }
    
    const local = localStorage.getItem('cubScoutLinks');
    if (local) {
      setLinks(JSON.parse(local));
    } else {
      setLinks(DEFAULT_LINKS);
    }
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('cubScoutLinks', JSON.stringify(links));
    }
  }, [links, isDataLoaded]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('scoutTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('scoutTheme', 'light');
    }
  };

  const handleShare = () => {
    try {
      const compact = links.map(l => ({ i: l.id, t: l.title, u: l.url, img: l.imageUrl, icon: l.iconName }));
      const encoded = btoa(encodeURIComponent(JSON.stringify(compact)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setToastMsg("Link copied! Share this with your Pack.");
    } catch (err) {
      setToastMsg("Failed to generate link.");
    }
  };

  const openAddModal = () => {
    setFormData({ id: '', title: '', url: '', imageUrl: '', iconName: 'Tent' });
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const openEditModal = (link: ScoutLink) => {
    setFormData(link);
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = formData.url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    if (editingLink) {
      setLinks(links.map(l => l.id === editingLink.id ? { ...formData, url: finalUrl } : l));
    } else {
      setLinks([...links, { ...formData, id: crypto.randomUUID(), url: finalUrl }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-[#F8FAFC]'} pb-20`}>
      <GlobalStyles />
      
      <header className="bsa-header dark:bg-slate-900 text-white sticky top-0 z-30 shadow-lg border-b-4 border-[#FDC82F] w-full">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="bg-[#003F87] dark:bg-slate-900 flex-shrink-0 w-16 h-16 flex items-center justify-center overflow-hidden">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Cubscouts.svg/1200px-Cubscouts.svg.png" 
                alt="Cub Scouts Logo" 
                className="w-full h-full object-contain scale-[1.1]" 
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase italic leading-none">Pack Resources</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-200 dark:text-slate-400 font-bold opacity-80 mt-1">Cub Scouts of America</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20">
              <Share2 size={16} /> 
              <span className="hidden sm:inline uppercase">Share</span>
            </button>
            <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isEditing ? 'bg-[#FDC82F] text-[#003F87]' : 'bg-white text-[#003F87]'}`}>
              <Settings size={16} /> 
              <span className="hidden sm:inline uppercase">{isEditing ? 'Done' : 'Edit'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-12 w-full">
        <div className="resource-grid">
          {links.map((link: ScoutLink) => (
            <div key={link.id} className="relative">
              {isEditing && (
                <div className="absolute -top-3 -right-3 z-20 flex flex-col gap-2">
                  <button onClick={() => openEditModal(link)} className="bg-blue-600 text-white p-2 rounded-full shadow-xl border-2 border-white"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(link.id)} className="bg-red-600 text-white p-2 rounded-full shadow-xl border-2 border-white"><Trash2 size={14} /></button>
                </div>
              )}
              
              <a 
                href={isEditing ? '#' : link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`tile-card h-full ${isEditing ? 'opacity-60 border-dashed border-blue-400' : ''}`}
              >
                <div className="aspect-square w-full relative bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden">
                  <TileImage src={link.imageUrl} alt={link.title} iconName={link.iconName} />
                </div>
                <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">
                    {link.title}
                  </span>
                </div>
              </a>
            </div>
          ))}

          {isEditing && (
            <button onClick={openAddModal} className="tile-card flex flex-col items-center justify-center gap-4 border-4 border-dashed border-slate-200 dark:border-slate-800 min-h-[220px]">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl">
                <Plus size={32} strokeWidth={2.5} />
              </div>
              <span className="font-black uppercase text-xs tracking-widest">Add Link</span>
            </button>
          )}
        </div>

        {isEditing && (
          <div className="mt-20 p-6 bg-blue-50 dark:bg-slate-900/50 rounded-3xl border-2 border-blue-100 dark:border-slate-800 flex items-center gap-4 text-blue-600 dark:text-blue-400">
            <Terminal size={24} />
            <div className="text-xs font-mono">
              <p className="font-bold uppercase mb-1">StackBlitz Environment Debug</p>
              <p>App ID: {appId}</p>
              <p className="mt-2 text-slate-500 italic">If Tailwind fails to load, the "GlobalStyles" CSS backup will maintain the layout.</p>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border dark:border-slate-800">
            <div className="bg-[#003F87] dark:bg-slate-800 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Settings className="text-[#FDC82F]" size={24} />
                <h2 className="text-xl font-black uppercase italic">Link Settings</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-4">
                <input required placeholder="Resource Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none font-semibold dark:text-white" />
                <input required placeholder="Web Address (URL)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none font-semibold dark:text-white" />
                <div className="grid grid-cols-5 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                  {Object.keys(ICON_MAP).map(name => {
                    const Icon = ICON_MAP[name];
                    return (
                      <button key={name} type="button" onClick={() => setFormData({...formData, iconName: name, imageUrl: ''})} className={`p-3 rounded-xl flex items-center justify-center transition-all ${formData.iconName === name && !formData.imageUrl ? 'bg-[#003F87] text-white shadow-lg' : 'bg-white dark:bg-slate-700 text-slate-400'}`}>
                        <Icon size={20} />
                      </button>
                    );
                  })}
                </div>
                <input placeholder="Image URL (optional)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value, iconName: ''})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none font-semibold dark:text-white" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold uppercase tracking-widest text-slate-400">Cancel</button>
                <button type="submit" className="flex-[2] bg-[#003F87] dark:bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}