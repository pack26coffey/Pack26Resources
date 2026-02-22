import React, { useState, useEffect } from 'react';
import { Settings, Share2, Plus, Edit2, Trash2, Tent } from 'lucide-react';

// 1. Define the TypeScript structure for a Link
interface ScoutLink {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
}

const DEFAULT_LINKS: ScoutLink[] = [
  {
    id: '1',
    title: 'Scoutbook',
    url: 'https://scoutbook.scouting.org/',
    imageUrl: 'https://help.scoutbook.scouting.org/wp-content/uploads/2019/11/SB-logo-2.png'
  },
  {
    id: '2',
    title: 'Boy Scouts of America',
    url: 'https://www.scouting.org/',
    imageUrl: 'https://www.scouting.org/wp-content/themes/bsa-master/images/fleur-de-lis.png'
  }
];

// 2. Add types to Component Props
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce">
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

const TileImage = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#003F87] text-[#FDC82F]">
        <Tent size={48} strokeWidth={1.5} />
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-contain p-3 bg-white" 
      onError={() => setError(true)}
    />
  );
};

export default function App() {
  // 3. Tell the state it will hold an array of ScoutLinks
  const [links, setLinks] = useState<ScoutLink[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ScoutLink | null>(null);
  const [formData, setFormData] = useState<ScoutLink>({ id: '', title: '', url: '', imageUrl: '' });
  
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(data)));
        const restored: ScoutLink[] = decoded.map((l: any) => ({
          id: l.i, title: l.t, url: l.u, imageUrl: l.img
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

  const handleShare = () => {
    try {
      const compact = links.map(l => ({ i: l.id, t: l.title, u: l.url, img: l.imageUrl }));
      const encoded = btoa(encodeURIComponent(JSON.stringify(compact)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setToastMsg("Shareable link copied!");
    } catch (err) {
      setToastMsg("Failed to generate link.");
    }
  };

  const openAddModal = () => {
    setFormData({ id: '', title: '', url: '', imageUrl: '' });
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
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-[#003F87] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#FDC82F] p-1.5 rounded-lg text-[#003F87]">
              <Tent size={24} />
            </div>
            <h1 className="text-xl font-bold">Cub Scout Links</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#002B5C] text-sm font-medium">
              <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
            </button>
            <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isEditing ? 'bg-[#FDC82F] text-[#003F87]' : 'border border-blue-400 text-white'}`}>
              <Settings size={16} /> <span className="hidden sm:inline">{isEditing ? 'Done' : 'Edit'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {links.map((link: ScoutLink) => (
            <div key={link.id} className="relative">
              {isEditing && (
                <div className="absolute -top-2 -right-2 z-10 flex gap-1">
                  <button onClick={() => openEditModal(link)} className="bg-blue-500 text-white p-2 rounded-full shadow-lg"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(link.id)} className="bg-red-600 text-white p-2 rounded-full shadow-lg"><Trash2 size={14} /></button>
                </div>
              )}
              <a href={isEditing ? '#' : link.url} target="_blank" rel="noopener noreferrer" className="block h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="aspect-square w-full flex items-center justify-center">
                  <TileImage src={link.imageUrl} alt={link.title} />
                </div>
                <div className="p-4 text-center font-semibold text-gray-800 border-t">{link.title}</div>
              </a>
            </div>
          ))}
          {isEditing && (
            <button onClick={openAddModal} className="aspect-square flex flex-col items-center justify-center gap-2 bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600">
              <Plus size={32} /> <span>Add Link</span>
            </button>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#003F87] p-4 text-white font-bold text-lg">Manage Link</div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="border p-2 rounded w-full" />
              <input required placeholder="URL" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="border p-2 rounded w-full" />
              <input placeholder="Image URL (Optional)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="border p-2 rounded w-full" />
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2">Cancel</button>
                <button type="submit" className="bg-[#003F87] text-white px-4 py-2 rounded font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}