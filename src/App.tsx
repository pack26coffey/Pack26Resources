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
  Move,
  ZoomIn,
  Loader2,
  Layout
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
    }

    .dark .tile-card { 
      background: #0f172a; 
      border-color: #1e293b; 
      color: white; 
    }

    .tile-card:hover { 
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

    .crop-preview-container:active {
      cursor: grabbing;
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
      transition: opacity 0.2s;
    }

    .search-thumb:hover {
      opacity: 0.8;
      outline: 2px solid var(--bsa-blue);
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
  {
    id: '1',
    title: 'Scoutbook',
    url: 'https://scoutbook.scouting.org/',
    imageUrl: 'https://help.scoutbook.scouting.org/wp-content/uploads/2019/11/SB-logo-2.png',
    iconName: 'BookOpen',
    zoom: 1,
    offsetX: 0,
    offsetY: 0
  },
  {
    id: '2',
    title: 'Boy Scouts',
    url: 'https://www.scouting.org/',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Cubscouts.svg/1200px-Cubscouts.svg.png',
    iconName: 'Shield',
    zoom: 1,
    offsetX: 0,
    offsetY: 0
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  headerTitle: 'Pack Resources',
  headerSubtitle: 'Cub Scouts of America',
  headerLogoUrl: 'https://www.scouting.org/wp-content/uploads/2018/05/cub-scouts-logo.png',
  headerLogoZoom: 1,
  headerLogoOffsetX: 0,
  headerLogoOffsetY: 0
};

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
        // Use transform-origin to ensure scaling happens from the center
        transformOrigin: 'center center',
        // Apply scale AND translate
        // Translating by -50% -50% keeps it centered, then we add the manual offsets
        transform: `translate(-50%, -50%) translate(${offsetX}%, ${offsetY}%) scale(${zoom})`,
        // Object-fit: none ensures the image is rendered at its natural size so our scale works correctly
        objectFit: 'none',
        transition: 'none' // Disable transition during drag for smoothness
      }}
    />
  );
};

