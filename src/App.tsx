import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Moon, 
  Sun, 
  ExternalLink,
  ChevronRight,
  Star
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot,
  DocumentSnapshot
} from 'firebase/firestore';

// --- Types ---
interface ScoutLink {
  id: string;
  title: string;
  url: string;
  imageUrl?: string;
  zoom?: number;
}

interface AppSettings {
  headerTitle: string;
  headerSubtitle: string;
  headerLogoUrl: string;
  headerLogoZoom: number;
}

// --- Firebase Config (Global Fallbacks) ---
// @ts-ignore
const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
// @ts-ignore
const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'scout-links-v1';
// @ts-ignore
const initialToken = window.__initial_auth_token;

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [links, setLinks] = useState<ScoutLink[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    headerTitle: 'Scout Resources',
    headerSubtitle: 'Pack 505 • Troop 101',
    headerLogoUrl: 'https://www.scouting.org/wp-content/uploads/2018/05/cub-scouts-logo.png',
    headerLogoZoom: 1,
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'link' | 'header'>('link');
  const [activeItem, setActiveItem] = useState<any>(null);

  // 1. Auth Lifecycle
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (initialToken) {
          await signInWithCustomToken(auth, initialToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth failed:", err);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // 2. Data Lifecycle
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config');
    const unsubscribe = onSnapshot(docRef, (snap: DocumentSnapshot) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.links) setLinks(data.links);
        if (data.settings) setSettings(data.settings);
      }
    }, (err) => {
      console.error("Firestore error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Actions
  const handleSave = async (updatedLinks: ScoutLink[], updatedSettings: AppSettings) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config');
    await setDoc(docRef, {
      links: updatedLinks,
      settings: updatedSettings,
      lastUpdated: Date.now()
    });
  };

  const doLogin = () => {
    if (password === 'scout123') {
      setIsAdmin(true);
      setIsEditing(true);
      setShowLogin(false);
      setPassword('');
    }
  };

  const openLinkModal = (link?: ScoutLink) => {
    setModalMode('link');
    setActiveItem(link || { id: Date.now().toString(), title: '', url: 'https://', imageUrl: '', zoom: 1 });
    setShowModal(true);
  };

  const openHeaderModal = () => {
    setModalMode('header');
    setActiveItem({ ...settings });
    setShowModal(true);
  };

  const saveModal = () => {
    if (modalMode === 'link') {
      const newLinks = [...links];
      const index = newLinks.findIndex(l => l.id === activeItem.id);
      if (index > -1) newLinks[index] = activeItem;
      else newLinks.push(activeItem);
      setLinks(newLinks);
      handleSave(newLinks, settings);
    } else {
      setSettings(activeItem);
      handleSave(links, activeItem);
    }
    setShowModal(false);
  };

  const deleteLink = (id: string) => {
    const newLinks = links.filter(l => l.id !== id);
    setLinks(newLinks);
    handleSave(newLinks, settings);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header Area */}
      <header className={`relative overflow-hidden border-b-8 border-yellow-400 py-12 px-6 ${darkMode ? 'bg-slate-900' : 'bg-white'} shadow-2xl`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className={`w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-inner border-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-white'}`}>
              <img 
                src={settings.headerLogoUrl} 
                style={{ transform: `scale(${settings.headerLogoZoom})` }}
                className="max-w-none h-full object-contain transition-transform"
                alt="Logo"
              />
            </div>
            {isEditing && (
              <button onClick={openHeaderModal} className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
                <Settings size={20} />
              </button>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-2 text-blue-800 dark:text-blue-400">
              {settings.headerTitle}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-bold uppercase tracking-widest text-sm md:text-base">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              {settings.headerSubtitle}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-2xl transition-all ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            {isAdmin && (
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all ${isEditing ? 'bg-yellow-400 text-blue-900' : 'bg-blue-800 text-white'}`}
              >
                {isEditing ? 'Finish' : 'Edit'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <main className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {links.map(link => (
            <div key={link.id} className="group relative">
              {isEditing && (
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <button onClick={() => openLinkModal(link)} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><Edit3 size={16} /></button>
                  <button onClick={() => deleteLink(link.id)} className="p-2 bg-red-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                </div>
              )}
              <a 
                href={isEditing ? undefined : link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`block aspect-square p-6 rounded-[2.5rem] transition-all duration-300 transform ${isEditing ? 'cursor-default' : 'hover:-translate-y-2 hover:shadow-2xl'} ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-xl border border-slate-100'}`}
              >
                <div className={`h-3/4 w-full rounded-3xl mb-4 overflow-hidden flex items-center justify-center ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  {link.imageUrl ? (
                    <img 
                      src={link.imageUrl} 
                      style={{ transform: `scale(${link.zoom || 1})` }}
                      className="max-w-none h-full object-contain"
                      alt={link.title}
                    />
                  ) : (
                    <Shield size={64} className="opacity-10" />
                  )}
                </div>
                <div className="text-center">
                  <span className="font-black uppercase tracking-widest text-sm opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {link.title}
                    {!isEditing && <ExternalLink size={14} className="opacity-40" />}
                  </span>
                </div>
              </a>
            </div>
          ))}

          {isEditing && (
            <button 
              onClick={() => openLinkModal()}
              className="aspect-square rounded-[2.5rem] border-4 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all group"
            >
              <Plus size={48} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-black uppercase tracking-tighter">Add Resource</span>
            </button>
          )}
        </div>
      </main>

      {/* Admin Toggle (Bottom Right) */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 ${isAdmin ? 'bg-yellow-400 text-blue-900' : 'bg-blue-800 text-white'}`}
        >
          {isAdmin ? <Lock size={28} /> : <Shield size={28} />}
        </button>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} p-10 rounded-[3rem] w-full max-w-sm shadow-2xl`}>
            <h2 className="text-2xl font-black uppercase text-center mb-8">Leader Access</h2>
            <input 
              type="password" 
              placeholder="Access Key"
              className={`w-full p-5 rounded-2xl mb-4 text-center font-bold text-xl outline-none border-2 focus:border-blue-500 transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-transparent'}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowLogin(false)} className="flex-1 font-bold opacity-50">Cancel</button>
              <button onClick={doLogin} className="flex-[2] bg-blue-800 text-white p-5 rounded-2xl font-black uppercase tracking-widest">Unlock</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className={`${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl`}>
            <div className="bg-blue-800 p-8 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest">{modalMode === 'link' ? 'Edit Resource' : 'App Settings'}</h3>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">Title</label>
                    <input 
                      value={activeItem?.title || ''} 
                      onChange={e => setActiveItem({...activeItem, title: e.target.value})}
                      className={`w-full p-4 rounded-xl font-bold ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
                    />
                  </div>
                  {modalMode === 'link' ? (
                    <div>
                      <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">Target URL</label>
                      <input 
                        value={activeItem?.url || ''} 
                        onChange={e => setActiveItem({...activeItem, url: e.target.value})}
                        className={`w-full p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">Subtitle</label>
                      <input 
                        value={activeItem?.headerSubtitle || ''} 
                        onChange={e => setActiveItem({...activeItem, headerSubtitle: e.target.value})}
                        className={`w-full p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-black uppercase opacity-40 mb-1 block">Image/Logo URL</label>
                    <input 
                      value={modalMode === 'link' ? activeItem?.imageUrl : activeItem?.headerLogoUrl} 
                      onChange={e => setActiveItem(modalMode === 'link' ? {...activeItem, imageUrl: e.target.value} : {...activeItem, headerLogoUrl: e.target.value})}
                      className={`w-full p-4 rounded-xl text-xs ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center border-l border-slate-800/10 dark:border-slate-800 pl-4">
                  <div className={`w-32 h-32 rounded-3xl mb-4 overflow-hidden border-2 border-blue-500/20 flex items-center justify-center ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                    <img 
                      src={modalMode === 'link' ? activeItem?.imageUrl : activeItem?.headerLogoUrl} 
                      style={{ transform: `scale(${modalMode === 'link' ? activeItem?.zoom : activeItem?.headerLogoZoom})` }}
                      className="max-w-none h-full object-contain"
                      alt="Preview"
                    />
                  </div>
                  <label className="text-[10px] font-black uppercase opacity-40 mb-2">Zoom: {modalMode === 'link' ? activeItem?.zoom : activeItem?.headerLogoZoom}x</label>
                  <input 
                    type="range" min="0.5" max="3" step="0.1" 
                    value={modalMode === 'link' ? activeItem?.zoom : activeItem?.headerLogoZoom}
                    onChange={e => setActiveItem(modalMode === 'link' ? {...activeItem, zoom: parseFloat(e.target.value)} : {...activeItem, headerLogoZoom: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-blue-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Discard</button>
                <button onClick={saveModal} className="flex-[2] bg-blue-800 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Apply Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}