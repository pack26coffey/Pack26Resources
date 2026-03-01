import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Plus, Edit2, Trash2, Tent, Calendar, MapPin, 
  Info, BookOpen, Camera, MessageSquare, Shield, Star, 
  Globe, X, Sun, Moon, ZoomIn, Lock, Eye, KeyRound, 
  Link as LinkIcon, Cloud 
} from 'lucide-react';

// --- TYPE DEFINITIONS FOR GLOBAL WINDOW ---
declare global {
  interface Window {
    firebase: any;
    __app_id?: string;
    __firebase_config?: string;
    __initial_auth_token?: string;
  }
}

const GlobalStyles = () => (
  <style>{`
    :root { --bsa-blue: #003F87; --bsa-gold: #FDC82F; --bg-light: #F8FAFC; --bg-dark: #020617; }
    #root { width: 100%; margin: 0; padding: 0; }
    body { 
      margin: 0; padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-light); color: #1e293b; transition: background-color 0.3s ease;
    }
    .dark body { background-color: var(--bg-dark); color: #f8fafc; }
    .bsa-header {
      background-color: var(--bsa-blue); border-bottom: 5px solid var(--bsa-gold);
      color: white; padding: 0 1rem; position: sticky; top: 0; z-index: 100;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .header-container {
      max-width: 1100px; margin: 0 auto; height: 80px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .logo-box {
      width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;
      overflow: hidden; border-radius: 8px; background: rgba(255,255,255,0.1); position: relative;
    }
    .tile-card {
      background: white; border-radius: 1.25rem; overflow: hidden; border: 1px solid #e2e8f0;
      transition: all 0.2s ease; text-decoration: none; color: inherit;
      display: flex; flex-direction: column; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: relative; height: 100%;
    }
    .dark .tile-card { background: #1e293b; border-color: #334155; color: white; }
    .tile-image-area {
      aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center;
      background: #f1f5f9; overflow: hidden; position: relative; width: 100%;
    }
    .dark .tile-image-area { background: #0f172a; }
    .tile-label {
      padding: 16px; text-align: center; font-weight: 800; font-size: 14px;
      text-transform: uppercase; border-top: 1px solid #f1f5f9; flex-grow: 1;
      display: flex; align-items: center; justify-content: center;
    }
    .dark .tile-label { border-top-color: #334155; }
    .action-badge {
      width: 32px; height: 32px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; border: 2px solid white;
      cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  `}</style>
);

const ADMIN_PASSWORD = "scout123";

interface ScoutLink {
  id: string; title: string; url: string; imageUrl: string;
  iconName?: string; zoom?: number; offsetX?: number; offsetY?: number;
}

interface AppSettings {
  headerTitle: string; headerSubtitle: string; headerLogoUrl: string;
  headerLogoZoom: number; headerLogoOffsetX: number; headerLogoOffsetY: number;
}

const ICON_MAP: Record<string, any> = { Tent, Calendar, MapPin, Info, BookOpen, Camera, MessageSquare, Shield, Star, Globe };

