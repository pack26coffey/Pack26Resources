import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  ZoomIn,
  Loader2,
  Lock,
  Eye
} from 'lucide-react';

const GlobalStyles = () => (
  <style>{`
    :root {
      --bsa-blue: #003F87;
      --bsa-gold: #FDC82F;
      --bg-light: #F8FAFC;
      --bg-dark: #020617;
    }

    * { box-sizing: border-box; }

    #root { 
      max-width: 100% !important; 
      margin: 0 !important; 
      padding: 0 !important; 
      width: 100%;
    }

    body { 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-light);
      color: #1e293b;
    }

    .dark body { 
      background-color: var(--bg-dark);
      color: #f8fafc;
    }
    
    .bsa-header {
      background-color: var(--bsa-blue);
      border-bottom: 5px solid var(--bsa-gold);
      color: white;
      padding: 0 1rem;
      position: sticky;
      top: 0;
      z-index: 100;
      width: 100%;
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

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .logo-box {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 8px;
      background: rgba(255,255,255,0.1);
      position: relative;
    }

    .title-group h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 900;
      text-transform: uppercase;
      font-style: italic;
      line-height: 1;
    }

    .title-group p {
      margin: 2px 0 0 0;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #bfdbfe;
    }

    .main-content {
      max-width: 1100px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .resource-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 24px;
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
    }

    .dark .tile-card { 
      background: #0f172a; 
      border-color: #1e293b; 
      color: white; 
    }

    .tile-card:hover:not(.editing) { 
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }

    .tile-image-area {
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      background: #f1f5f9;
      overflow: hidden;
      position: relative;
      width: 100%;
    }

    .dark .tile-image-area { background: #1e293b; }

    .tile-label {
      padding: 16px;
      text-align: center;
      font-weight: 800;
      font-size: 14px;
      text-transform: uppercase;
      border-top: 1px solid #f1f5f9;
    }
    
    .dark .tile-label { border-top-color: #1e293b; }

    .btn-group {
      display: flex;
      gap: 8px;
    }

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
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
    }

    .icon-btn:hover { background: rgba(255,255,255,0.2); }
    .icon-btn.active { background: var(--bsa-gold); color: var(--bsa-blue); }

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
      transition: transform 0.1s;
      flex-shrink: 0;
    }

    .action-badge:active { transform: scale(0.9); }

    .add-btn {
      border: 3px dashed #cbd5e1;
      background: transparent;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #64748b;
      cursor: pointer;
      border-radius: 1.25rem;
    }

    .dark .add-btn { border-color: #334155; color: #94a3b8; }

    .crop-preview-container {
      width: 150px;
      height: 150px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #003F87;
      position: relative;
      margin: 0 auto 20px;
      background: #f1f5f9;
      cursor: grab;
    }

    .image-search-results {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 10px;
      padding: 4px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .search-thumb {
      aspect-ratio: 1;
      width: 100%;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
    }

    .admin-footer {
       position: fixed;
       bottom: 20px;
       right: 20px;
       z-index: 50;
    }
  `}</style>
);

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

const DEFAULT_LINKS: ScoutLink[] = [
  { id: '1', title: 'Scoutbook', url: 'https://scoutbook.scouting.org/', imageUrl: '', iconName: 'BookOpen', zoom: 1, offsetX: 0, offsetY: 0 },
  { id: '2', title: 'Boy Scouts', url: 'https://www.scouting.org/', imageUrl: '', iconName: 'Shield', zoom: 1, offsetX: 0, offsetY: 0 }
];

const DEFAULT_SETTINGS: AppSettings = {
  headerTitle: 'Pack Resources',
  headerSubtitle: 'Cub Scouts of America',
  headerLogoUrl: 'https://www.scouting.org/wp-content/uploads/2018/05/cub-scouts-logo.png',
  headerLogoZoom: 1,
  headerLogoOffsetX: 0,
  headerLogoOffsetY: 0
};

const ICON_MAP: Record<string, any> = { Tent, Calendar, MapPin, Info, BookOpen, Camera, MessageSquare, Shield, Star, Globe };

