import React, { useState, useEffect } from 'react';
import { Settings, Share2, Plus, Edit2, Trash2, Tent, Link as LinkIcon } from 'lucide-react';

// Default starter links for a Cub Scout pack
const DEFAULT_LINKS = [
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
  },
  {
    id: '3',
    title: 'Scout Shop',
    url: 'https://www.scoutshop.org/',
    imageUrl: 'https://www.scoutshop.org/media/logo/websites/1/BSA_Scout_Shop_2-color_1.png'
  },
  {
    id: '4',
    title: 'Boys\' Life Magazine',
    url: 'https://scoutlife.org/',
    imageUrl: 'https://scoutlife.org/wp-content/uploads/2020/08/sl-logo-2020.png'
  }
];

// Custom Toast Notification Component
const Toast = ({ message, onClose }) => {
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

// Component to handle Image loading and fallback to a generic Tent icon
const TileImage = ({ src, alt }) => {
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
  const [links, setLinks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({ id: '', title: '', url: '', imageUrl: '' });
  
  const [toastMsg, setToastMsg] = useState('');

  // 1. Initialize data from URL or LocalStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    
    if (data) {
      try {
        // Decode data from the URL query parameter
        const decoded = JSON.parse(decodeURIComponent(atob(data)));
        const restored = decoded.map(l => ({
          id: l.i, title: l.t, url: l.u, imageUrl: l.img
        }));
        setLinks(restored);
        setIsDataLoaded(true);
        return;
      } catch (e) {
        console.error("Failed to parse shared link data", e);
      }
    }
    
    // Fallback to local storage or defaults
    const local = localStorage.getItem('cubScoutLinks');
    if (local) {
      setLinks(JSON.parse(local));
    } else {
      setLinks(DEFAULT_LINKS);
    }
    setIsDataLoaded(true);
  }, []);

  // 2. Save to LocalStorage on changes (as a local backup)
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('cubScoutLinks', JSON.stringify(links));
    }
  }, [links, isDataLoaded]);

  // Generate a shareable URL containing all link data
  const handleShare = () => {
    try {
      const compact = links.map(l => ({ i: l.id, t: l.title, u: l.url, img: l.imageUrl }));
      const encoded = btoa(encodeURIComponent(JSON.stringify(compact)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      
      // Copy to clipboard fallback logic for iframe/web compatibility
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (shareUrl.length > 2000) {
        setToastMsg("Link copied! (Warning: Large number of links, URL is long)");
      } else {
        setToastMsg("Shareable Pack link copied to clipboard!");
      }
    } catch (err) {
      setToastMsg("Failed to generate share link.");
    }
  };

  const openAddModal = () => {
    setFormData({ id: '', title: '', url: '', imageUrl: '' });
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const openEditModal = (link) => {
    setFormData(link);
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Ensure URL has http/https
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
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <header className="bg-[#003F87] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#FDC82F] p-1.5 rounded-lg text-[#003F87]">
              <Tent size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-wide">Cub Scout Links</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={handleShare} 
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-[#002B5C] hover:bg-[#001A38] border border-blue-800 text-sm font-medium transition-colors"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditing 
                  ? 'bg-[#FDC82F] text-[#003F87] shadow-sm' 
                  : 'bg-transparent border border-blue-400 hover:bg-blue-800 text-white'
              }`}
            >
              <Settings size={16} />
              <span className="hidden sm:inline">{isEditing ? 'Done Editing' : 'Edit Links'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        
        {links.length === 0 && !isEditing && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Tent size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Links Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto">Click "Edit Links" in the top right to start adding helpful resources for your Pack or Den.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          
          {links.map(link => (
            <div key={link.id} className="relative group">
              {/* Edit Mode Overlay Badges */}
              {isEditing && (
                <div className="absolute -top-3 -right-3 z-10 flex gap-1">
                  <button onClick={() => openEditModal(link)} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-transform hover:scale-110">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(link.id)} className="bg-[#CE1126] text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {/* Link Tile */}
              <a 
                href={isEditing ? '#' : link.url} 
                target={isEditing ? '_self' : '_blank'} 
                rel="noopener noreferrer"
                onClick={(e) => isEditing && e.preventDefault()}
                className={`block h-full bg-white rounded-2xl border ${isEditing ? 'border-dashed border-blue-300 ring-2 ring-blue-50 cursor-default' : 'border-gray-200 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1'} transition-all duration-200 overflow-hidden flex flex-col`}
              >
                <div className="aspect-square w-full bg-slate-50 border-b border-gray-100 flex items-center justify-center overflow-hidden">
                  <TileImage src={link.imageUrl} alt={link.title} />
                </div>
                <div className="p-3 sm:p-4 flex-grow flex items-center justify-center bg-white">
                  <span className="font-semibold text-gray-800 text-sm sm:text-base text-center line-clamp-2 leading-tight">
                    {link.title}
                  </span>
                </div>
              </a>
            </div>
          ))}

          {/* Add New Tile Button (Only visible in edit mode) */}
          {isEditing && (
            <button 
              onClick={openAddModal}
              className="aspect-square sm:aspect-auto sm:h-full min-h-[160px] flex flex-col items-center justify-center gap-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 hover:bg-blue-100 hover:border-blue-400 transition-all group"
            >
              <div className="bg-blue-200 p-3 rounded-full group-hover:scale-110 transition-transform">
                <Plus size={28} />
              </div>
              <span className="font-bold">Add Link</span>
            </button>
          )}

        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#003F87] px-6 py-4 flex items-center gap-3">
              <LinkIcon className="text-[#FDC82F]" size={24} />
              <h2 className="text-xl font-bold text-white">{editingLink ? 'Edit Link' : 'Add New Link'}</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title / Name *</label>
                <input 
                  required 
                  type="text"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003F87] focus:border-[#003F87] outline-none transition-shadow" 
                  placeholder="e.g. Scoutbook" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Web Address (URL) *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.url} 
                  onChange={e => setFormData({...formData, url: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003F87] focus:border-[#003F87] outline-none transition-shadow" 
                  placeholder="www.scouting.org" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Icon Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003F87] focus:border-[#003F87] outline-none transition-shadow" 
                  placeholder="https://example.com/logo.png" 
                />
                <p className="text-xs text-gray-500 mt-2">Leave blank to use the default Scout Tent icon.</p>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!formData.title.trim() || !formData.url.trim()} 
                  className="px-6 py-2.5 rounded-lg bg-[#003F87] text-white font-semibold hover:bg-[#002B5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {editingLink ? 'Save Changes' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications */}
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}