const GenericImage = ({ url, zoom = 1, offsetX = 0, offsetY = 0, alt, iconName }: any) => {
  const [error, setError] = useState(false);
  const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Tent;
  
  if ((!url || error) || (!url && iconName)) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 text-inherit opacity-70">
        <IconComponent size="60%" strokeWidth={1.5} />
      </div>
    );
  }
  
  return (
    <img 
      src={url} alt={alt || "Resource"} 
      onError={() => setError(true)}
      style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) translate(${offsetX}%, ${offsetY}%) scale(${zoom})`,
        maxWidth: 'none', height: 'auto', transition: 'none'
      }}
    />
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [links, setLinks] = useState<ScoutLink[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    headerTitle: 'Pack Resources',
    headerSubtitle: 'Cub Scouts of America',
    headerLogoUrl: 'https://www.scouting.org/wp-content/uploads/2018/05/cub-scouts-logo.png',
    headerLogoZoom: 1, headerLogoOffsetX: 0, headerLogoOffsetY: 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [modalMode, setModalMode] = useState<'link' | 'header'>('link');
  const [editingLink, setEditingLink] = useState<ScoutLink | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [toastMsg, setToastMsg] = useState('');

  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  useEffect(() => {
    const initApp = async () => {
      if (!window.firebase) return;

      const configStr = window.__firebase_config;
      const config = configStr ? JSON.parse(configStr) : {};
      const appId = window.__app_id || 'scout-links';

      const firebase = window.firebase;
      if (!firebase.apps.length) firebase.initializeApp(config);
      
      const auth = firebase.auth();
      const db = firebase.firestore();

      const token = window.__initial_auth_token;
      if (token) {
        await auth.signInWithCustomToken(token).catch(() => auth.signInAnonymously());
      } else {
        await auth.signInAnonymously();
      }

      auth.onAuthStateChanged((u: any) => {
        setUser(u);
        if (u) {
          const docRef = db.collection('artifacts').doc(appId).collection('public').doc('config');
          docRef.onSnapshot((doc: any) => {
            if (doc.exists) {
              const data = doc.data();
              if (data.links) setLinks(data.links);
              if (data.settings) setSettings(data.settings);
            }
          });
        }
      });
    };

    initApp();
  }, []);

  const saveData = async (newLinks: ScoutLink[], newSettings: AppSettings) => {
    if (!user || !window.firebase) return;
    try {
      const appId = window.__app_id || 'scout-links';
      const db = window.firebase.firestore();
      await db.collection('artifacts').doc(appId).collection('public').doc('config').set({
        links: newLinks,
        settings: newSettings
      });
      setToastMsg("Saved successfully!");
    } catch (err) {
      setToastMsg("Error saving to cloud.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setIsEditing(true);
      setIsLoginOpen(false);
      setPasswordInput('');
      setToastMsg("Admin Access Granted");
    } else {
      setToastMsg("Incorrect password.");
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedLinks = [...links];
    let updatedSettings = { ...settings };

    if (modalMode === 'link') {
      let finalUrl = (formData.url || '').trim();
      if (finalUrl && !finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
      
      if (editingLink) {
        updatedLinks = links.map(l => l.id === editingLink.id ? { ...formData, url: finalUrl } : l);
      } else {
        updatedLinks = [...links, { ...formData, id: crypto.randomUUID(), url: finalUrl }];
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
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <GlobalStyles />
      <header className="bsa-header">
        <div className="header-container">
          <div className="flex items-center gap-3 relative">
            {isEditing && (
              <button onClick={() => { 
                setModalMode('header');
                setFormData({ title: settings.headerTitle, subtitle: settings.headerSubtitle, imageUrl: settings.headerLogoUrl, zoom: settings.headerLogoZoom, offsetX: settings.headerLogoOffsetX, offsetY: settings.headerLogoOffsetY });
                setIsModalOpen(true);
              }} className="action-badge absolute -top-2 -left-2 z-20 bg-yellow-400">
                <Edit2 size={14} color="#003F87" />
              </button>
            )}
            <div className="logo-box">
              <GenericImage url={settings.headerLogoUrl} zoom={settings.headerLogoZoom} offsetX={settings.headerLogoOffsetX} offsetY={settings.headerLogoOffsetY} />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase leading-tight m-0">{settings.headerTitle}</h1>
              <p className="text-[10px] uppercase tracking-wider text-blue-200 m-0">{settings.headerSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-white/10 border border-white/20 text-white">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAdmin && (
               <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-tighter ${isEditing ? 'bg-yellow-400 text-blue-900' : 'bg-white/10 text-white'}`}>
                  <Settings size={16} /> <span>{isEditing ? 'Exit' : 'Edit'}</span>
               </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto py-10 px-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {links.map((link) => (
            <div key={link.id} className="relative group">
              {isEditing && (
                <div className="absolute -top-3 -right-3 z-30 flex flex-col gap-2">
                  <button onClick={() => {
                    setModalMode('link');
                    setFormData({ ...link });
                    setEditingLink(link);
                    setIsModalOpen(true);
                  }} className="action-badge bg-blue-600"><Edit2 size={14} color="white" /></button>
                  <button onClick={() => {
                    const updated = links.filter(l => l.id !== link.id);
                    saveData(updated, settings);
                  }} className="action-badge bg-red-600"><Trash2 size={14} color="white" /></button>
                </div>
              )}
              <a href={isEditing ? '#' : link.url} target="_blank" rel="noopener noreferrer" className="tile-card">
                <div className="tile-image-area">
                  <GenericImage url={link.imageUrl} zoom={link.zoom} offsetX={link.offsetX} offsetY={link.offsetY} iconName={link.iconName} />
                </div>
                <div className="tile-label">{link.title}</div>
              </a>
            </div>
          ))}
          {isEditing && (
            <button onClick={() => {
              setModalMode('link');
              setFormData({ id: '', title: '', url: '', imageUrl: '', iconName: 'Tent', zoom: 1, offsetX: 0, offsetY: 0 });
              setEditingLink(null);
              setIsModalOpen(true);
            }} className="flex flex-col items-center justify-center min-h-[180px] border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
              <Plus size={40} />
              <span className="font-bold text-xs uppercase mt-2">Add Link</span>
            </button>
          )}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => isAdmin ? setIsAdmin(false) : setIsLoginOpen(true)} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isAdmin ? 'bg-yellow-400' : 'bg-slate-500'}`}>
          {isAdmin ? <Eye size={20} color="#003F87" /> : <Lock size={20} color="white" />}
        </button>
      </div>

      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-800 text-white' : 'bg-white'} p-8 rounded-3xl w-full max-w-sm shadow-2xl`}>
             <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
               <KeyRound color="white" size={32} />
             </div>
             <h2 className="text-2xl font-black text-center mb-1">Admin Portal</h2>
             <p className="text-sm text-slate-500 text-center mb-6">Access Link Management Tools</p>
             <form onSubmit={handleLogin}>
                <input 
                  type="password" autoFocus placeholder="Enter Admin Password" 
                  value={passwordInput} onChange={e => setPasswordInput(e.target.value)} 
                  className="w-full p-4 rounded-xl border border-slate-200 mb-4 bg-transparent font-bold text-center"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setIsLoginOpen(false)} className="p-4 border border-slate-200 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="p-4 bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30">Verify</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-white'} rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className="bg-blue-800 p-6 text-white flex justify-between items-center">
              <h3 className="uppercase font-black tracking-widest text-lg">{modalMode === 'header' ? 'Customize Header' : (editingLink ? 'Edit Link' : 'Create New Link')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
            </div>
            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Display Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-transparent" />
                </div>
                
                {modalMode === 'link' ? (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Destination URL</label>
                    <input required value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-transparent" placeholder="scoutbook.scouting.org" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Subtitle Line</label>
                    <input value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-transparent" />
                  </div>
                )}

                <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-800/30">
                  <label className="text-[10px] font-black text-slate-400 block mb-4 text-center uppercase tracking-widest">Image Preview & Framing</label>
                  <div 
                    className="w-32 h-32 mx-auto rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-blue-600 relative cursor-move mb-4"
                    onMouseDown={(e) => { dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY }; }}
                    onMouseMove={(e) => {
                      if (!dragRef.current.isDragging) return;
                      const dx = (e.clientX - dragRef.current.startX) / (formData.zoom || 1);
                      const dy = (e.clientY - dragRef.current.startY) / (formData.zoom || 1);
                      setFormData((p: any) => ({ ...p, offsetX: (p.offsetX || 0) + dx, offsetY: (p.offsetY || 0) + dy }));
                      dragRef.current.startX = e.clientX; dragRef.current.startY = e.clientY;
                    }}
                    onMouseUp={() => dragRef.current.isDragging = false}
                    onMouseLeave={() => dragRef.current.isDragging = false}
                  >
                    <GenericImage url={formData.imageUrl} zoom={formData.zoom} offsetX={formData.offsetX} offsetY={formData.offsetY} iconName={formData.iconName} />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                     <ZoomIn size={18} className="text-slate-400" />
                     <input type="range" min="0.1" max="5" step="0.05" value={formData.zoom || 1} onChange={e => setFormData({...formData, zoom: parseFloat(e.target.value)})} className="flex-1 accent-blue-600" />
                  </div>

                  <div className="mb-4">
                    <label className="text-[10px] font-black text-slate-500 flex items-center gap-2 mb-1 uppercase tracking-tight"><LinkIcon size={12}/> Link to Logo/Image</label>
                    <input 
                      placeholder="Paste image URL here..." 
                      value={formData.imageUrl || ''} 
                      onChange={e => setFormData({...formData, imageUrl: e.target.value, iconName: ''})}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white dark:bg-slate-800 text-sm" 
                    />
                  </div>

                  {modalMode === 'link' && (
                    <div>
                      <p className="text-[10px] font-black text-slate-500 mb-2 uppercase text-center">OR SELECT A BSA PRESET ICON</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {Object.keys(ICON_MAP).map(n => {
                          const Icon = ICON_MAP[n];
                          return (
                            <button key={n} type="button" onClick={() => setFormData({...formData, iconName: n, imageUrl: '', zoom: 1, offsetX: 0, offsetY: 0})} className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-all ${formData.iconName === n ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-400'}`}>
                              <Icon size={18} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-4 border border-slate-200 rounded-2xl font-bold uppercase text-xs tracking-widest">Discard</button>
                 <button type="submit" className="flex-[2] p-4 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-4 z-[500] shadow-2xl animate-bounce">
          <Cloud size={16} className="text-blue-400" />
          <span className="text-sm font-bold">{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="opacity-50">✕</button>
        </div>
      )}
    </div>
  );
}