export default function App() {
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
        const restoredLinks: ScoutLink[] = decoded.l.map((l: any) => ({
          id: l.i, title: l.t, url: l.u, imageUrl: l.img, iconName: l.icon || 'Tent',
          zoom: l.z || 1, offsetX: l.ox || 0, offsetY: l.oy || 0
        }));
        setLinks(restoredLinks);

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
        return;
      } catch (e) { console.error(e); }
    }
    
    const localLinks = localStorage.getItem('cubScoutLinks');
    const localSettings = localStorage.getItem('cubScoutSettings');
    if (localLinks) setLinks(JSON.parse(localLinks));
    else setLinks(DEFAULT_LINKS);
    if (localSettings) setSettings(JSON.parse(localSettings));
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('cubScoutLinks', JSON.stringify(links));
      localStorage.setItem('cubScoutSettings', JSON.stringify(settings));
    }
  }, [links, settings, isDataLoaded]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('scoutTheme', newMode ? 'dark' : 'light');
  };

  const handleSearchImages = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const apiKey = "";
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Find high quality logo or icon URLs for "${searchQuery}". Return only a JSON array of image URLs.` }] }],
          tools: [{ google_search: {} }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      const urls = JSON.parse(text || "[]");
      setSearchResults(Array.isArray(urls) ? urls : []);
    } catch (e) {
      setToastMsg("Search failed. Try entering a URL manually.");
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
      textArea.value = shareUrl; document.body.appendChild(textArea);
      textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea);
      setToastMsg("Link copied! Share this with your Pack.");
    } catch (err) { setToastMsg("Failed to generate link."); }
  };

  const openAddModal = () => {
    setModalMode('link');
    setFormData({ id: '', title: '', url: '', imageUrl: '', iconName: 'Tent', zoom: 1, offsetX: 0, offsetY: 0 });
    setEditingLink(null);
    setSearchResults([]); setSearchQuery('');
    setIsModalOpen(true);
  };

  const openEditLinkModal = (link: ScoutLink) => {
    setModalMode('link');
    setFormData({ ...link });
    setEditingLink(link);
    setSearchResults([]); setSearchQuery('');
    setIsModalOpen(true);
  };

  const openEditHeaderModal = () => {
    setModalMode('header');
    setFormData({
      title: settings.headerTitle,
      subtitle: settings.headerSubtitle,
      imageUrl: settings.headerLogoUrl,
      zoom: settings.headerLogoZoom,
      offsetX: settings.headerLogoOffsetX,
      offsetY: settings.headerLogoOffsetY
    });
    setSearchResults([]); setSearchQuery('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
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

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    // Scale the movement sensitivity based on zoom level
    const factor = (formData.zoom || 1) * 0.5;
    const deltaX = (e.clientX - dragRef.current.startX) / factor;
    const deltaY = (e.clientY - dragRef.current.startY) / factor;
    setFormData((prev: any) => ({
      ...prev,
      offsetX: (prev.offsetX || 0) + deltaX,
      offsetY: (prev.offsetY || 0) + deltaY
    }));
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
  };

  const handleMouseUp = () => { dragRef.current.isDragging = false; };

  return (
    <div className={`app-wrapper ${darkMode ? 'dark' : ''}`}>
      <GlobalStyles />
      <header className="bsa-header">
        <div className="header-container">
          <div className="logo-section">
            {isEditing && (
              <button onClick={openEditHeaderModal} className="action-badge" style={{ position: 'absolute', top: '-10px', left: '-10px', zIndex: 110, background: 'var(--bsa-gold)' }}>
                <Settings size={14} color="var(--bsa-blue)" />
              </button>
            )}
            <div className="logo-box">
              <GenericImage 
                url={settings.headerLogoUrl} zoom={settings.headerLogoZoom} 
                offsetX={settings.headerLogoOffsetX} offsetY={settings.headerLogoOffsetY} 
                alt="Logo"
              />
            </div>
            <div className="title-group">
              <h1>{settings.headerTitle}</h1>
              <p>{settings.headerSubtitle}</p>
            </div>
          </div>
          <div className="btn-group">
            <button onClick={toggleDarkMode} className="icon-btn">{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button onClick={handleShare} className="icon-btn"><Share2 size={16} /> <span>Share</span></button>
            <button onClick={() => setIsEditing(!isEditing)} className={`icon-btn ${isEditing ? 'active' : ''}`}><Settings size={16} /> <span>{isEditing ? 'Done' : 'Edit'}</span></button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="resource-grid">
          {links.map((link) => (
            <div key={link.id} style={{ position: 'relative' }}>
              {isEditing && (
                <div style={{ position: 'absolute', top: '-12px', right: '-12px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => openEditLinkModal(link)} className="action-badge" style={{ background: '#2563eb' }}><Edit2 size={14} color="white" /></button>
                  <button onClick={() => setLinks(links.filter(l => l.id !== link.id))} className="action-badge" style={{ background: '#dc2626' }}><Trash2 size={14} color="white" /></button>
                </div>
              )}
              <a href={isEditing ? '#' : link.url} target="_blank" rel="noopener noreferrer" className="tile-card" style={isEditing ? { opacity: 0.6, cursor: 'default' } : {}}>
                <div className="tile-image-area">
                  <GenericImage 
                    url={link.imageUrl} zoom={link.zoom} 
                    offsetX={link.offsetX} offsetY={link.offsetY} 
                    iconName={link.iconName} alt={link.title}
                  />
                </div>
                <div className="tile-label">{link.title}</div>
              </a>
            </div>
          ))}
          {isEditing && (
            <button onClick={openAddModal} className="add-btn"><Plus size={32} /><span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>Add Link</span></button>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: darkMode ? '#0f172a' : 'white', borderRadius: '24px', width: '100%', maxWidth: '550px', margin: 'auto', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#003F87', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{modalMode === 'header' ? <Layout size={20} /> : <Plus size={20} />}<h2 style={{ margin: 0, textTransform: 'uppercase', fontStyle: 'italic', fontSize: '1.2rem' }}>{modalMode === 'header' ? 'Header Settings' : editingLink ? 'Edit Link' : 'Add New Link'}</h2></div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '25px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Text Settings</label>
                <input required placeholder={modalMode === 'header' ? "Pack Title" : "Website Title"} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: darkMode ? '#1e293b' : 'white', color: 'inherit' }} />
                {modalMode === 'header' ? (
                  <input placeholder="Subtitle" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: darkMode ? '#1e293b' : 'white', color: 'inherit' }} />
                ) : (
                  <input required placeholder="URL" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: darkMode ? '#1e293b' : 'white', color: 'inherit' }} />
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Crop & Center (Drag to adjust)</label>
                <div className="crop-preview-container" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                  <GenericImage url={formData.imageUrl} zoom={formData.zoom} offsetX={formData.offsetX} offsetY={formData.offsetY} iconName={formData.iconName} />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px', borderRadius: '4px' }}><Move size={12} /></div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                  <ZoomIn size={16} color="#64748b" />
                  <input type="range" min="0.1" max="5" step="0.05" value={formData.zoom} onChange={e => setFormData({...formData, zoom: parseFloat(e.target.value)})} style={{ flex: 1 }} />
                  <span style={{ fontSize: '12px', minWidth: '35px' }}>{formData.zoom?.toFixed(2)}x</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                    <input placeholder="Search for a logo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchImages())} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', background: darkMode ? '#1e293b' : 'white', color: 'inherit' }} />
                  </div>
                  <button type="button" onClick={handleSearchImages} style={{ background: '#003F87', color: 'white', border: 'none', borderRadius: '10px', padding: '0 15px', fontWeight: 'bold' }}>{isSearching ? <Loader2 className="animate-spin" size={20} /> : 'GO'}</button>
                </div>
                {searchResults.length > 0 && (
                  <div className="image-search-results">
                    {searchResults.map((url, idx) => (
                      <img key={idx} src={url} className="search-thumb" onClick={() => setFormData({...formData, imageUrl: url, iconName: '', zoom: 1, offsetX: 0, offsetY: 0})} />
                    ))}
                  </div>
                )}
                {modalMode === 'link' && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Or Select Icon:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {Object.keys(ICON_MAP).map(name => {
                        const Icon = ICON_MAP[name];
                        return (
                          <button key={name} type="button" onClick={() => setFormData({...formData, iconName: name, imageUrl: '', zoom: 1, offsetX: 0, offsetY: 0})} style={{ padding: '10px', borderRadius: '8px', border: formData.iconName === name ? '2px solid #003F87' : '1px solid #e2e8f0', background: formData.iconName === name ? '#eff6ff' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                            <Icon size={18} color={formData.iconName === name ? '#003F87' : '#64748b'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <button type="submit" style={{ width: '100%', padding: '15px', background: '#003F87', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>Save {modalMode === 'header' ? 'Header' : 'Link'}</button>
            </form>
          </div>
        </div>
      )}
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}