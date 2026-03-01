import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
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
  Search,
  ZoomIn,
  Loader2,
  Lock,
  KeyRound
} from 'lucide-react';

const ADMIN_PASSWORD = "scout123";

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
      color: white;
      padding: 0 1rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .header-container {
      max-width: 1100px;
      margin: 0 auto;
      height: 80px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-box {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 8px;
      background: rgba(255,255,255,0.1);
      position: relative;
    }
    .title-group h1 { margin: 0; font-size: 1.5rem; font-weight: 900; text-transform: uppercase; font-style: italic; }
    .title-group p { margin: 2px 0 0; font-size: 10px; text-transform: uppercase; color: #bfdbfe; }

    .main-content { max-width: 1100px; margin: 40px auto; padding: 0 20px; }
    .resource-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 20px;
    }

    .tile-card {
      background: white;
      border-radius: 1.25rem;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: relative;
      height: 100%;
    }
    .dark .tile-card { background: #0f172a; border-color: #1e293b; color: white; }
    .tile-card:hover:not(.editing) { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

    .tile-image-area {
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      overflow: hidden;
      position: relative;
      width: 100%;
    }
    .dark .tile-image-area { background: #1e293b; }
    .tile-label {
      padding: 12px;
      text-align: center;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      border-top: 1px solid #f1f5f9;
    }
    .dark .tile-label { border-top-color: #1e293b; }

    .icon-btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 8px 12px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 12px;
    }
    .icon-btn.active { background: var(--bsa-gold); color: var(--bsa-blue); border-color: var(--bsa-gold); }

    .action-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .crop-preview-container {
      width: 120px;
      height: 120px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid var(--bsa-blue);
      position: relative;
      margin: 0 auto 15px;
      background: #f1f5f9;
      cursor: move;
    }

    .image-search-results {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      max-height: 250px;
      overflow-y: auto;
      margin-top: 15px;
      padding: 10px;
      background: rgba(0,0,0,0.03);
      border-radius: 12px;
    }
    .search-thumb {
      aspect-ratio: 1;
      width: 100%;
      object-fit: contain;
      background: white;
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      padding: 4px;
    }
    .search-thumb:hover { border-color: var(--bsa-blue); }

    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `}</style>
);

interface ScoutLink {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  iconName?: string; 
  zoom: number;
  offsetX: number;
  offsetY: number;
}

const DEFAULT_LINKS: ScoutLink[] = [
  { id: '1', title: 'Scoutbook', url: 'https://scoutbook.scouting.org/', imageUrl: '', iconName: 'BookOpen', zoom: 1, offsetX: 0, offsetY: 0 },
  { id: '2', title: 'Official BSA', url: 'https://www.scouting.org/', imageUrl: '', iconName: 'Shield', zoom: 1, offsetX: 0, offsetY: 0 }
];

const ICON_MAP: Record<string, any> = { Tent, Calendar, MapPin, Info, BookOpen, Camera, MessageSquare, Shield, Star, Globe };

const ResourceImage = ({ item }: { item: Partial<ScoutLink> }) => {
  const [error, setError] = useState(false);
  const IconComponent = item.iconName && ICON_MAP[item.iconName] ? ICON_MAP[item.iconName] : Tent;
  
  if (!item.imageUrl || error) {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-40">
        <IconComponent size="50%" strokeWidth={1.5} />
      </div>
    );
  }
  
  return (
    <img 
      src={item.imageUrl} 
      alt="" 
      onError={() => setError(true)}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translate(${item.offsetX}%, ${item.offsetY}%) scale(${item.zoom})`,
        maxWidth: 'none',
        height: 'auto',
        width: 'auto',
        display: 'block'
      }}
    />
  );
};

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [links, setLinks] = useState<ScoutLink[]>([]);
  const [settings, setSettings] = useState({
    headerTitle: 'Pack Resources',
    headerSubtitle: 'Cub Scouts of America',
    headerLogoUrl: 'https://www.scouting.org/wp-content/uploads/2018/05/cub-scouts-logo.png',
    headerLogoZoom: 1, headerLogoOffsetX: 0, headerLogoOffsetY: 0
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [modalMode, setModalMode] = useState<'link' | 'header'>('link');
  const [formData, setFormData] = useState<Partial<ScoutLink>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState('');

  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('scout_links_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setLinks(parsed.links || DEFAULT_LINKS);
      setSettings(parsed.settings || settings);
    } else {
      setLinks(DEFAULT_LINKS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scout_links_data', JSON.stringify({ links, settings }));
  }, [links, settings]);

  const handleIconSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    
    const apiKey = "";
    const prompt = `Find 12 high-quality transparent PNG logo/icon image URLs for "${searchQuery}" related to Boy Scouts of America or Cub Scouts. Return ONLY a valid JSON array of strings containing the direct image URLs. No other text.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const urls = JSON.parse(text);
      
      if (Array.isArray(urls)) {
        setSearchResults(urls.filter(u => typeof u === 'string' && u.startsWith('http')));
      } else {
        setToast("No icons found. Try a broader search.");
      }
    } catch (e) {
      setToast("Search error. Try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'link') {
      const finalUrl = formData.url?.startsWith('http') ? formData.url : `https://${formData.url}`;
      const newLink = { ...formData, url: finalUrl } as ScoutLink;
      if (newLink.id) {
        setLinks(links.map(l => l.id === newLink.id ? newLink : l));
      } else {
        setLinks([...links, { ...newLink, id: crypto.randomUUID() }]);
      }
    } else {
      setSettings({
        ...settings,
        headerTitle: formData.title || settings.headerTitle,
        headerSubtitle: (formData as any).subtitle || settings.headerSubtitle,
        headerLogoUrl: formData.imageUrl || settings.headerLogoUrl,
        headerLogoZoom: formData.zoom || 1,
        headerLogoOffsetX: formData.offsetX || 0,
        headerLogoOffsetY: formData.offsetY || 0,
      });
    }
    setIsModalOpen(false);
  };

  const openLinkEditor = (link?: ScoutLink) => {
    setModalMode('link');
    setFormData(link || { title: '', url: '', imageUrl: '', zoom: 1, offsetX: 0, offsetY: 0, iconName: 'Tent' });
    setSearchResults([]);
    setSearchQuery('');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <GlobalStyles />
      
      <header className="bsa-header">
        <div className="header-container">
          <div className="flex items-center gap-4 relative">
            {isEditing && (
              <button onClick={() => {
                setModalMode('header');
                setFormData({ title: settings.headerTitle, imageUrl: settings.headerLogoUrl, zoom: settings.headerLogoZoom, offsetX: settings.headerLogoOffsetX, offsetY: settings.headerLogoOffsetY });
                setIsModalOpen(true);
              }} className="action-badge absolute -top-2 -left-2 z-50 bg-yellow-400">
                <Edit2 size={14} className="text-blue-900" />
              </button>
            )}
            <div className="logo-box">
              <ResourceImage item={{ imageUrl: settings.headerLogoUrl, zoom: settings.headerLogoZoom, offsetX: settings.headerLogoOffsetX, offsetY: settings.headerLogoOffsetY }} />
            </div>
            <div className="title-group">
              <h1>{settings.headerTitle}</h1>
              <p>{settings.headerSubtitle}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isAdmin ? (
              <>
                <button onClick={() => setIsEditing(!isEditing)} className={`icon-btn ${isEditing ? 'active' : ''}`}>
                  <Settings size={16} /> <span>{isEditing ? 'Done' : 'Edit Mode'}</span>
                </button>
                <button onClick={() => setIsAdmin(false)} className="icon-btn bg-red-600 border-none"><X size={16} /></button>
              </>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="icon-btn opacity-20 hover:opacity-100 transition-opacity">
                <Lock size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="resource-grid">
          {links.map((link) => (
            <div key={link.id} className="relative">
              {isEditing && (
                <div className="absolute -top-2 -right-2 z-10 flex flex-col gap-1">
                  <button onClick={() => openLinkEditor(link)} className="action-badge bg-blue-600"><Edit2 size={12} color="white" /></button>
                  <button onClick={() => setLinks(links.filter(l => l.id !== link.id))} className="action-badge bg-red-600"><Trash2 size={12} color="white" /></button>
                </div>
              )}
              <a href={isEditing ? undefined : link.url} target="_blank" rel="noreferrer" className="tile-card">
                <div className="tile-image-area">
                  <ResourceImage item={link} />
                </div>
                <div className="tile-label">{link.title}</div>
              </a>
            </div>
          ))}
          {isEditing && (
            <button onClick={() => openLinkEditor()} className="tile-card border-dashed border-2 border-slate-300 bg-transparent flex flex-col items-center justify-center gap-2 text-slate-400 min-h-[160px]">
              <Plus size={32} />
              <span className="font-bold text-xs">ADD LINK</span>
            </button>
          )}
        </div>
      </main>

      {isLoginOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound color="white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Admin Access</h2>
            <p className="text-slate-500 text-sm mb-6">Enter password to unlock editing.</p>
            <input 
              type="password" 
              autoFocus 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl mb-4 text-center text-lg tracking-widest"
              onKeyDown={e => {
                if (e.key === 'Enter' && password === ADMIN_PASSWORD) {
                  setIsAdmin(true);
                  setIsEditing(true);
                  setIsLoginOpen(false);
                  setPassword('');
                }
              }}
            />
            <div className="flex gap-2">
              <button onClick={() => setIsLoginOpen(false)} className="flex-1 p-3 font-bold text-slate-400">Cancel</button>
              <button onClick={() => {
                if (password === ADMIN_PASSWORD) {
                  setIsAdmin(true);
                  setIsEditing(true);
                  setIsLoginOpen(false);
                  setPassword('');
                } else {
                  setToast("Incorrect password.");
                }
              }} className="flex-1 bg-blue-900 text-white p-3 rounded-xl font-bold">Login</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-900 p-5 text-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold uppercase tracking-wider">{modalMode === 'link' ? 'Link Editor' : 'Header Editor'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Label Name</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-xl mt-1" />
                </div>

                {modalMode === 'link' ? (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Target URL</label>
                    <input required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full p-3 border rounded-xl mt-1" placeholder="scouting.org" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Subtitle</label>
                    <input value={(formData as any).subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value} as any)} className="w-full p-3 border rounded-xl mt-1" />
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Graphic Settings</label>
                  
                  <div 
                    className="crop-preview-container"
                    onMouseDown={e => { dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY }; }}
                    onMouseMove={e => {
                      if (!dragRef.current.isDragging) return;
                      const dx = (e.clientX - dragRef.current.startX) / (formData.zoom || 1);
                      const dy = (e.clientY - dragRef.current.startY) / (formData.zoom || 1);
                      setFormData(p => ({ ...p, offsetX: (p.offsetX || 0) + dx, offsetY: (p.offsetY || 0) + dy }));
                      dragRef.current.startX = e.clientX;
                      dragRef.current.startY = e.clientY;
                    }}
                    onMouseUp={() => dragRef.current.isDragging = false}
                    onMouseLeave={() => dragRef.current.isDragging = false}
                  >
                    <ResourceImage item={formData} />
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <ZoomIn size={16} className="text-slate-400" />
                    <input type="range" min="0.1" max="5" step="0.1" value={formData.zoom} onChange={e => setFormData({...formData, zoom: parseFloat(e.target.value)})} className="flex-1" />
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
                      <input 
                        placeholder="Search for scout icons..." 
                        className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleIconSearch())}
                      />
                    </div>
                    <button type="button" onClick={handleIconSearch} className="bg-blue-900 text-white px-5 rounded-xl">
                      {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="image-search-results">
                      {searchResults.map((url, i) => (
                        <img 
                          key={i} 
                          src={url} 
                          className="search-thumb" 
                          alt="Option" 
                          onClick={() => setFormData({...formData, imageUrl: url, iconName: '', zoom: 1, offsetX: 0, offsetY: 0})} 
                        />
                      ))}
                    </div>
                  )}

                  {modalMode === 'link' && !searchResults.length && (
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {Object.keys(ICON_MAP).map(name => {
                        const Icon = ICON_MAP[name];
                        return (
                          <button 
                            key={name}
                            type="button" 
                            onClick={() => setFormData({...formData, iconName: name, imageUrl: '', zoom: 1, offsetX: 0, offsetY: 0})}
                            className={`p-3 rounded-xl border flex items-center justify-center ${formData.iconName === name ? 'border-blue-900 bg-blue-50' : 'border-slate-200'}`}
                          >
                            <Icon size={20} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-blue-900 text-white p-4 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full text-sm font-bold z-[500] shadow-2xl animate-bounce">
          {toast}
          <button onClick={() => setToast('')} className="ml-4 opacity-50">✕</button>
        </div>
      )}
    </div>
  );
}