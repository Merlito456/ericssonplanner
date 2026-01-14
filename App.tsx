
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
  LayoutDashboard, Map as MapIcon, Database, Activity, AlertTriangle, 
  CheckCircle2, ChevronRight, Search, Download, Box, BrainCircuit, 
  Terminal, X, Calendar, PlayCircle, Clock, ListTodo, TrendingUp, 
  Zap, Loader2, CheckCircle, FileText, Plus, Trash2, Edit2, Save, 
  History, MessageSquare, Radio, Server, ShieldCheck, RefreshCw, LogOut, Lock, User as UserIcon,
  MapPin, Navigation, Info, Wifi, WifiOff, ExternalLink, Key
} from 'lucide-react';
import { Site, SiteStatus, Vendor, DeploymentTask, Equipment, User, UserRole } from './types.ts';
import SiteMap from './components/SiteMap.tsx';
import { geminiService } from './services/gemini.ts';
import { dbService } from './services/db.ts';

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#94a3b8'];

const DEFAULT_TASKS: DeploymentTask[] = [
  { id: '1', label: 'Site Survey & Pre-checks', isCompleted: true, assignedRole: 'Surveyor' },
  { id: '2', label: 'Equipment De-staging', isCompleted: false, assignedRole: 'Field Tech' },
  { id: '3', label: 'Ericsson Module Installation', isCompleted: false, assignedRole: 'Field Tech' },
  { id: '4', label: 'Fiber Re-patching', isCompleted: false, assignedRole: 'Rigger' },
  { id: '5', label: 'Integration & Testing', isCompleted: false, assignedRole: 'Core Engineer' },
  { id: '6', label: 'Acceptance Sign-off', isCompleted: false, assignedRole: 'Team Lead' },
];

const NavItem: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({active, onClick, icon, label}) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>{icon}<span className="text-xs font-bold uppercase tracking-widest">{label}</span></button>
);

const StatusCard: React.FC<{icon: React.ReactNode, label: string, value: string, sub: string}> = ({icon, label, value, sub}) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"><div className="flex justify-between items-start mb-6"><div className="p-3 bg-slate-50 rounded-2xl">{icon}</div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span></div><h3 className="text-4xl font-black text-slate-900">{value}</h3><div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub}</div></div>
);

