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
  ZoomIn,
  Link as LinkIcon,
  Lock,
  KeyRound,
  GripVertical
} from 'lucide-react';

const ADMIN_PASSWORD = "CoRf121";

const GlobalStyles = () => (
  <style>{`
    :root {
      --bsa-blue: #003F87;
      --bsa-gold: #FDC82F;
      --bg-light: #F8FAFC;
    }
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-light);
      color: #1e293b;
    }
    .bsa-header {
      background-color: var(--bsa-blue);
      border-bottom: 5px solid var(--bsa-gold);
      color: white;
      padding: 1rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-container {
      max-width: 1000px;
      margin: 0 auto;
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
    }
    .main-content { max-width: 1000px; margin: 40px auto; padding: 0 20px; }
    .resource-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 20px;
    }
    .tile-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }
    .tile-card.dragging {
      opacity: 0.5;
      transform: scale(1.05);
      z-index: 50;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    }
    .tile-image-area {
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      overflow: hidden;
      position: relative;
    }
    .tile-label {
      padding: 10px;
      text-align: center;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
    }
    .icon-btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }
    .action-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .crop-preview-container {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #e2e8f0;
      position: relative;
      background: #f8fafc;
      cursor: move;
      touch-action: none;
    }
    .drag-handle {
      position: absolute;
      top: 4px;
      left: 4px;
      padding: 4px;
      background: white;
      border-radius: 4px;
      cursor: grab;
      display: none;
      color: #94a3b8;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .is-editing .drag-handle {
      display: flex;
    }
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

const ICON_MAP: Record<string, any> = { Tent, Calendar, MapPin, Info, BookOpen, Camera, MessageSquare, Shield, Star, Globe };

const ResourceImage = ({ item }: { item: Partial<ScoutLink> }) => {
  const [error, setError] = useState(false);
  const IconComponent = item.iconName && ICON_MAP[item.iconName] ? ICON_MAP[item.iconName] : Tent;
  
  if (!item.imageUrl || error) {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-30">
        <IconComponent size="50%" />
      </div>
    );
  }
  
  return (
    <img 
      src={item.imageUrl} 
      alt="" 
      onError={() => setError(true)}
      onLoad={() => setError(false)}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translate(${item.offsetX || 0}%, ${item.offsetY || 0}%) scale(${item.zoom || 1})`,
        maxWidth: 'none',
        height: 'auto',
        width: '100%',
        objectFit: 'contain'
      }}
    />
  );
};

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [links, setLinks] = useState<ScoutLink[]>([]);
  const [settings, setSettings] = useState({
    headerTitle: 'Scout Resources',
    headerSubtitle: 'Pack & Troop Portal',
    headerLogoUrl: 'https://www.scouting.org/wp-content/uploads/2018/05/cub-scouts-logo.png',
    headerLogoZoom: 1, headerLogoOffsetX: 0, headerLogoOffsetY: 0
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [modalMode, setModalMode] = useState<'link' | 'header'>('link');
  const [formData, setFormData] = useState<Partial<ScoutLink>>({});
  
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('scout_portal_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setLinks(parsed.links || []);
      setSettings(parsed.settings || settings);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scout_portal_data', JSON.stringify({ links, settings }));
  }, [links, settings]);

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

  const openEditor = (mode: 'link' | 'header', data?: any) => {
    setModalMode(mode);
    if (mode === 'link') {
      setFormData(data || { title: '', url: '', imageUrl: '', zoom: 1, offsetX: 0, offsetY: 0, iconName: 'Tent' });
    } else {
      setFormData({ 
        title: settings.headerTitle, 
        subtitle: settings.headerSubtitle, 
        imageUrl: settings.headerLogoUrl, 
        zoom: settings.headerLogoZoom, 
        offsetX: settings.headerLogoOffsetX, 
        offsetY: settings.headerLogoOffsetY 
      } as any);
    }
    setIsModalOpen(true);
  };

  // Drag and Drop Logic
  const handleDragStart = (index: number) => {
    if (!isEditing) return;
    setDraggedItemIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newLinks = [...links];
    const draggedItem = newLinks[draggedItemIndex];
    newLinks.splice(draggedItemIndex, 1);
    newLinks.splice(index, 0, draggedItem);
    
    setDraggedItemIndex(index);
    setLinks(newLinks);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  return (
    <div className={`min-h-screen ${isEditing ? 'is-editing' : ''}`}>
      <GlobalStyles />
      
      <header className="bsa-header">
        <div className="header-container">
          <div className="flex items-center gap-4 relative">
            {isEditing && (
              <button onClick={() => openEditor('header')} className="action-badge absolute -top-2 -left-2 z-50 bg-white">
                <Edit2 size={14} className="text-blue-900" />
              </button>
            )}
            <div className="logo-box">
              <ResourceImage item={{ imageUrl: settings.headerLogoUrl, zoom: settings.headerLogoZoom, offsetX: settings.headerLogoOffsetX, offsetY: settings.headerLogoOffsetY }} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">{settings.headerTitle}</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-80">{settings.headerSubtitle}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isAdmin ? (
              <>
                <button onClick={() => setIsEditing(!isEditing)} className="icon-btn">
                  <Settings size={16} /> <span>{isEditing ? 'Finish' : 'Edit'}</span>
                </button>
                <button onClick={() => setIsAdmin(false)} className="icon-btn bg-red-600 border-none"><X size={16} /></button>
              </>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="icon-btn opacity-10 hover:opacity-100">
                <Lock size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="resource-grid">
          {links.map((link, index) => (
            <div 
              key={link.id} 
              className="relative"
              draggable={isEditing}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              {isEditing && (
                <div className="absolute -top-2 -right-2 z-10 flex flex-col gap-1">
                  <button onClick={() => openEditor('link', link)} className="action-badge bg-blue-600"><Edit2 size={12} color="white" /></button>
                  <button onClick={() => setLinks(links.filter(l => l.id !== link.id))} className="action-badge bg-red-600"><Trash2 size={12} color="white" /></button>
                </div>
              )}
              <div className="drag-handle">
                <GripVertical size={14} />
              </div>
              <a 
                href={isEditing ? undefined : link.url} 
                target="_blank" 
                rel="noreferrer" 
                className={`tile-card ${draggedItemIndex === index ? 'dragging' : ''}`}
              >
                <div className="tile-image-area">
                  <ResourceImage item={link} />
                </div>
                <div className="tile-label">{link.title}</div>
              </a>
            </div>
          ))}
          {isEditing && (
            <button onClick={() => openEditor('link')} className="tile-card border-dashed border-2 border-slate-300 bg-transparent flex flex-col items-center justify-center gap-2 text-slate-400 min-h-[140px]">
              <Plus size={24} />
              <span className="font-bold text-[10px]">ADD LINK</span>
            </button>
          )}
        </div>
      </main>

      {isLoginOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center">
            <KeyRound className="mx-auto mb-4 text-blue-900" size={40} />
            <h2 className="text-xl font-bold mb-6">Admin Login</h2>
            <input 
              type="password" 
              autoFocus 
              placeholder="Password"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 text-center"
              onKeyDown={e => {
                if (e.key === 'Enter' && password === ADMIN_PASSWORD) {
                  setIsAdmin(true); setIsEditing(true); setIsLoginOpen(false); setPassword('');
                }
              }}
            />
            <button onClick={() => {
              if (password === ADMIN_PASSWORD) {
                setIsAdmin(true); setIsEditing(true); setIsLoginOpen(false); setPassword('');
              }
            }} className="w-full bg-blue-900 text-white p-3 rounded-lg font-bold">Unlock</button>
            <button onClick={() => setIsLoginOpen(false)} className="mt-4 text-slate-400 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-900 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-widest">{modalMode === 'link' ? 'Edit Link' : 'Edit Header'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Display Name</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border-b focus:border-blue-900 outline-none mt-1" />
              </div>

              {modalMode === 'link' ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Website URL</label>
                  <input required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full p-2 border-b focus:border-blue-900 outline-none mt-1" placeholder="scouting.org" />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Subtitle</label>
                  <input value={(formData as any).subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value} as any)} className="w-full p-2 border-b focus:border-blue-900 outline-none mt-1" />
                </div>
              )}

              <div className="pt-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Icon / Image URL</label>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-2 top-2.5 text-slate-300" size={14} />
                    <input 
                      placeholder="Paste image address (jpg, png, svg)..." 
                      className="w-full pl-8 p-2 border rounded-lg text-xs"
                      value={formData.imageUrl || ''}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value, iconName: ''})}
                    />
                  </div>
                </div>

                <div 
                  className="crop-preview-container"
                  onMouseDown={e => { dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY }; }}
                  onMouseMove={e => {
                    if (!dragRef.current.isDragging) return;
                    const dx = (e.clientX - dragRef.current.startX);
                    const dy = (e.clientY - dragRef.current.startY);
                    setFormData(p => ({ ...p, offsetX: (p.offsetX || 0) + (dx / 2), offsetY: (p.offsetY || 0) + (dy / 2) }));
                    dragRef.current.startX = e.clientX;
                    dragRef.current.startY = e.clientY;
                  }}
                  onMouseUp={() => dragRef.current.isDragging = false}
                  onMouseLeave={() => dragRef.current.isDragging = false}
                >
                  <ResourceImage item={formData} />
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[8px] px-2 py-1 rounded">DRAG TO PAN</div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <ZoomIn size={14} className="text-slate-400" />
                  <input type="range" min="0.1" max="10" step="0.1" value={formData.zoom || 1} onChange={e => setFormData({...formData, zoom: parseFloat(e.target.value)})} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                </div>

                {modalMode === 'link' && !formData.imageUrl && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {Object.keys(ICON_MAP).map(name => {
                      const Icon = ICON_MAP[name];
                      return (
                        <button 
                          key={name}
                          type="button" 
                          onClick={() => setFormData({...formData, iconName: name, imageUrl: '', zoom: 1, offsetX: 0, offsetY: 0})}
                          className={`p-2 rounded border flex items-center justify-center ${formData.iconName === name ? 'border-blue-900 bg-blue-50' : 'border-slate-100'}`}
                        >
                          <Icon size={18} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-blue-900 text-white p-3 rounded-xl font-bold uppercase tracking-widest text-xs mt-4">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}