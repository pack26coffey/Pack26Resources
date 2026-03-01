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
  Moon
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
    }

    .logo-box {
      width: 55px;
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-box img {
      height: 100%;
      width: auto;
      object-fit: contain;
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
      padding: 24px;
      background: #f1f5f9;
    }

    .dark .tile-image-area { background: #1e293b; }

    .tile-image-area img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

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
    title: 'Boy Scouts',
    url: 'https://www.scouting.org/',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Cubscouts.svg/1200px-Cubscouts.svg.png',
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
      <div className="w-full h-full flex items-center justify-center text-[#003F87] dark:text-blue-400">
        <IconComponent size={48} strokeWidth={1.5} />
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      onError={() => setError(true)}
    />
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
    <div className={`app-wrapper ${darkMode ? 'dark' : ''}`}>
      <GlobalStyles />
      
      <header className="bsa-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo-box">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Cubscouts.svg/1200px-Cubscouts.svg.png" 
                alt="Logo" 
              />
            </div>
            <div className="title-group">
              <h1>Pack Resources</h1>
              <p>Cub Scouts of America</p>
            </div>
          </div>
          
          <div className="btn-group">
            <button onClick={toggleDarkMode} className="icon-btn">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={handleShare} className="icon-btn">
              <Share2 size={16} /> <span>Share</span>
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className={`icon-btn ${isEditing ? 'active' : ''}`}
            >
              <Settings size={16} /> <span>{isEditing ? 'Done' : 'Edit'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="resource-grid">
          {links.map((link: ScoutLink) => (
            <div key={link.id} style={{ position: 'relative' }}>
              {isEditing && (
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => openEditModal(link)} style={{ background: '#2563eb', color: 'white', padding: '8px', borderRadius: '50%', border: '2px solid white', cursor: 'pointer' }}><Edit2 size={12} /></button>
                  <button onClick={() => handleDelete(link.id)} style={{ background: '#dc2626', color: 'white', padding: '8px', borderRadius: '50%', border: '2px solid white', cursor: 'pointer' }}><Trash2 size={12} /></button>
                </div>
              )}
              
              <a 
                href={isEditing ? '#' : link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="tile-card"
                style={isEditing ? { opacity: 0.5 } : {}}
              >
                <div className="tile-image-area">
                  <TileImage src={link.imageUrl} alt={link.title} iconName={link.iconName} />
                </div>
                <div className="tile-label">
                  {link.title}
                </div>
              </a>
            </div>
          ))}

          {isEditing && (
            <button onClick={openAddModal} className="add-btn">
              <Plus size={32} />
              <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>Add Link</span>
            </button>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: darkMode ? '#0f172a' : 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', margin: 'auto', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#003F87', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, textTransform: 'uppercase', fontStyle: 'italic', fontSize: '1.2rem' }}>Link Settings</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '30px' }}>
              <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #ddd' }} />
              <input required placeholder="URL" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #ddd' }} />
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>SELECT AN ICON:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {Object.keys(ICON_MAP).map(name => {
                  const Icon = ICON_MAP[name];
                  return (
                    <button key={name} type="button" onClick={() => setFormData({...formData, iconName: name, imageUrl: ''})} style={{ padding: '10px', borderRadius: '8px', border: formData.iconName === name ? '2px solid #003F87' : '1px solid #ddd', background: formData.iconName === name ? '#eff6ff' : 'white', cursor: 'pointer' }}>
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>
              <input placeholder="Or Image URL" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value, iconName: ''})} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '12px', border: '1px solid #ddd' }} />
              <button type="submit" style={{ width: '100%', padding: '15px', background: '#003F87', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>SAVE CHANGES</button>
            </form>
          </div>
        </div>
      )}
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}