const AuthPage: React.FC<{onAuth: (user: User) => void}> = ({onAuth}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const user = await dbService.login(email, password);
        onAuth(user);
      } else {
        const user = await dbService.register(name, email, password);
        onAuth(user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-['Inter'] overflow-hidden">
      <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center p-20">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center"></div>
         <div className="relative z-10 text-white max-w-lg">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-4xl font-black mb-10 shadow-2xl">E</div>
           <h1 className="text-6xl font-black leading-tight mb-6">Nationwide Network Swap.</h1>
           <p className="text-slate-400 text-xl leading-relaxed">Precision project management for the Ericsson-Globe infrastructure modernization initiative.</p>
         </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-10 bg-slate-50">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right duration-700">
           <div className="mb-10 text-center lg:text-left">
             <h2 className="text-3xl font-black text-slate-900">{isLogin ? 'Sign In' : 'Register'}</h2>
             <p className="text-slate-500 mt-2">Enterprise Telemetry Access</p>
           </div>
           <form onSubmit={handleSubmit} className="space-y-6">
             {!isLogin && (
               <div><label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Full Name</label>
               <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" placeholder="Field Engineer"/></div>
             )}
             <div><label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Enterprise Email</label>
             <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" placeholder="user@ericsson.com"/></div>
             <div><label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Password</label>
             <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" placeholder="••••••••"/></div>
             {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2"><AlertTriangle size={14}/> {error}</div>}
             <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all">
               {loading ? <Loader2 className="animate-spin" size={20}/> : <><Lock size={18}/> {isLogin ? 'Enter Planner' : 'Register Account'}</>}
             </button>
           </form>
           <button onClick={() => setIsLogin(!isLogin)} className="mt-8 w-full text-slate-500 text-sm font-bold hover:text-blue-600 transition-colors">
             {isLogin ? "Need an account? Contact Team Lead" : "Back to Login"}
           </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'sites' | 'plan' | 'actual' | 'map' | 'ai'>('monitoring');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [formData, setFormData] = useState<Partial<Site>>({});
  
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);
  const [isDBOperation, setIsDBOperation] = useState(false);

  // Dynamic AI Configuration State
  const [isAiConfigured, setIsAiConfigured] = useState(!!process.env.API_KEY);

  useEffect(() => {
    const init = async () => {
      try {
        const user = dbService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const data = await dbService.getSites();
          setSites(data);
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();

    // Poll for API key presence if not initially found
    const keyCheckInterval = setInterval(async () => {
      const hasKey = !!process.env.API_KEY || (typeof window !== 'undefined' && (window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey());
      setIsAiConfigured(!!hasKey);
    }, 2000);

    return () => clearInterval(keyCheckInterval);
  }, []);

  const handleOpenAiKeySelector = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        // Race condition mitigation: assume success and update state
        setIsAiConfigured(true);
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    }
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleLogout = () => {
    dbService.logout();
    setCurrentUser(null);
    setSites([]);
  };

  const stats = useMemo(() => {
    const total = sites.length;
    const completed = sites.filter(s => s.status === SiteStatus.COMPLETED).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const highRisk = sites.filter(s => s.riskLevel === 'High').length;
    const inProgress = sites.filter(s => s.status === SiteStatus.IN_PROGRESS).length;
    return { total, completed, progress, highRisk, inProgress };
  }, [sites]);

  const monitoringData = useMemo(() => [
    { day: 'Mon', target: 2, actual: sites.length > 0 ? Math.floor(stats.completed * 0.1) : 0 },
    { day: 'Tue', target: 2, actual: sites.length > 0 ? Math.floor(stats.completed * 0.2) : 0 },
    { day: 'Wed', target: 3, actual: sites.length > 0 ? Math.floor(stats.completed * 0.4) : 0 },
    { day: 'Thu', target: 3, actual: sites.length > 0 ? Math.floor(stats.completed * 0.7) : 0 },
    { day: 'Fri', target: 2, actual: stats.completed },
  ], [stats.completed, sites.length]);

  const filteredSites = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sites.filter(site => 
      site.id.toLowerCase().includes(q) ||
      site.name.toLowerCase().includes(q) ||
      site.region.toLowerCase().includes(q) ||
      site.currentVendor.toLowerCase().includes(q) ||
      site.status.toLowerCase().includes(q)
    );
  }, [sites, searchQuery]);

  const handleRunAiAnalysis = async () => {
    if (!isAdmin) return;
    setLoadingAi(true);
    setAiError(null);
    try {
      const result = await geminiService.analyzeProjectStatus(sites);
      setAiAnalysis(result);
      setActiveTab('ai');
    } catch (error: any) {
      if (error.message.includes("entity was not found") || error.message.includes("missing")) {
        setAiError("API connection lost. Please re-connect AI using the sidebar.");
      } else {
        setAiError(error.message);
      }
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAutoSchedule = async () => {
    if (!isAdmin) return;
    setScheduling(true);
    setAiError(null);
    try {
      const schedule = await geminiService.generateDeploymentSchedule(sites);
      const updatedSites = sites.map(s => {
        const item = schedule.find((sch: any) => sch.siteId === s.id);
        if (item) return { ...s, scheduledDate: item.scheduledDate, status: SiteStatus.PLANNED };
        return s;
      });
      for (const site of updatedSites) await dbService.upsertSite(site);
      setSites(updatedSites);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleGenerateWorkflow = async (site: Site) => {
    if (!isAdmin) return;
    setLoadingWorkflow(true);
    setIsDBOperation(true);
    setAiError(null);
    try {
      const plan = await geminiService.getSwapPlan(site);
      const technicalInstructions = { 
        steps: plan.steps || [], 
        alerts: plan.criticalAlerts || [],
        generatedAt: new Date().toISOString()
      };
      const updatedSite = { ...site, technicalInstructions };
      await dbService.upsertSite(updatedSite);
      setSites(prev => prev.map(s => s.id === site.id ? updatedSite : s));
      setSelectedSite(updatedSite);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setLoadingWorkflow(false);
      setIsDBOperation(false);
    }
  };

  const handleTaskToggle = async (siteId: string, taskId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;
    const newTasks = site.tasks?.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
    const completedCount = newTasks?.filter(t => t.isCompleted).length || 0;
    const progress = Math.round((completedCount / (newTasks?.length || 1)) * 100);
    let newStatus = site.status;
    if (progress === 100) newStatus = SiteStatus.COMPLETED;
    else if (progress > 0) newStatus = SiteStatus.IN_PROGRESS;
    const updatedSite = { ...site, tasks: newTasks, progress, status: newStatus };
    setIsDBOperation(true);
    try {
      await dbService.upsertSite(updatedSite);
      setSites(prev => prev.map(s => s.id === siteId ? updatedSite : s));
    } finally {
      setIsDBOperation(false);
    }
  };

  const handleSaveSite = async () => {
    if (!isAdmin) return;
    if (!formData.id || !formData.name) return alert("Site ID/Name required.");
    setIsDBOperation(true);
    try {
      const siteToSave = { 
        ...formData, 
        lastUpdate: new Date().toISOString().split('T')[0],
        progress: formData.progress ?? 0,
        tasks: formData.tasks ?? DEFAULT_TASKS
      } as Site;
      await dbService.upsertSite(siteToSave);
      if (modalMode === 'create') setSites(prev => [...prev, siteToSave]);
      else setSites(prev => prev.map(s => s.id === siteToSave.id ? siteToSave : s));
      setSelectedSite(null);
    } finally {
      setIsDBOperation(false);
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Purge site from telemetry?')) {
      setIsDBOperation(true);
      try {
        await dbService.deleteSite(id);
        setSites(prev => prev.filter(s => s.id !== id));
        setSelectedSite(null);
      } finally {
        setIsDBOperation(false);
      }
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!currentUser) return <AuthPage onAuth={u => { setCurrentUser(u); dbService.getSites().then(setSites); }} />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-['Inter']">
      {/* GLOBAL AI ERROR OVERLAY */}
      {aiError && (
        <div className="fixed bottom-10 right-10 z-[200] w-96 bg-white border border-red-100 rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-red-50 p-2 rounded-xl text-red-500 shrink-0"><AlertTriangle size={24}/></div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-1">AI Logic Fault</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{aiError}</p>
              <div className="flex gap-4">
                 <button onClick={() => { setAiError(null); handleOpenAiKeySelector(); }} className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline flex items-center gap-1"><RefreshCw size={12}/> Re-connect AI</button>
                 <button onClick={() => setAiError(null)} className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:underline">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg">E</div>
          <div>
            <h1 className="text-white font-bold leading-none text-sm uppercase tracking-tighter">Ericsson Globe</h1>
            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Swap Planner</p>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <NavItem active={activeTab === 'sites'} onClick={() => setActiveTab('sites')} icon={<Database size={18}/>} label="Inventory" />
          <NavItem active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<Calendar size={18}/>} label="Planning" />
          <NavItem active={activeTab === 'actual'} onClick={() => setActiveTab('actual')} icon={<PlayCircle size={18}/>} label="Field Ops" />
          <NavItem active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon size={18}/>} label="Deployment Map" />
          {isAdmin && <NavItem active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<BrainCircuit size={18}/>} label="AI Strategy" />}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          {/* DYNAMIC SYSTEM INTELLIGENCE STATUS */}
          <button 
            onClick={handleOpenAiKeySelector}
            className={`w-full px-4 py-3 rounded-xl border transition-all text-left group ${isAiConfigured ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'}`}
          >
            <div className="flex items-center gap-3">
              {isAiConfigured ? (
                <div className="relative">
                  <Wifi className="text-emerald-400" size={14}/>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                </div>
              ) : (
                <WifiOff className="text-red-400" size={14}/>
              )}
              <div>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isAiConfigured ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isAiConfigured ? 'AI Core: Active' : 'AI Core: Offline'}
                </p>
                <p className="text-[8px] text-slate-500 mt-0.5 group-hover:text-slate-300 transition-colors">
                  {isAiConfigured ? 'Cluster Synchronized' : 'Tap to Add Environment'}
                </p>
              </div>
            </div>
            {!isAiConfigured && (
               <div className="mt-2 pt-2 border-t border-red-500/10 flex items-center justify-between">
                  <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Connect API</span>
                  <ExternalLink size={10} className="text-red-400"/>
               </div>
            )}
          </button>

          <div className="px-4 py-3 bg-slate-800/40 rounded-xl flex items-center gap-3">
             <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-black">{currentUser.role[0]}</div>
             <span className="text-[10px] font-bold text-white truncate">{currentUser.name}</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"><LogOut size={14}/> Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search telemetry..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
             {!isAiConfigured && (
               <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                 <Info size={14}/> Billing Docs
               </a>
             )}
             {isAdmin && <button onClick={async () => { if(window.confirm('Purge local cache?')) { await dbService.clearDatabase(); setSites([]); } }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><RefreshCw size={18}/></button>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#fdfdfd]">
          {!isAiConfigured && activeTab === 'ai' && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-700">
               <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                 <Key size={48} className="animate-pulse"/>
               </div>
               <div className="max-w-md">
                 <h2 className="text-2xl font-black text-slate-900 mb-2">AI Configuration Required</h2>
                 <p className="text-slate-500 text-sm leading-relaxed mb-8">The Infrastructure Strategist requires a valid Gemini API Key to process nationwide swap telemetry. Please select or add your key to proceed.</p>
                 <button 
                  onClick={handleOpenAiKeySelector}
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                 >
                   <Wifi size={20}/> Connect Cloud Intelligence
                 </button>
                 <div className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-4">
                    <span className="flex items-center gap-1"><ShieldCheck size={12}/> Secure Handshake</span>
                    <span className="flex items-center gap-1"><Radio size={12}/> Cloudflare Integrated</span>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div><h2 className="text-2xl font-bold text-slate-900">Project Overview</h2><p className="text-slate-500 text-sm mt-1">Real-time nationwide synchronization</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusCard icon={<Activity className="text-blue-500" />} label="Overall Sync" value={`${stats.progress.toFixed(1)}%`} sub="Telemetry" />
                <StatusCard icon={<CheckCircle2 className="text-emerald-500" />} label="Swapped" value={stats.completed.toString()} sub={`${stats.total - stats.completed} pending`} />
                <StatusCard icon={<Clock className="text-amber-500" />} label="In-Field" value={stats.inProgress.toString()} sub="Active Ops" />
                <StatusCard icon={<AlertTriangle className="text-red-500" />} label="High Risk" value={stats.highRisk.toString()} sub="Site Blocks" />
              </div>
              
              {sites.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                  <Database className="text-slate-300 mx-auto mb-6" size={48} />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No Site Data</h3>
                  <button onClick={() => setActiveTab('sites')} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold mt-6 shadow-lg shadow-blue-500/20 transition-transform active:scale-95">Go to Inventory</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-6">Execution Velocity</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monitoringData}>
                        <defs><linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTarget)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6">Site Distribution</h3>
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[
                            { name: 'Done', value: stats.completed },
                            { name: 'Live', value: stats.inProgress },
                            { name: 'Risk', value: stats.highRisk },
                            { name: 'Plan', value: stats.total - stats.completed - stats.inProgress - stats.highRisk },
                          ].filter(d => d.value > 0)} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {COLORS.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sites' && (
            <div className="animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-8">
                  <div><h2 className="text-2xl font-bold text-slate-900">Infrastructure Inventory</h2><p className="text-slate-500 text-sm mt-1">Nodal database management</p></div>
                  <div className="flex gap-3">
                    {isAdmin && <button onClick={() => { setModalMode('create'); setFormData({id: `E-${Math.floor(1000 + Math.random() * 9000)}`, name: '', region: 'NCR', currentVendor: Vendor.HUAWEI, status: SiteStatus.PENDING, coordinates: {lat: 14.59, lng: 120.98}, tasks: DEFAULT_TASKS.map(t=>({...t, isCompleted: false}))}); setSelectedSite({} as Site); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg font-bold text-sm transition-all active:scale-95"><Plus size={18}/> New Site</button>}
                  </div>
               </div>
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Site ID</th><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Region</th><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor</th><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sync</th><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {filteredSites.map(site => (
                       <tr key={site.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => { setSelectedSite(site); setModalMode('view'); }}>
                         <td className="px-6 py-4 font-bold text-slate-900">{site.id}</td>
                         <td className="px-6 py-4 text-slate-700 text-sm font-medium">{site.name}</td>
                         <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-tighter">{site.region}</td>
                         <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-black border ${site.currentVendor === Vendor.HUAWEI ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{site.currentVendor}</span></td>
                         <td className="px-6 py-4"><div className="w-16 bg-slate-100 h-1 rounded-full"><div className="bg-blue-600 h-full" style={{width: `${site.progress || 0}%`}}></div></div></td>
                         <td className="px-6 py-4 flex gap-2">
                           <button onClick={e => { e.stopPropagation(); setModalMode('edit'); setFormData(site); setSelectedSite(site); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors hover:text-blue-500"><Edit2 size={16}/></button>
                           {isAdmin && <button onClick={e => { e.stopPropagation(); handleDeleteSite(site.id); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-8">
                  <div><h2 className="text-2xl font-bold text-slate-900">Batch Planning</h2><p className="text-slate-500 text-sm mt-1">Gemini AI Optimized Scheduling</p></div>
                  {isAdmin && <button onClick={handleAutoSchedule} disabled={scheduling || !isAiConfigured} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50">{scheduling ? <Loader2 className="animate-spin" size={18}/> : <Calendar size={18}/>} AI Scheduler</button>}
               </div>
               <div className="space-y-4">
                 {sites.filter(s => s.status !== SiteStatus.COMPLETED).length === 0 ? (
                    <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                       <Calendar className="text-slate-200 mx-auto mb-4" size={48} />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No sites pending scheduling.</p>
                    </div>
                 ) : (
                   sites.filter(s => s.status !== SiteStatus.COMPLETED).map(site => (
                    <div key={site.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-blue-500 transition-all cursor-pointer" onClick={() => { setSelectedSite(site); setModalMode('view'); }}>
                      <div className="flex items-center gap-6"><div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">{site.id.slice(0,3)}</div><div><h4 className="font-bold text-slate-900">{site.name}</h4><div className="text-[10px] text-slate-400 font-bold uppercase">{site.id} • {site.region}</div></div></div>
                      <div className="flex items-center gap-8"><div className="text-right"><div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Target</div><div className="text-sm font-bold text-slate-700">{site.scheduledDate || 'TBD'}</div></div><button className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={18}/></button></div>
                    </div>
                   ))
                 )}
               </div>
            </div>
          )}

          {activeTab === 'actual' && (
            <div className="animate-in fade-in duration-500">
               <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900">Field Handover</h2><p className="text-slate-500 text-sm mt-1">Live procedure tracking</p></div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {sites.filter(s => s.status === SiteStatus.IN_PROGRESS).length === 0 ? (
                    <div className="lg:col-span-2 p-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                       <PlayCircle className="text-slate-200 mx-auto mb-4" size={48} />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active field operations.</p>
                    </div>
                  ) : (
                    sites.filter(s => s.status === SiteStatus.IN_PROGRESS).map(site => (
                      <div key={site.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden relative shadow-sm transition-all hover:shadow-md">
                        {isDBOperation && <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10"><Loader2 className="animate-spin text-blue-600" /></div>}
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center"><div><div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{site.id}</div><h3 className="text-xl font-bold mt-1">{site.name}</h3></div><div className="text-3xl font-black text-blue-500">{site.progress}%</div></div>
                        <div className="p-6 space-y-3">
                           {site.tasks?.map(task => (
                             <div key={task.id} onClick={() => handleTaskToggle(site.id, task.id)} className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer border transition-colors ${task.isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}>
                               <div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>{task.isCompleted && <CheckCircle size={14}/>}</div><span className={`text-sm font-medium ${task.isCompleted ? 'line-through opacity-60' : ''}`}>{task.label}</span></div>
                               <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-slate-200 text-slate-500">{task.assignedRole}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          )}

          {activeTab === 'map' && <SiteMap sites={sites} onSiteClick={s => { setSelectedSite(s); setModalMode('view'); }} />}

          {activeTab === 'ai' && isAdmin && isAiConfigured && (
            <div className="animate-in slide-in-from-right-4 duration-500">
               <div className="mb-8 flex items-center justify-between">
                  <div><h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><BrainCircuit className="text-blue-600" size={28} /> Project Strategist</h2><p className="text-slate-500 text-sm mt-1">Cognitive analysis of nationwide swap telemetry</p></div>
                  <button onClick={handleRunAiAnalysis} disabled={loadingAi} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50">{loadingAi ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} />} Synthesize</button>
               </div>
               
               {loadingAi && (
                 <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-6" size={48} />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Engaging Core Cluster</h3>
                    <p className="text-sm text-slate-500">Processing hardware dependencies and regional risk factors...</p>
                 </div>
               )}

               {aiAnalysis && !loadingAi && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                      <h4 className="font-bold text-lg text-blue-400 mb-6 flex items-center gap-2"><Terminal size={20}/> Insights</h4>
                      <ul className="space-y-6">
                        {aiAnalysis.strategicInsights.map((insight: string, idx: number) => (
                          <li key={idx} className="flex gap-4"><div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500"></div><p className="text-slate-300 text-sm leading-relaxed">{insight}</p></li>
                        ))}
                      </ul>
                      <div className="mt-10 pt-8 border-t border-white/10">
                         <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Risk Management</h5>
                         <div className="space-y-3">
                           {aiAnalysis.riskMitigation?.map((risk: string, i: number) => (
                             <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-xs text-slate-400 border border-white/5"><Info size={14} className="text-amber-500"/> {risk}</div>
                           ))}
                         </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white flex flex-col items-center justify-center text-center shadow-2xl">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Swap Health Index</div>
                      <div className="text-8xl font-black mb-4 tracking-tighter">{aiAnalysis.projectHealth}</div>
                      <div className="w-full max-w-xs bg-white/20 h-3 rounded-full overflow-hidden">
                        <div className="bg-white h-full transition-all duration-1000" style={{width: aiAnalysis.projectHealth}}></div>
                      </div>
                      <p className="mt-6 text-[10px] font-black uppercase text-blue-100 tracking-[0.3em]">Telemetry Verified</p>
                    </div>
                 </div>
               )}
               {!aiAnalysis && !loadingAi && (
                 <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                    <Radio className="text-slate-200 mx-auto mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active strategy report generated.</p>
                 </div>
               )}
            </div>
          )}
        </div>

        {selectedSite && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedSite(null)}></div>
            <div className="w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto relative z-10 p-10">
              {(isDBOperation || loadingWorkflow) && (
                <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center z-20">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{loadingWorkflow ? 'AI Generating Procedure...' : 'Syncing Data...'}</span>
                </div>
              )}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    {modalMode === 'create' ? 'SITE ONBOARDING' : modalMode === 'edit' ? 'MODIFY TELEMETRY' : 'SITE DOSSIER'}
                  </span>
                  <div className="mt-2">
                    {modalMode === 'view' ? (
                      <h2 className="text-4xl font-black text-slate-900">{selectedSite.name}</h2>
                    ) : (
                      <div className="space-y-4 w-full">
                        <input placeholder="Site Name" value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} className="text-4xl font-black text-slate-900 border-b-2 border-slate-100 focus:border-blue-500 outline-none w-full bg-transparent pb-2 transition-all" />
                        <input disabled={modalMode === 'edit'} placeholder="Site ID" value={formData.id || ''} onChange={e=>setFormData({...formData, id:e.target.value})} className="text-xl font-bold border-b border-slate-100 focus:border-blue-500 outline-none w-full bg-transparent pb-1 transition-all" />
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedSite(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><X size={24}/></button>
              </div>

              <div className="space-y-12">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-black uppercase mb-2">Legacy Vendor</div>
                    <div className="font-bold text-lg">
                      {modalMode === 'view' ? selectedSite.currentVendor : (
                        <select className="bg-transparent font-bold w-full outline-none" value={formData.currentVendor} onChange={e=>setFormData({...formData, currentVendor: e.target.value as any})}>
                          <option value={Vendor.HUAWEI}>Huawei</option>
                          <option value={Vendor.NOKIA}>Nokia</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-black uppercase mb-2">Risk Factor</div>
                    <div className="font-bold text-lg">
                      {modalMode === 'view' ? selectedSite.riskLevel : (
                        <select className="bg-transparent font-bold w-full outline-none" value={formData.riskLevel} onChange={e=>setFormData({...formData, riskLevel: e.target.value as any})}>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-black uppercase mb-2">Region</div>
                    <div className="font-bold text-lg">
                      {modalMode === 'view' ? selectedSite.region : (
                        <input className="bg-transparent font-bold w-full outline-none" value={formData.region || ''} onChange={e=>setFormData({...formData, region: e.target.value})} />
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-black uppercase mb-2">Status</div>
                    <div className="font-bold text-lg">
                      {modalMode === 'view' ? selectedSite.status : (
                        <select className="bg-transparent font-bold w-full outline-none" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value as any})}>
                          {Object.values(SiteStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {modalMode === 'view' && (
                  <div className="w-full relative shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                    <SiteMap sites={[selectedSite]} onSiteClick={() => {}} mini={true} />
                    <div className="absolute bottom-4 right-4 z-10">
                      <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedSite.coordinates.lat},${selectedSite.coordinates.lng}`, '_blank')} className="px-4 py-2 bg-white/90 backdrop-blur-sm shadow-xl border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"><Navigation size={12}/> Open Field GPS</button>
                    </div>
                  </div>
                )}

                {modalMode === 'view' && isAdmin && (
                  <div className="bg-slate-900 rounded-3xl p-8 text-white relative shadow-xl">
                    <div className="flex justify-between items-center mb-6"><h4 className="font-bold text-lg flex items-center gap-2"><ShieldCheck size={22} className="text-emerald-400"/> Swap MOP</h4>{selectedSite.technicalInstructions && <span className="text-[9px] font-black uppercase text-emerald-400">Validated</span>}</div>
                    {selectedSite.technicalInstructions ? (
                      <div className="space-y-4">
                        {selectedSite.technicalInstructions.steps.map((s, i) => (<div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5"><div className="text-blue-400 font-black text-xs">{i+1}.</div><div className="text-sm font-medium">{s.task}</div></div>))}
                        <button onClick={() => handleGenerateWorkflow(selectedSite!)} className="text-[10px] text-blue-400 font-black uppercase mt-4 flex items-center gap-1 hover:underline disabled:opacity-50" disabled={!isAiConfigured}><RefreshCw size={12}/> Re-synthesize MOP</button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-slate-500 text-sm mb-6">Procedural data not yet synthesized.</p>
                        <button onClick={() => handleGenerateWorkflow(selectedSite!)} disabled={!isAiConfigured} className="w-full bg-blue-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-blue-500 shadow-lg disabled:opacity-50"><BrainCircuit size={18}/> Generate Procedure</button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 pb-10">
                   {modalMode === 'view' ? (
                     <>{isAdmin && <button onClick={() => { setFormData(selectedSite); setModalMode('edit'); }} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg">Modify Dossier</button>}<button onClick={() => alert("Printing Procedure...")} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">Print PDF</button></>
                   ) : (
                     <><button onClick={handleSaveSite} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg">Commit to Repository</button><button onClick={() => setModalMode('view')} className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">Cancel</button></>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
