<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scout Links Professional</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root {
            --bsa-blue: #003F87;
            --bsa-gold: #FDC82F;
        }
        body { font-family: 'Inter', sans-serif; transition: background-color 0.3s; }
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
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
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .dark .scout-card { background: #1e293b; border-color: rgba(255,255,255,0.05); color: white; }
        .scout-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
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
        .admin-controls { position: absolute; top: 0.75rem; right: 0.75rem; display: flex; gap: 0.5rem; z-index: 20; }
        [v-cloak] { display: none; }
    </style>
</head>
<body class="bg-slate-50 dark:bg-slate-950 min-h-screen">

    <div id="app" class="v-cloak">
        <!-- Header -->
        <header class="bg-white dark:bg-slate-900 border-b-8 border-yellow-400 shadow-xl px-6 py-12 relative overflow-hidden">
            <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div class="relative">
                    <div class="w-40 h-40 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 shadow-inner flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700">
                        <img :src="settings.headerLogoUrl" :style="getLogoStyle()" class="max-w-none h-full object-contain">
                    </div>
                    <button v-if="isEditing" @click="openHeaderModal" class="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
                        <i data-lucide="edit-2"></i>
                    </button>
                </div>

                <div class="text-center md:text-left flex-1">
                    <h1 class="text-5xl md:text-7xl font-black text-[#003F87] dark:text-blue-400 uppercase tracking-tighter mb-2 leading-none">
                        {{ settings.headerTitle }}
                    </h1>
                    <div class="text-xl font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-3">
                        <i data-lucide="star" class="text-yellow-500 fill-yellow-500 w-5 h-5"></i>
                        {{ settings.headerSubtitle }}
                    </div>
                </div>

                <div class="flex gap-4">
                    <button @click="toggleDarkMode" class="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-yellow-400 transition-all">
                        <i :data-lucide="darkMode ? 'sun' : 'moon'"></i>
                    </button>
                    <button v-if="isAdmin" @click="isEditing = !isEditing" 
                        :class="['flex items-center gap-3 px-8 py-5 rounded-3xl font-black uppercase tracking-widest transition-all shadow-md', isEditing ? 'bg-yellow-400 text-blue-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700']">
                        <i data-lucide="settings"></i>
                        <span>{{ isEditing ? 'Done' : 'Edit' }}</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-16 px-6">
            <div class="bento-grid">
                <div v-for="link in links" :key="link.id" class="relative">
                    <div v-if="isEditing" class="admin-controls">
                        <button @click="editLink(link)" class="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                        <button @click="deleteLink(link.id)" class="p-2 bg-red-600 text-white rounded-xl shadow-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    <a :href="isEditing ? 'javascript:void(0)' : link.url" target="_blank" class="scout-card">
                        <div class="image-container">
                            <img v-if="link.imageUrl" :src="link.imageUrl" :style="getLinkStyle(link)" class="max-w-none h-full object-contain">
                            <i v-else :data-lucide="link.iconName || 'tent'" class="w-20 h-20 text-blue-900/10 dark:text-white/10"></i>
                        </div>
                        <div class="font-black text-blue-900 dark:text-slate-300 uppercase text-sm tracking-wider">{{ link.title }}</div>
                    </a>
                </div>

                <button v-if="isEditing" @click="addNewLink" 
                    class="scout-card border-dashed border-4 border-slate-200 dark:border-slate-800 bg-transparent shadow-none opacity-40 hover:opacity-100 hover:border-blue-500">
                    <i data-lucide="plus" class="w-16 h-16 text-slate-400 mb-2"></i>
                    <div class="font-black text-slate-400 uppercase text-xs tracking-widest">Add New</div>
                </button>
            </div>
        </main>

        <!-- Login / Admin Modal -->
        <div v-if="showLogin" class="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <div class="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] w-full max-w-sm shadow-2xl">
                <h2 class="text-3xl font-black text-center mb-10 uppercase">Leader Login</h2>
                <input type="password" v-model="password" @keyup.enter="doLogin" placeholder="Password" class="w-full p-6 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-900 outline-none font-bold text-center mb-6">
                <div class="flex gap-4">
                    <button @click="showLogin = false" class="flex-1 font-bold text-slate-400">Cancel</button>
                    <button @click="doLogin" class="flex-2 p-5 bg-[#003F87] text-white font-black rounded-2xl w-full">Enter</button>
                </div>
            </div>
        </div>

        <!-- Lock Button -->
        <div class="fixed bottom-10 right-10 z-[50]">
            <button @click="isAdmin ? (isAdmin = false, isEditing = false) : showLogin = true" 
                class="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all hover:rotate-6"
                :class="isAdmin ? 'bg-yellow-400' : 'bg-[#003F87] text-white'">
                <i :data-lucide="isAdmin ? 'eye' : 'lock'" class="w-8 h-8"></i>
            </button>
        </div>

        <!-- Link Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
            <div class="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl">
                <div class="bg-[#003F87] p-8 text-white flex justify-between items-center">
                    <h3 class="text-xl font-black uppercase tracking-widest">Edit Resource</h3>
                    <button @click="showModal = false"><i data-lucide="x"></i></button>
                </div>
                <div class="p-10 space-y-6 overflow-y-auto max-h-[70vh]">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-4">
                            <div>
                                <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block">Title</label>
                                <input v-model="activeItem.title" class="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">
                            </div>
                            <div v-if="modalMode === 'link'">
                                <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block">URL</label>
                                <input v-model="activeItem.url" class="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            </div>
                            <div v-else>
                                <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block">Subtitle</label>
                                <input v-model="activeItem.subtitle" class="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block">Image URL</label>
                                <input v-model="activeItem.imageUrl" class="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                            </div>
                        </div>
                        <div class="flex flex-col items-center">
                            <div class="w-40 h-40 bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden relative border-4 border-[#003F87] shadow-inner mb-4">
                                <img :src="activeItem.imageUrl" :style="getPreviewStyle()" class="max-w-none h-full object-contain">
                            </div>
                            <label class="text-[10px] font-black text-slate-400 uppercase mb-2">Zoom: {{ activeItem.zoom }}x</label>
                            <input type="range" min="0.5" max="4" step="0.1" v-model="activeItem.zoom" class="w-full">
                        </div>
                    </div>
                    <div class="flex gap-4 pt-6">
                        <button @click="showModal = false" class="flex-1 font-black text-slate-400 uppercase">Discard</button>
                        <button @click="saveModalData" class="flex-[2] p-5 bg-[#003F87] text-white rounded-2xl font-black uppercase">Save Change</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="toast" class="fixed top-6 left-1/2 -translate-x-1/2 bg-[#003F87] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm z-[1000] shadow-2xl">
            {{ toast }}
        </div>
    </div>

    <!-- Firebase & Vue -->
    <script type="module">
        import { createApp } from 'https://unpkg.com/vue@3/dist/vue.global.js';
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
        import { getFirestore, doc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

        // Safe access to globals
        const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'scout-links-v1';
        const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
        const token = window.__initial_auth_token;

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        createApp({
            data() {
                return {
                    isAdmin: false,
                    isEditing: false,
                    showLogin: false,
                    showModal: false,
                    modalMode: 'link',
                    password: '',
                    darkMode: false,
                    toast: '',
                    links: [],
                    settings: {
                        headerTitle: 'Scout Resources',
                        headerSubtitle: 'Pack 505 • Troop 101',
                        headerLogoUrl: 'https://www.scouting.org/wp-content/uploads/2018/05/cub-scouts-logo.png',
                        headerLogoZoom: 1, headerLogoOffsetX: 0, headerLogoOffsetY: 0
                    },
                    activeItem: {}
                }
            },
            async mounted() {
                // Auth first
                if (token) await signInWithCustomToken(auth, token);
                else await signInAnonymously(auth);

                onAuthStateChanged(auth, (user) => {
                    if (user) this.loadData();
                });

                this.$nextTick(() => lucide.createIcons());
            },
            methods: {
                loadData() {
                    // Correct Path Rule: /artifacts/{appId}/public/data/config
                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config');
                    onSnapshot(docRef, (snap) => {
                        if (snap.exists()) {
                            const data = snap.data();
                            this.links = data.links || [];
                            this.settings = data.settings || this.settings;
                            this.$nextTick(() => lucide.createIcons());
                        }
                    }, (err) => console.error("Firestore Error:", err));
                },
                async saveData() {
                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config');
                    await setDoc(docRef, {
                        links: this.links,
                        settings: this.settings,
                        lastUpdate: Date.now()
                    });
                    this.showToast('Cloud Updated');
                },
                doLogin() {
                    if (this.password === 'scout123') {
                        this.isAdmin = true;
                        this.isEditing = true;
                        this.showLogin = false;
                        this.password = '';
                    }
                },
                toggleDarkMode() {
                    this.darkMode = !this.darkMode;
                    document.documentElement.classList.toggle('dark');
                    this.$nextTick(() => lucide.createIcons());
                },
                getLogoStyle() {
                    return `transform: scale(${this.settings.headerLogoZoom}) translate(${this.settings.headerLogoOffsetX}%, ${this.settings.headerLogoOffsetY}%)`;
                },
                getLinkStyle(link) {
                    return `transform: scale(${link.zoom || 1}) translate(${link.offsetX || 0}%, ${link.offsetY || 0}%)`;
                },
                getPreviewStyle() {
                    return `transform: scale(${this.activeItem.zoom || 1}) translate(${this.activeItem.offsetX || 0}%, ${this.activeItem.offsetY || 0}%)`;
                },
                addNewLink() {
                    this.modalMode = 'link';
                    this.activeItem = { id: Date.now().toString(), title: 'New Site', url: 'https://', imageUrl: '', zoom: 1, offsetX: 0, offsetY: 0 };
                    this.showModal = true;
                },
                editLink(link) {
                    this.modalMode = 'link';
                    this.activeItem = { ...link };
                    this.showModal = true;
                },
                openHeaderModal() {
                    this.modalMode = 'header';
                    this.activeItem = { 
                        title: this.settings.headerTitle, 
                        subtitle: this.settings.headerSubtitle, 
                        imageUrl: this.settings.headerLogoUrl, 
                        zoom: this.settings.headerLogoZoom,
                        offsetX: this.settings.headerLogoOffsetX,
                        offsetY: this.settings.headerLogoOffsetY
                    };
                    this.showModal = true;
                },
                saveModalData() {
                    if (this.modalMode === 'link') {
                        const index = this.links.findIndex(l => l.id === this.activeItem.id);
                        if (index > -1) this.links[index] = { ...this.activeItem };
                        else this.links.push({ ...this.activeItem });
                    } else {
                        this.settings.headerTitle = this.activeItem.title;
                        this.settings.headerSubtitle = this.activeItem.subtitle;
                        this.settings.headerLogoUrl = this.activeItem.imageUrl;
                        this.settings.headerLogoZoom = this.activeItem.zoom;
                    }
                    this.saveData();
                    this.showModal = false;
                },
                deleteLink(id) {
                    this.links = this.links.filter(l => l.id !== id);
                    this.saveData();
                },
                showToast(msg) {
                    this.toast = msg;
                    setTimeout(() => this.toast = '', 2000);
                }
            }
        }).mount('#app');
    </script>
</body>
</html>