import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Plus, Edit2, Trash2, Tent, Calendar, MapPin, 
  Info, BookOpen, Camera, MessageSquare, Shield, Star, 
  Globe, X, Sun, Moon, ZoomIn, Lock, Eye, KeyRound, 
  Cloud, ExternalLink
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

// --- GLOBALS & TYPES ---
const ICON_MAP: Record<string, any> = { Tent, Calendar, MapPin, Info, BookOpen, Camera, MessageSquare, Shield, Star, Globe };
const ADMIN_PASSWORD = "CoRf121";

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

// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
    :root {
      --bsa-blue: #003F87;
      --bsa-red: #CE1126;
      --bsa-gold: #FDC82F;
    }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Inter', system-ui, sans-serif; 
      background-color: #f8fafc; 
    }
    .dark body { background-color: #0f172a; color: #f8fafc; }
    
    .bento-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
      gap: 1.5rem; 
      padding: 2rem; 
      width: 100%;
      box-sizing: border-box;
    }
    
    .scout-card {
      background: white; 
      border-radius: 2rem; 
      padding: 1.5rem; 
      display: flex; 
      flex-direction: column;
      align-items: center; 
      text-align: center; 
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(0,0,0,0.05); 
      position: relative; 
      aspect-ratio: 1/1; 
      text-decoration: none;
      color: inherit; 
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .dark .scout-card { background: #1e293b; border-color: rgba(255,255,255,0.05); }
    .scout-card:hover { transform: translateY(-10px); box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.2); }
    
    .image-container { 
      width: 100%; 
      height: 75%; 
      position: relative; 
      overflow: hidden; 
      border-radius: 1.5rem; 
      margin-bottom: 1rem; 
      background: #f1f5f9; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }
    .dark .image-container { background: #0f172a; }
    
    .card-title { 
      font-weight: 800; 
      font-size: 0.95rem; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
      color: var(--bsa-blue); 
    }
    .dark .card-title { color: #cbd5e1; }
    
    .admin-badge { position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; z-index: 30; }
    .icon-btn { 
      width: 2.5rem; 
      height: 2.5rem; 
      border-radius: 1rem; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      border: none; 
      cursor: pointer; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
      transition: transform 0.2s;
    }
    .icon-btn:hover { transform: scale(1.1); }
  `}</style>
);

const GenericImage = ({ url, zoom = 1, offsetX = 0, offsetY = 0, iconName }: any) => {
  const [error, setError] = useState(false);
  const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Tent;
  
  if ((!url || error) || (!url && iconName)) {
    return (
      <div className="text-blue-900/10 dark:text-white/5">
        <IconComponent size={80} strokeWidth={1.5} />
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

// --- FIREBASE INIT ---
const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = window.__app_id || 'scout-links-v1';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [links, setLinks] = useState<ScoutLink[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    headerTitle: 'Pack 26 Resources',
    headerSubtitle: 'Scouting America',
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

  // --- AUTH FLOW ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth failed", e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- DATA SYNC ---
  useEffect(() => {
    if (!user) return;
    
    // MANDATORY PATH: /artifacts/{appId}/public/data/config
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.links) setLinks(data.links);
        if (data.settings) setSettings(data.settings);
      }
    }, (err) => {
      console.error("Firestore error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const saveData = async (newLinks: ScoutLink[], newSettings: AppSettings) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config');
      await setDoc(docRef, {
        links: newLinks,
        settings: newSettings,
        updatedAt: Date.now()
      });
      setToastMsg("Saved to Cloud");
      setTimeout(() => setToastMsg(''), 2000);
    } catch (err) {
      setToastMsg("Error Saving");
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
    <div className={darkMode ? 'dark' : ''}>
      <GlobalStyles />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        
        {/* --- HEADER --- */}
        <header className="bg-white dark:bg-slate-900 border-b-8 border-yellow-400 shadow-2xl px-6 py-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 shadow-inner flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700">
                <GenericImage url={settings.headerLogoUrl} zoom={settings.headerLogoZoom} offsetX={settings.headerLogoOffsetX} offsetY={settings.headerLogoOffsetY} />
              </div>
              {isEditing && (
                <button 
                  onClick={() => {
                    setModalMode('header');
                    setFormData({ title: settings.headerTitle, subtitle: settings.headerSubtitle, imageUrl: settings.headerLogoUrl, zoom: settings.headerLogoZoom, offsetX: settings.headerLogoOffsetX, offsetY: settings.headerLogoOffsetY });
                    setIsModalOpen(true);
                  }}
                  className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-5xl md:text-7xl font-black text-blue-900 dark:text-blue-500 uppercase tracking-tighter mb-2 leading-none">
                {settings.headerTitle}
              </h1>
              <div className="text-xl font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-3">
                <Star size={20} className="text-yellow-500 fill-yellow-500" />
                {settings.headerSubtitle}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-yellow-400 hover:text-blue-900 transition-all shadow-md">
                {darkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              {isAdmin && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-3 px-8 py-5 rounded-3xl font-black uppercase tracking-widest transition-all shadow-md ${isEditing ? 'bg-yellow-400 text-blue-900 scale-105' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                >
                  <Settings size={24} />
                  <span className="hidden sm:inline">{isEditing ? 'Save' : 'Edit'}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* --- MAIN GRID --- */}
        <main className="max-w-7xl mx-auto py-16 px-6">
          <div className="bento-grid">
            {links.map((link) => (
              <div key={link.id} className="relative">
                {isEditing && (
                  <div className="admin-badge">
                    <button onClick={() => { setModalMode('link'); setFormData({ ...link }); setEditingLink(link); setIsModalOpen(true); }} className="icon-btn bg-blue-600 text-white"><Edit2 size={16} /></button>
                    <button onClick={() => saveData(links.filter(l => l.id !== link.id), settings)} className="icon-btn bg-red-600 text-white"><Trash2 size={16} /></button>
                  </div>
                )}
                <a href={isEditing ? undefined : link.url} target="_blank" rel="noopener noreferrer" className="scout-card">
                  <div className="image-container">
                    <GenericImage url={link.imageUrl} zoom={link.zoom} offsetX={link.offsetX} offsetY={link.offsetY} iconName={link.iconName} />
                  </div>
                  <div className="card-title">{link.title}</div>
                  {!isEditing && <ExternalLink size={14} className="absolute bottom-6 right-6 opacity-10" />}
                </a>
              </div>
            ))}
            
            {isEditing && (
              <button 
                onClick={() => { setModalMode('link'); setFormData({ id: '', title: '', url: '', imageUrl: '', iconName: 'Tent', zoom: 1, offsetX: 0, offsetY: 0 }); setEditingLink(null); setIsModalOpen(true); }}
                className="scout-card border-dashed border-4 border-slate-200 dark:border-slate-800 bg-transparent shadow-none opacity-40 hover:opacity-100 hover:border-blue-500 hover:bg-white dark:hover:bg-slate-900"
              >
                <Plus size={64} className="text-slate-400 mb-2" />
                <div className="font-black text-slate-400 uppercase text-xs tracking-widest">New Resource</div>
              </button>
            )}
          </div>
        </main>

        {/* --- FLOATING AUTH --- */}
        <div className="fixed bottom-10 right-10 z-[100]">
          <button 
            onClick={() => isAdmin ? setIsAdmin(false) : setIsLoginOpen(true)}
            className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all active:scale-95 hover:rotate-6 ${isAdmin ? 'bg-yellow-400 border-4 border-blue-900' : 'bg-blue-900'}`}
          >
            {isAdmin ? <Eye className="text-blue-900" size={32} /> : <Lock className="text-white" size={32} />}
          </button>
        </div>

        {/* --- MODALS --- */}
        {isLoginOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] w-full max-w-sm shadow-2xl border-t-8 border-blue-900">
               <KeyRound className="mx-auto mb-6 text-blue-900" size={64} />
               <h2 className="text-3xl font-black text-center mb-10 uppercase tracking-tighter">Leader Access</h2>
               <form onSubmit={handleLogin} className="space-y-6">
                  <input type="password" autoFocus placeholder="Password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full p-6 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-900 outline-none font-bold text-xl text-center" />
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setIsLoginOpen(false)} className="flex-1 p-5 font-bold text-slate-400 uppercase tracking-widest text-xs">Back</button>
                    <button type="submit" className="flex-2 p-5 bg-blue-900 text-white font-black rounded-2xl uppercase tracking-widest text-sm shadow-lg">Login</button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[400] flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-b-8 border-blue-900">
              <div className="bg-blue-900 p-10 text-white flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase tracking-[0.2em]">{modalMode === 'header' ? 'Customize Branding' : 'Resource Details'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
              </div>
              <form onSubmit={handleSaveModal} className="p-10 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Display Title</label>
                      <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-2 border-transparent focus:border-blue-900 outline-none" />
                    </div>
                    {modalMode === 'link' ? (
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Destination URL</label>
                        <input required value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium" placeholder="scouting.org" />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Subtitle Text</label>
                        <input value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl" />
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Image URL (Optional)</label>
                      <input value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value, iconName: ''})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                     <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block tracking-widest">Visual Preview</label>
                     <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800 rounded-[2rem] overflow-hidden relative border-4 border-blue-900 shadow-inner cursor-move"
                       onMouseDown={(e) => { dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY }; }}
                       onMouseMove={(e) => {
                         if (!dragRef.current.isDragging) return;
                         const dx = e.clientX - dragRef.current.startX;
                         const dy = e.clientY - dragRef.current.startY;
                         setFormData((p: any) => ({ ...p, offsetX: (p.offsetX || 0) + dx, offsetY: (p.offsetY || 0) + dy }));
                         dragRef.current.startX = e.clientX; dragRef.current.startY = e.clientY;
                       }}
                       onMouseUp={() => dragRef.current.isDragging = false}
                       onMouseLeave={() => dragRef.current.isDragging = false}
                     >
                       <GenericImage url={formData.imageUrl} zoom={formData.zoom} offsetX={formData.offsetX} offsetY={formData.offsetY} iconName={formData.iconName} />
                     </div>
                     <div className="w-full mt-8 space-y-2">
                       <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                         <span>Zoom</span>
                         <span>{(formData.zoom || 1).toFixed(1)}x</span>
                       </div>
                       <input type="range" min="0.1" max="5" step="0.1" value={formData.zoom || 1} onChange={e => setFormData({...formData, zoom: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-900" />
                     </div>
                  </div>
                </div>

                {modalMode === 'link' && (
                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block tracking-widest text-center">Or Select an Icon</label>
                    <div className="flex flex-wrap justify-center gap-3">
                      {Object.keys(ICON_MAP).map(n => {
                        const Icon = ICON_MAP[n];
                        return (
                          <button key={n} type="button" onClick={() => setFormData({...formData, iconName: n, imageUrl: ''})} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${formData.iconName === n ? 'bg-blue-900 text-white scale-110 shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'}`}>
                            <Icon size={24} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-6 font-black uppercase tracking-widest text-slate-400">Discard</button>
                   <button type="submit" className="flex-[2] p-6 bg-blue-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-800 transition-colors">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- TOAST --- */}
        {toastMsg && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm z-[1000] shadow-2xl flex items-center gap-4 animate-bounce">
            <Cloud size={20} /> {toastMsg}
          </div>
        )}

      </div>
    </div>
  );
}