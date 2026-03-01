import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Plus, Edit2, Trash2, Tent, Calendar, MapPin, 
  Info, BookOpen, Camera, MessageSquare, Shield, Star, 
  Globe, X, Sun, Moon, ZoomIn, Lock, Eye, KeyRound, 
  Cloud, ExternalLink
} from 'lucide-react';

// --- TYPES & GLOBALS ---
declare global {
  interface Window {
    firebase: any;
    __app_id?: string;
    __firebase_config?: string;
    __initial_auth_token?: string;
  }
}

interface ScoutLink {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  iconName?: string;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
}

interface AppSettings {
  headerTitle: string;
  headerSubtitle: string;
  headerLogoUrl: string;
  headerLogoZoom: number;
  headerLogoOffsetX: number;
  headerLogoOffsetY: number;
}

const ICON_MAP: Record<string, any> = { Tent, Calendar, MapPin, Info, BookOpen, Camera, MessageSquare, Shield, Star, Globe };
const ADMIN_PASSWORD = "scout123";

// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
    :root {
      --bsa-blue: #003F87;
      --bsa-red: #CE1126;
      --bsa-gold: #FDC82F;
      --bg-light: #f1f5f9;
      --bg-dark: #0f172a;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: var(--bg-light);
      transition: background-color 0.3s ease;
    }

    .dark body {
      background-color: var(--bg-dark);
      color: #f8fafc;
    }

    .bento-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .scout-card {
      background: white;
      border-radius: 1.5rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(0,0,0,0.05);
      position: relative;
      aspect-ratio: 1/1;
      text-decoration: none;
      color: inherit;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .dark .scout-card {
      background: #1e293b;
      border-color: rgba(255,255,255,0.05);
    }

    .scout-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .image-container {
      width: 100%;
      height: 70%;
      position: relative;
      overflow: hidden;
      border-radius: 1rem;
      margin-bottom: 0.75rem;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dark .image-container {
      background: #0f172a;
    }

    .card-title {
      font-weight: 700;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      color: var(--bsa-blue);
    }

    .dark .card-title {
      color: #94a3b8;
    }

    .admin-badge {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      display: flex;
      gap: 0.25rem;
      z-index: 20;
    }

    .icon-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  `}</style>
);

const GenericImage = ({ url, zoom = 1, offsetX = 0, offsetY = 0, iconName }: any) => {
  const [error, setError] = useState(false);
  const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Tent;
  
  if ((!url || error) || (!url && iconName)) {
    return (
      <div className="text-blue-900/20 dark:text-white/10">
        <IconComponent size={64} strokeWidth={1.5} />
      </div>
    );
  }
  
  return (
    <img 
      src={url} 
      alt=""
      onError={() => setError(true)}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translate(${offsetX}%, ${offsetY}%) scale(${zoom})`,
        maxWidth: 'none',
        height: '100%',
        objectFit: 'contain'
      }}
    />
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [links, setLinks] = useState<ScoutLink[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    headerTitle: 'Scout Pack Resources',
    headerSubtitle: 'Troop 101 • Cub Scout Pack 505',
    headerLogoUrl: 'https://www.scouting.org/wp-content/uploads/2018/05/cub-scouts-logo.png',
    headerLogoZoom: 1, headerLogoOffsetX: 0, headerLogoOffsetY: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [modalMode, setModalMode] = useState<'link' | 'header'>('link');
  const [editingLink, setEditingLink] = useState<ScoutLink | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [toastMsg, setToastMsg] = useState('');
  
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  // --- INITIALIZATION ---
  useEffect(() => {
    const initApp = async () => {
      if (!window.firebase) return;
      const configStr = window.__firebase_config;
      const config = configStr ? JSON.parse(configStr) : {};
      const firebase = window.firebase;
      
      if (!firebase.apps.length) firebase.initializeApp(config);
      
      const auth = firebase.auth();
      const db = firebase.firestore();

      if (window.__initial_auth_token) {
        await auth.signInWithCustomToken(window.__initial_auth_token).catch(() => auth.signInAnonymously());
      } else {
        await auth.signInAnonymously();
      }

      auth.onAuthStateChanged((u: any) => {
        setUser(u);
      });

      // Cleanup
      return () => {};
    };
    initApp();
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!user || !window.firebase) return;
    const appId = window.__app_id || 'scout-links';
    const db = window.firebase.firestore();
    
    // Rule: Fetch all and process in memory
    const unsubscribe = db.collection('artifacts').doc(appId).collection('public').doc('config')
      .onSnapshot((doc: any) => {
        if (doc.exists) {
          const data = doc.data();
          if (data.links) setLinks(data.links);
          if (data.settings) setSettings(data.settings);
        }
      }, (err: any) => {
        console.error("Firestore Error:", err);
      });

    return () => unsubscribe();
  }, [user]);

  const saveData = async (newLinks: ScoutLink[], newSettings: AppSettings) => {
    if (!user || !window.firebase) return;
    try {
      const appId = window.__app_id || 'scout-links';
      const db = window.firebase.firestore();
      await db.collection('artifacts').doc(appId).collection('public').doc('config').set({
        links: newLinks,
        settings: newSettings,
        updatedAt: Date.now()
      });
      setToastMsg("Cloud Saved");
      setTimeout(() => setToastMsg(''), 2000);
    } catch (err) {
      setToastMsg("Save Error");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setIsEditing(true);
      setIsLoginOpen(false);
      setPasswordInput('');
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedLinks = [...links];
    let updatedSettings = { ...settings };

    if (modalMode === 'link') {
      let url = (formData.url || '').trim();
      if (url && !url.startsWith('http')) url = 'https://' + url;
      if (editingLink) {
        updatedLinks = links.map(l => l.id === editingLink.id ? { ...formData, url } : l);
      } else {
        updatedLinks = [...links, { ...formData, id: crypto.randomUUID(), url }];
      }
    } else {
      updatedSettings = {
        headerTitle: formData.title, headerSubtitle: formData.subtitle,
        headerLogoUrl: formData.imageUrl, headerLogoZoom: formData.zoom,
        headerLogoOffsetX: formData.offsetX, headerLogoOffsetY: formData.offsetY
      };
    }
    saveData(updatedLinks, updatedSettings);
    setIsModalOpen(false);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark text-white' : 'text-slate-900'}`}>
      <GlobalStyles />
      
      {/* --- HEADER --- */}
      <header className="bg-white dark:bg-slate-900 border-b-4 border-yellow-400 shadow-xl px-6 py-8 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-800 shadow-inner flex items-center justify-center overflow-hidden border-2 border-slate-100 dark:border-slate-700">
              <GenericImage url={settings.headerLogoUrl} zoom={settings.headerLogoZoom} offsetX={settings.headerLogoOffsetX} offsetY={settings.headerLogoOffsetY} />
            </div>
            {isEditing && (
              <button 
                onClick={() => {
                  setModalMode('header');
                  setFormData({ title: settings.headerTitle, subtitle: settings.headerSubtitle, imageUrl: settings.headerLogoUrl, zoom: settings.headerLogoZoom, offsetX: settings.headerLogoOffsetX, offsetY: settings.headerLogoOffsetY });
                  setIsModalOpen(true);
                }}
                className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-blue-900 dark:text-blue-400 uppercase tracking-tighter mb-1">
              {settings.headerTitle}
            </h1>
            <p className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
              {settings.headerSubtitle}
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-yellow-400 hover:text-blue-900 transition-all"
            >
              {darkMode ? <Sun /> : <Moon />}
            </button>
            {isAdmin && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-yellow-400 text-blue-900 shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                <Settings size={20} />
                <span className="hidden sm:inline">{isEditing ? 'Finish' : 'Edit'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- GRID --- */}
      <main className="max-w-7xl mx-auto py-12">
        <div className="bento-grid">
          {links.map((link) => (
            <div key={link.id} className="relative group">
              {isEditing && (
                <div className="admin-badge">
                  <button onClick={() => {
                    setModalMode('link');
                    setFormData({ ...link });
                    setEditingLink(link);
                    setIsModalOpen(true);
                  }} className="icon-btn bg-blue-600 text-white"><Edit2 size={12} /></button>
                  <button onClick={() => {
                    const updated = links.filter(l => l.id !== link.id);
                    saveData(updated, settings);
                  }} className="icon-btn bg-red-600 text-white"><Trash2 size={12} /></button>
                </div>
              )}
              <a href={isEditing ? '#' : link.url} target="_blank" rel="noopener noreferrer" className="scout-card">
                <div className="image-container">
                  <GenericImage url={link.imageUrl} zoom={link.zoom} offsetX={link.offsetX} offsetY={link.offsetY} iconName={link.iconName} />
                </div>
                <div className="card-title">{link.title}</div>
                {!isEditing && <ExternalLink size={12} className="absolute bottom-4 right-4 opacity-20" />}
              </a>
            </div>
          ))}

          {isEditing && (
            <button 
              onClick={() => {
                setModalMode('link');
                setFormData({ id: '', title: '', url: '', imageUrl: '', iconName: 'Tent', zoom: 1, offsetX: 0, offsetY: 0 });
                setEditingLink(null);
                setIsModalOpen(true);
              }}
              className="scout-card border-dashed border-2 border-slate-300 dark:border-slate-700 bg-transparent opacity-60 hover:opacity-100 hover:border-blue-500"
            >
              <Plus size={48} className="text-slate-400 mb-2" />
              <div className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Add Resource</div>
            </button>
          )}
        </div>
      </main>

      {/* --- ACCESS CONTROL --- */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button 
          onClick={() => isAdmin ? setIsAdmin(false) : setIsLoginOpen(true)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isAdmin ? 'bg-yellow-400 rotate-[360deg]' : 'bg-blue-900'}`}
        >
          {isAdmin ? <Eye color="#003F87" size={24} /> : <Lock color="white" size={24} />}
        </button>
      </div>

      {/* --- MODALS --- */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[300] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl border-b-8 border-blue-900">
             <KeyRound className="mx-auto mb-4 text-blue-900" size={48} />
             <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-tighter">Leader Access</h2>
             <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="password" autoFocus placeholder="Leader Password" 
                  value={passwordInput} onChange={e => setPasswordInput(e.target.value)} 
                  className="w-full p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border-none font-bold text-center"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsLoginOpen(false)} className="flex-1 p-4 font-bold opacity-50">Cancel</button>
                  <button type="submit" className="flex-1 p-4 bg-blue-900 text-white font-black rounded-2xl">Enter</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[400] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-blue-900 p-8 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest">{modalMode === 'header' ? 'Header Settings' : 'Link Settings'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            
            <form onSubmit={handleSaveModal} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Display Name</label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold" />
                  </div>
                  
                  {modalMode === 'link' ? (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">URL</label>
                      <input required value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium" placeholder="example.com" />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Subtitle</label>
                      <input value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium" />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Image URL</label>
                    <input 
                      value={formData.imageUrl || ''} 
                      onChange={e => setFormData({...formData, imageUrl: e.target.value, iconName: ''})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm" 
                    />
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-[2rem] flex flex-col items-center">
                   <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden relative border-4 border-blue-900/10 mb-6 cursor-move"
                     onMouseDown={(e) => { dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY }; }}
                     onMouseMove={(e) => {
                       if (!dragRef.current.isDragging) return;
                       const dx = (e.clientX - dragRef.current.startX);
                       const dy = (e.clientY - dragRef.current.startY);
                       setFormData((p: any) => ({ ...p, offsetX: (p.offsetX || 0) + dx, offsetY: (p.offsetY || 0) + dy }));
                       dragRef.current.startX = e.clientX; dragRef.current.startY = e.clientY;
                     }}
                     onMouseUp={() => dragRef.current.isDragging = false}
                     onMouseLeave={() => dragRef.current.isDragging = false}
                   >
                     <GenericImage url={formData.imageUrl} zoom={formData.zoom} offsetX={formData.offsetX} offsetY={formData.offsetY} iconName={formData.iconName} />
                   </div>
                   <div className="w-full flex items-center gap-3">
                     <ZoomIn size={16} />
                     <input type="range" min="0.1" max="5" step="0.1" value={formData.zoom || 1} onChange={e => setFormData({...formData, zoom: parseFloat(e.target.value)})} className="flex-1 accent-blue-900" />
                   </div>
                </div>
              </div>

              {modalMode === 'link' && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-center text-[10px] font-black text-slate-400 uppercase mb-4">Or Use Scout Icon</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Object.keys(ICON_MAP).map(n => {
                      const Icon = ICON_MAP[n];
                      return (
                        <button key={n} type="button" onClick={() => setFormData({...formData, iconName: n, imageUrl: ''})} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${formData.iconName === n ? 'bg-blue-900 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'}`}>
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-5 font-bold uppercase tracking-widest text-sm">Cancel</button>
                 <button type="submit" className="flex-[2] p-5 bg-blue-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20">Apply Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs z-[1000] shadow-2xl flex items-center gap-3">
          <Cloud size={16} /> {toastMsg}
        </div>
      )}
    </div>
  );
}