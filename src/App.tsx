import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken, User } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, collection } from 'firebase/firestore';
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
  ZoomIn,
  Lock,
  Eye,
  KeyRound,
  Link as LinkIcon,
  Cloud // Using Cloud instead of CloudCheck to fix the build error
} from 'lucide-react';

// --- CONFIGURATION ---
const ADMIN_PASSWORD = "scout123";

// Firebase Globals (Provided by environment)
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'scout-links-default';

const GlobalStyles = () => (
  <style>{`
    :root {
      --bsa-blue: #003F87;
      --bsa-gold: #FDC82F;
      --bg-light: #F8FAFC;
      --bg-dark: #020617;
    }
    * { box-sizing: border-box; }
    #root { width: 100%; margin: 0; padding: 0; }
    body { 
      margin: 0; padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-light);
      color: #1e293b;
      transition: background-color 0.3s ease;
    }
    .dark body { background-color: var(--bg-dark); color: #f8fafc; }
    .bsa-header {
      background-color: var(--bsa-blue);
      border-bottom: 5px solid var(--bsa-gold);
      color: white; padding: 0 1rem;
      position: sticky; top: 0; z-index: 100;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .header-container {
      max-width: 1100px; margin: 0 auto; height: 80px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .logo-section { display: flex; align-items: center; gap: 12px; position: relative; }
    .logo-box {
      width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;
      overflow: hidden; border-radius: 8px; background: rgba(255,255,255,0.1); position: relative;
    }
    .title-group h1 { margin: 0; font-size: 1.5rem; font-weight: 900; text-transform: uppercase; font-style: italic; line-height: 1; }
    .title-group p { margin: 2px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #bfdbfe; }
    .main-content { max-width: 1100px; margin: 40px auto; padding: 0 20px; }
    .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 24px; }
    .tile-card {
      background: white; border-radius: 1.25rem; overflow: hidden; border: 1px solid #e2e8f0;
      transition: all 0.2s ease; text-decoration: none; color: inherit;
      display: flex; flex-direction: column; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: relative; height: 100%;
    }
    .dark .tile-card { background: #0f172a; border-color: #1e293b; color: white; }
    .tile-card:hover:not(.editing) { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    .tile-image-area {
      aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center;
      background: #f1f5f9; overflow: hidden; position: relative; width: 100%;
    }
    .dark .tile-image-area { background: #1e293b; }
    .tile-label {
      padding: 16px; text-align: center; font-weight: 800; font-size: 14px;
      text-transform: uppercase; border-top: 1px solid #f1f5f9; flex-grow: 1;
      display: flex; align-items: center; justify-content: center;
    }
    .btn-group { display: flex; gap: 8px; }
    .icon-btn {
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
      color: white; padding: 8px 12px; border-radius: 10px; cursor: pointer;
      display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 12px;
    }
    .action-badge {
      width: 32px; height: 32px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; border: 2px solid white;
      cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .add-btn {
      border: 3px dashed #cbd5e1; background: transparent; min-height: 200px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 12px; color: #64748b; cursor: pointer; border-radius: 1.25rem;
    }
    .crop-preview-container {
      width: 150px; height: 150px; border-radius: 12px; overflow: hidden;
      border: 2px solid var(--bsa-blue); position: relative; margin: 0 auto 20px;
      background: #f1f5f9; cursor: grab;
    }
  `}</style>
);

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
  const [user, setUser] = useState<User | null>(null);
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

  // 1. Initial Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Data Sync
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.links) setLinks(data.links);
        if (data.settings) setSettings(data.settings);
      } else {
        // Initialize if empty
        saveData([], settings);
      }
    }, (err) => {
      console.error("Firestore Error:", err);
      setToastMsg("Sync error. Please refresh.");
    });

    return () => unsubscribe();
  }, [user]);

  const saveData = async (newLinks: ScoutLink[], newSettings: AppSettings) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config');
      await setDoc(docRef, { links: newLinks, settings: newSettings });
    } catch (err) {
      setToastMsg("Failed to save to cloud.");
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
      let finalUrl = formData.url.trim();
      if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
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

  const deleteLink = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    saveData(updated, settings);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <GlobalStyles />
      <header className="bsa-header">
        <div className="header-container">
          <div className="logo-section">
            {isEditing && (
              <button onClick={() => { 
                setModalMode('header');
                setFormData({ title: settings.headerTitle, subtitle: settings.headerSubtitle, imageUrl: settings.headerLogoUrl, zoom: settings.headerLogoZoom, offsetX: settings.headerLogoOffsetX, offsetY: settings.headerLogoOffsetY });
                setIsModalOpen(true);
              }} className="action-badge" style={{ position: 'absolute', top: '-10px', left: '-10px', zIndex: 110, background: 'var(--bsa-gold)' }}>
                <Edit2 size={14} color="var(--bsa-blue)" />
              </button>
            )}
            <div className="logo-box">
              <GenericImage url={settings.headerLogoUrl} zoom={settings.headerLogoZoom} offsetX={settings.headerLogoOffsetX} offsetY={settings.headerLogoOffsetY} />
            </div>
            <div className="title-group">
              <h1>{settings.headerTitle}</h1>
              <p>{settings.headerSubtitle}</p>
            </div>
          </div>
          <div className="btn-group">
            <button onClick={() => setDarkMode(!darkMode)} className="icon-btn">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {isAdmin && (
              <>
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-400 bg-white/5 px-2 py-1 rounded">
                  <Cloud size={12} /> Live Sync
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className={`icon-btn ${isEditing ? 'bg-yellow-500 text-blue-900' : ''}`}>
                  <Settings size={16} /> <span>{isEditing ? 'Exit' : 'Edit'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="resource-grid">
          {links.map((link) => (
            <div key={link.id} style={{ position: 'relative' }}>
              {isEditing && (
                <div style={{ position: 'absolute', top: '-12px', right: '-12px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => {
                    setModalMode('link');
                    setFormData({ ...link });
                    setEditingLink(link);
                    setIsModalOpen(true);
                  }} className="action-badge" style={{ background: '#2563eb' }}><Edit2 size={14} color="white" /></button>
                  <button onClick={() => deleteLink(link.id)} className="action-badge" style={{ background: '#dc2626' }}><Trash2 size={14} color="white" /></button>
                </div>
              )}
              <a href={isEditing ? '#' : link.url} target="_blank" rel="noopener noreferrer" className="tile-card">
                <div className="tile-image-area">
                  <GenericImage url={link.imageUrl} zoom={link.zoom} offsetX={link.offsetX} offsetY={link.offsetY} iconName={link.iconName} alt={link.title} />
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
            }} className="add-btn"><Plus size={32} /><span>Add Link</span></button>
          )}
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
        <button onClick={() => isAdmin ? setIsAdmin(false) : setIsLoginOpen(true)} className="action-badge" style={{ background: isAdmin ? 'var(--bsa-gold)' : '#64748b' }}>
          {isAdmin ? <Eye size={16} color="var(--bsa-blue)" /> : <Lock size={16} color="white" />}
        </button>
      </div>

      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-8 rounded-3xl w-full max-w-sm text-center`}>
            <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound color="white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Admin Login</h2>
            <p className="text-sm text-slate-500 mb-6">Enter password to manage links.</p>
            <form onSubmit={handleLogin}>
              <input 
                type="password" autoFocus placeholder="Password" 
                value={passwordInput} onChange={e => setPasswordInput(e.target.value)} 
                className="w-full p-3 rounded-xl border border-slate-300 mb-4 bg-transparent"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsLoginOpen(false)} className="flex-1 p-3 border rounded-xl">Cancel</button>
                <button type="submit" className="flex-[2] p-3 bg-blue-700 text-white font-bold rounded-xl">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[400] flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-white'} rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className="bg-blue-800 p-5 text-white flex justify-between items-center">
              <h3 className="uppercase font-black tracking-widest">{modalMode === 'header' ? 'Header Settings' : 'Link Settings'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSaveModal} className="p-6">
              <div className="mb-4">
                <label className="text-[10px] font-black text-slate-500 block mb-1">TITLE</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-xl bg-transparent" />
              </div>
              
              {modalMode === 'link' ? (
                <div className="mb-4">
                  <label className="text-[10px] font-black text-slate-500 block mb-1">WEBSITE URL</label>
                  <input required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full p-3 border rounded-xl bg-transparent" />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="text-[10px] font-black text-slate-500 block mb-1">SUBTITLE</label>
                  <input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full p-3 border rounded-xl bg-transparent" />
                </div>
              )}

              <div className="mb-6 p-5 border border-slate-200 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <label className="text-[10px] font-black text-slate-500 block mb-2 text-center">PREVIEW & PLACEMENT (DRAG IMAGE)</label>
                <div 
                  className="crop-preview-container"
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
                
                <div className="flex items-center gap-3 mb-6">
                   <ZoomIn size={18} />
                   <input type="range" min="0.1" max="5" step="0.05" value={formData.zoom || 1} onChange={e => setFormData({...formData, zoom: parseFloat(e.target.value)})} className="flex-1" />
                </div>

                <div className="mb-4">
                  <label className="text-[10px] font-black text-slate-500 flex items-center gap-2 mb-1"><LinkIcon size={12}/> DIRECT IMAGE URL</label>
                  <input 
                    placeholder="https://example.com/logo.png" 
                    value={formData.imageUrl || ''} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value, iconName: ''})}
                    className="w-full p-3 border rounded-xl bg-transparent" 
                  />
                </div>

                {modalMode === 'link' && (
                  <div>
                    <p className="text-[10px] font-black text-slate-500 mb-2">OR SELECT PRESET ICON:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.keys(ICON_MAP).map(n => {
                        const Icon = ICON_MAP[n];
                        return (
                          <button key={n} type="button" onClick={() => setFormData({...formData, iconName: n, imageUrl: '', zoom: 1, offsetX: 0, offsetY: 0})} className={`p-3 border rounded-xl flex justify-center ${formData.iconName === n ? 'border-blue-700 bg-blue-50 text-blue-700' : ''}`}>
                            <Icon size={18} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full p-4 bg-blue-700 text-white rounded-xl font-bold">SAVE TO CLOUD</button>
            </form>
          </div>
        </div>
      )}
      
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-4 z-[500] shadow-2xl">
          <span className="text-sm font-medium">{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="opacity-50">✕</button>
        </div>
      )}
    </div>
  );
}