const GenericImage = ({ url, zoom = 1, offsetX = 0, offsetY = 0, alt, iconName }: any) => {
  const [error, setError] = useState(false);
  const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Tent;
  
  if ((!url || error) || (!url && iconName)) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 text-inherit opacity-70">
        <IconComponent size="80%" strokeWidth={1.5} />
      </div>
    );
  }
  
  return (
    <img 
      src={url} 
      alt={alt || "Image"} 
      onError={() => setError(true)}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transformOrigin: 'center center',
        transform: `translate(-50%, -50%) translate(${offsetX}%, ${offsetY}%) scale(${zoom})`,
        objectFit: 'none',
        transition: 'none'
      }}
    />
  );
};

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [links, setLinks] = useState<ScoutLink[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isEditing, setIsEditing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'link' | 'header'>('link');
  const [editingLink, setEditingLink] = useState<ScoutLink | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    const mode = params.get('mode');

    if (mode === 'admin') setIsAdmin(true);
    if (darkMode) document.documentElement.classList.add('dark');

    if (data) {
      try {
        const decodedString = atob(decodeURIComponent(data));
        const decoded = JSON.parse(decodedString);
        setLinks(decoded.l.map((l: any) => ({
          id: l.i, title: l.t, url: l.u, imageUrl: l.img, iconName: l.icon || 'Tent',
          zoom: l.z || 1, offsetX: l.ox || 0, offsetY: l.oy || 0
        })));
        if (decoded.s) {
          setSettings({
            headerTitle: decoded.s.ht || DEFAULT_SETTINGS.headerTitle,
            headerSubtitle: decoded.s.hs || DEFAULT_SETTINGS.headerSubtitle,
            headerLogoUrl: decoded.s.hl || DEFAULT_SETTINGS.headerLogoUrl,
            headerLogoZoom: decoded.s.hz || DEFAULT_SETTINGS.headerLogoZoom,
            headerLogoOffsetX: decoded.s.hox || DEFAULT_SETTINGS.headerLogoOffsetX,
            headerLogoOffsetY: decoded.s.hoy || DEFAULT_SETTINGS.headerLogoOffsetY,
          });
        }
        setIsDataLoaded(true);
      } catch (e) { 
        console.error("Data decode error", e); 
        setLinks(DEFAULT_LINKS);
        setIsDataLoaded(true);
      }
    } else {
      const localLinks = localStorage.getItem('cubScoutLinks');
      const localSettings = localStorage.getItem('cubScoutSettings');
      if (localLinks) setLinks(JSON.parse(localLinks));
      else setLinks(DEFAULT_LINKS);
      if (localSettings) setSettings(JSON.parse(localSettings));
      setIsDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('cubScoutLinks', JSON.stringify(links));
      localStorage.setItem('cubScoutSettings', JSON.stringify(settings));
    }
  }, [links, settings, isDataLoaded]);

  const handleSearchImages = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const apiKey = ""; 
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Find high-quality logo URLs for "${searchQuery}". Return only a JSON array of 8 direct image URLs (strings).` }] }],
          tools: [{ google_search: {} }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      const urls = JSON.parse(text || "[]");
      setSearchResults(Array.isArray(urls) ? urls : []);
    } catch (e) {
      setToastMsg("Search failed. Try a different query.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleShare = () => {
    try {
      const payload = { 
        l: links.map(l => ({ i: l.id, t: l.title, u: l.url, img: l.imageUrl, icon: l.iconName, z: l.zoom, ox: l.offsetX, oy: l.offsetY })),
        s: { ht: settings.headerTitle, hs: settings.headerSubtitle, hl: settings.headerLogoUrl, hz: settings.headerLogoZoom, hox: settings.headerLogoOffsetX, hoy: settings.headerLogoOffsetY }
      };
      const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl; 
      document.body.appendChild(textArea);
      textArea.select(); 
      document.execCommand('copy'); 
      document.body.removeChild(textArea);
      setToastMsg("Public link copied!");
    } catch (err) { 
      setToastMsg("Failed to generate link."); 
    }
  };

  const toggleAdmin = () => {
    const next = !isAdmin;
    setIsAdmin(next);
    if (!next) setIsEditing(false);
    const params = new URLSearchParams(window.location.search);
    if (next) params.set('mode', 'admin');
    else params.delete('mode');
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'link') {
      let finalUrl = formData.url.trim();
      if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
      if (editingLink) setLinks(links.map(l => l.id === editingLink.id ? { ...formData, url: finalUrl } : l));
      else setLinks([...links, { ...formData, id: crypto.randomUUID(), url: finalUrl }]);
    } else {
      setSettings({
        headerTitle: formData.title, headerSubtitle: formData.subtitle,
        headerLogoUrl: formData.imageUrl, headerLogoZoom: formData.zoom,
        headerLogoOffsetX: formData.offsetX, headerLogoOffsetY: formData.offsetY
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className={`app-wrapper ${darkMode ? 'dark' : ''}`}>
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
            <button onClick={() => { setDarkMode(!darkMode); document.documentElement.classList.toggle('dark'); }} className="icon-btn">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {isAdmin && (
              <>
                <button onClick={handleShare} className="icon-btn"><Share2 size={16} /> <span>Save & Share</span></button>
                <button onClick={() => setIsEditing(!isEditing)} className={`icon-btn ${isEditing ? 'active' : ''}`}>
                  <Settings size={16} /> <span>{isEditing ? 'Exit Editor' : 'Edit Page'}</span>
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
                  <button onClick={() => setLinks(links.filter(l => l.id !== link.id))} className="action-badge" style={{ background: '#dc2626' }}><Trash2 size={14} color="white" /></button>
                </div>
              )}
              <a href={isEditing ? '#' : link.url} target="_blank" rel="noopener noreferrer" className={`tile-card ${isEditing ? 'editing' : ''}`}>
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
            }} className="add-btn"><Plus size={32} /><span>Add New Link</span></button>
          )}
        </div>
      </main>

      <div className="admin-footer">
        <button onClick={toggleAdmin} className="action-badge" style={{ background: isAdmin ? 'var(--bsa-gold)' : '#64748b' }}>
          {isAdmin ? <Eye size={16} color="var(--bsa-blue)" /> : <Lock size={16} color="white" />}
        </button>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: darkMode ? '#0f172a' : 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ background: 'var(--bsa-blue)', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, textTransform: 'uppercase' }}>{modalMode === 'header' ? 'Header Settings' : 'Link Settings'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
            </div>
            <form onSubmit={handleSaveModal} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>TITLE</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', color: 'inherit' }} />
              </div>
              
              {modalMode === 'link' ? (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>URL</label>
                  <input required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', color: 'inherit' }} />
                </div>
              ) : (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>SUBTITLE</label>
                  <input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', color: 'inherit' }} />
                </div>
              )}

              <div style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>VISUALS (DRAG TO CENTER)</label>
                <div 
                  className="crop-preview-container"
                  onMouseDown={(e) => { dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY }; }}
                  onMouseMove={(e) => {
                    if (!dragRef.current.isDragging) return;
                    const factor = (formData.zoom || 1) * 0.5;
                    const dx = (e.clientX - dragRef.current.startX) / factor;
                    const dy = (e.clientY - dragRef.current.startY) / factor;
                    setFormData((p: any) => ({ ...p, offsetX: (p.offsetX || 0) + dx, offsetY: (p.offsetY || 0) + dy }));
                    dragRef.current.startX = e.clientX; 
                    dragRef.current.startY = e.clientY;
                  }}
                  onMouseUp={() => dragRef.current.isDragging = false}
                  onMouseLeave={() => dragRef.current.isDragging = false}
                >
                  <GenericImage url={formData.imageUrl} zoom={formData.zoom} offsetX={formData.offsetX} offsetY={formData.offsetY} iconName={formData.iconName} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                   <ZoomIn size={16} />
                   <input type="range" min="0.1" max="5" step="0.05" value={formData.zoom || 1} onChange={e => setFormData({...formData, zoom: parseFloat(e.target.value)})} style={{ flex: 1 }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input 
                    placeholder="Search for logo..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchImages(); } }}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', color: 'inherit' }} 
                  />
                  <button type="button" onClick={handleSearchImages} style={{ background: 'var(--bsa-blue)', color: 'white', padding: '8px 15px', borderRadius: '8px' }}>
                    {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="image-search-results">
                    {searchResults.map((u, i) => (
                      <img key={i} src={u} alt="Result" className="search-thumb" onClick={() => setFormData({...formData, imageUrl: u, iconName: '', zoom: 1, offsetX: 0, offsetY: 0})} />
                    ))}
                  </div>
                )}

                {modalMode === 'link' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '10px' }}>
                    {Object.keys(ICON_MAP).map(n => {
                      const Icon = ICON_MAP[n];
                      return (
                        <button key={n} type="button" onClick={() => setFormData({...formData, iconName: n, imageUrl: '', zoom: 1, offsetX: 0, offsetY: 0})} style={{ padding: '8px', border: formData.iconName === n ? '2px solid blue' : '1px solid #ddd', borderRadius: '8px', background: 'transparent', color: 'inherit' }}>
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button type="submit" style={{ width: '100%', padding: '15px', background: 'var(--bsa-blue)', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}>SAVE CHANGES</button>
            </form>
          </div>
        </div>
      )}
      
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.9)', color: 'white', padding: '12px 24px', borderRadius: '99px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 300, display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </div>
  );
}