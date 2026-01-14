
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
  LayoutDashboard, Map as MapIcon, Database, Activity, AlertTriangle, 
  CheckCircle2, ChevronRight, Search, Download, Box, BrainCircuit, 
  Terminal, X, Calendar, PlayCircle, Clock, ListTodo, TrendingUp, 
  Zap, Loader2, CheckCircle, FileText, Plus, Trash2, Edit2, Save, 
  History, MessageSquare, Radio, Server, ShieldCheck, RefreshCw, LogOut, Lock, User as UserIcon
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

// Sub-components defined before App to ensure availability
const NavItem: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({active, onClick, icon, label}) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>{icon}<span className="text-xs font-bold uppercase tracking-widest">{label}</span></button>
);

const StatusCard: React.FC<{icon: React.ReactNode, label: string, value: string, sub: string}> = ({icon, label, value, sub}) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"><div className="flex justify-between items-start mb-6"><div className="p-3 bg-slate-50 rounded-2xl">{icon}</div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span></div><h3 className="text-4xl font-black text-slate-900">{value}</h3><div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub}</div></div>
);

const EmptyState: React.FC<{onAction: () => void}> = ({onAction}) => (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
    <Database className="text-slate-300 mx-auto mb-6" size={48} />
    <h3 className="text-xl font-bold text-slate-800 mb-2">Cluster empty</h3>
    <button onClick={onAction} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold mt-6 shadow-lg shadow-blue-500/20">Go to Repository</button>
  </div>
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
      setError(err.message || "An unexpected authentication error occurred.");
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
           <div className="mt-12 flex gap-12">
             <div><div className="text-3xl font-bold text-blue-500 mb-1">2.4k</div><div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Sites</div></div>
             <div><div className="text-3xl font-bold text-emerald-500 mb-1">99.9%</div><div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uptime Target</div></div>
           </div>
         </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-10 lg:p-24 bg-slate-50">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right duration-700">
           <div className="mb-10 text-center lg:text-left">
             <h2 className="text-3xl font-black text-slate-900">{isLogin ? 'Sign In' : 'Create Account'}</h2>
             <p className="text-slate-500 mt-2">{isLogin ? 'Access the planner dashboard' : 'Join the Ericsson deployment team'}</p>
           </div>
           <form onSubmit={handleSubmit} className="space-y-6">
             {!isLogin && (
               <div><label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Full Name</label>
               <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" placeholder="John Doe"/></div>
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
           <div className="mt-8 text-center text-slate-500 text-sm">
             {isLogin ? "Don't have an account?" : "Already registered?"} 
             <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-600 font-bold hover:underline">
               {isLogin ? 'Sign Up' : 'Sign In'}
             </button>
           </div>
           <div className="mt-12 pt-8 border-t border-slate-200 flex justify-center gap-6">
             <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={12}/> Secure 256-bit</div>
             <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2"><UserIcon size={12}/> SSO Integrated</div>
           </div>
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
  const [scheduling, setScheduling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);
  const [isDBOperation, setIsDBOperation] = useState(false);

  // Auth & Database Initialization
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
  }, []);

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
    { day: 'Sat', target: 1, actual: 0 },
    { day: 'Sun', target: 0, actual: 0 },
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
    if (sites.length === 0) {
      alert("Please add sites in the Repository before running AI analysis.");
      return;
    }
    setLoadingAi(true);
    try {
      const result = await geminiService.analyzeProjectStatus(sites);
      setAiAnalysis(result);
      setActiveTab('ai');
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAutoSchedule = async () => {
    if (!isAdmin) return;
    if (sites.length === 0) {
      alert("No sites found to schedule.");
      return;
    }
    setScheduling(true);
    try {
      const schedule = await geminiService.generateDeploymentSchedule(sites);
      const updatedSites = sites.map(s => {
        const item = schedule.find((sch: any) => sch.siteId === s.id);
        if (item) {
          return { ...s, scheduledDate: item.scheduledDate, status: SiteStatus.PLANNED };
        }
        return s;
      });
      for (const site of updatedSites) await dbService.upsertSite(site);
      setSites(updatedSites);
      alert("AI Scheduling Complete. Database synced.");
    } catch (error) {
      console.error("Scheduling failed", error);
    } finally {
      setScheduling(false);
    }
  };

  const handleGenerateWorkflow = async (site: Site) => {
    if (!isAdmin) return;
    setLoadingWorkflow(true);
    setIsDBOperation(true);
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
    } catch (error) {
      console.error("Workflow Generation failed", error);
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
    if (window.confirm('Delete this site from the database?')) {
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
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-['Inter']">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onAuth={(user) => { setCurrentUser(user); dbService.getSites().then(setSites); }} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-['Inter']">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-900/40">E</div>
          <div>
            <h1 className="text-white font-bold leading-none text-sm">Ericsson Globe</h1>
            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">PH Swap Planner</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} icon={<LayoutDashboard size={18}/>} label="Monitoring" />
          <NavItem active={activeTab === 'sites'} onClick={() => setActiveTab('sites')} icon={<Database size={18}/>} label="Site Inventory" />
          <NavItem active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<Calendar size={18}/>} label="Plan Deployment" />
          <NavItem active={activeTab === 'actual'} onClick={() => setActiveTab('actual')} icon={<PlayCircle size={18}/>} label="Actual Deployment" />
          <NavItem active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon size={18}/>} label="Deployment Map" />
          {isAdmin && <NavItem active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<BrainCircuit size={18}/>} label="AI Strategy" />}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-4 py-3 bg-slate-800/40 rounded-xl">
             <div className="flex items-center gap-3 mb-1">
               <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-black">
                 {currentUser.role[0]}
               </div>
               <span className="text-[10px] font-bold text-white truncate">{currentUser.name}</span>
             </div>
             <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{currentUser.role} Account</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search sites..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
             {isAdmin && <button onClick={async () => { if(window.confirm('Purge DB?')) { await dbService.clearDatabase(); setSites([]); } }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><RefreshCw size={18}/></button>}
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                <Server size={14} className="text-slate-400"/>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Pooler Active</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#fdfdfd]">
          {activeTab === 'monitoring' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div><h2 className="text-2xl font-bold text-slate-900">Project Monitoring</h2><p className="text-slate-500 text-sm mt-1">Real-time status of the swap operation</p></div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1"><TrendingUp size={14}/> +12% Efficiency</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusCard icon={<Activity className="text-blue-500" />} label="Completion" value={`${stats.progress.toFixed(1)}%`} sub="Live Sync" />
                <StatusCard icon={<CheckCircle2 className="text-emerald-500" />} label="Swapped" value={stats.completed.toString()} sub={`${stats.total - stats.completed} pending`} />
                <StatusCard icon={<Clock className="text-amber-500" />} label="Active" value={stats.inProgress.toString()} sub="Field Ops" />
                <StatusCard icon={<AlertTriangle className="text-red-500" />} label="High Risk" value={stats.highRisk.toString()} sub="Attention needed" />
              </div>
              {sites.length === 0 ? (
                <EmptyState onAction={() => setActiveTab('sites')} />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-6">Daily Flow</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monitoringData}>
                        <defs><linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTarget)" />
                        <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6">Database Distribution</h3>
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[
                            { name: 'Completed', value: stats.completed },
                            { name: 'Progress', value: stats.inProgress },
                            { name: 'Blocked', value: stats.highRisk },
                            { name: 'Pending', value: stats.total - stats.completed - stats.inProgress - stats.highRisk },
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
                  <div><h2 className="text-2xl font-bold text-slate-900">Site Repository</h2><p className="text-slate-500 text-sm mt-1">PostgreSQL Cluster Records</p></div>
                  <div className="flex gap-3">
                    {isAdmin && <button onClick={() => { setModalMode('create'); setFormData({id: `SITE-${Math.floor(Math.random()*900)+100}`, name: '', region: 'NCR', currentVendor: Vendor.HUAWEI, status: SiteStatus.PENDING, equipment: [], riskLevel: 'Low', coordinates: {lat: 14.59, lng: 120.98}, tasks: DEFAULT_TASKS.map(t=>({...t, isCompleted: false}))}); setSelectedSite({} as Site); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-bold text-sm"><Plus size={18}/> New Entry</button>}
                    <button onClick={() => alert("Exporting...")} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"><Download size={18}/> Export CSV</button>
                  </div>
               </div>
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Site ID</th><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor</th><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</th><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th><th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {filteredSites.map(site => (
                       <tr key={site.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => { setSelectedSite(site); setModalMode('view'); }}>
                         <td className="px-6 py-4 font-bold text-slate-900">{site.id}</td>
                         <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-black border ${site.currentVendor === Vendor.HUAWEI ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{site.currentVendor}</span></td>
                         <td className="px-6 py-4"><div className="w-16 bg-slate-100 h-1.5 rounded-full"><div className="bg-blue-600 h-full" style={{width: `${site.progress || 0}%`}}></div></div></td>
                         <td className="px-6 py-4 text-xs font-semibold">{site.status}</td>
                         <td className="px-6 py-4 flex gap-2">
                           <button onClick={(e) => { e.stopPropagation(); setModalMode('edit'); setFormData(site); setSelectedSite(site); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400"><Edit2 size={16}/></button>
                           {isAdmin && <button onClick={(e) => { e.stopPropagation(); handleDeleteSite(site.id); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>}
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
                  <div><h2 className="text-2xl font-bold text-slate-900">Logistics Planning</h2><p className="text-slate-500 text-sm mt-1">Optimized scheduling logic</p></div>
                  {isAdmin && <button onClick={handleAutoSchedule} disabled={scheduling} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20">{scheduling ? <Loader2 className="animate-spin"/> : <Calendar size={18}/>} Schedule Batch</button>}
               </div>
               <div className="space-y-4">
                 {sites.filter(s => s.status !== SiteStatus.COMPLETED).map(site => (
                   <div key={site.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between group">
                     <div className="flex items-center gap-6"><div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black">{site.id.slice(0,3)}</div><div><h4 className="font-bold text-slate-900">{site.name}</h4><div className="text-[10px] text-slate-400 font-bold uppercase">{site.region}</div></div></div>
                     <div className="flex items-center gap-8"><div className="text-right"><div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Target Date</div><div className="text-sm font-bold text-slate-700">{site.scheduledDate || 'TBD'}</div></div><button onClick={() => { setSelectedSite(site); setModalMode('view'); }} className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={18}/></button></div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'actual' && (
            <div className="animate-in fade-in duration-500">
               <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900">Live Execution</h2><p className="text-slate-500 text-sm mt-1">Field-level task synchronization</p></div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {sites.filter(s => s.status === SiteStatus.IN_PROGRESS).map(site => (
                    <div key={site.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden relative">
                      {isDBOperation && <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10"><Loader2 className="animate-spin text-blue-600" /></div>}
                      <div className="p-6 bg-slate-900 text-white flex justify-between items-center"><div><div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Active Node</div><h3 className="text-xl font-bold mt-1">{site.name}</h3></div><div className="text-3xl font-black text-blue-500">{site.progress}%</div></div>
                      <div className="p-6 space-y-3">
                         {site.tasks?.map(task => (
                           <div key={task.id} onClick={() => handleTaskToggle(site.id, task.id)} className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer border ${task.isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-slate-50 border-slate-100'}`}>
                             <div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>{task.isCompleted && <CheckCircle size={14}/>}</div><span className={`text-sm font-medium ${task.isCompleted ? 'line-through opacity-60' : ''}`}>{task.label}</span></div>
                             <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-slate-200 text-slate-500">{task.assignedRole}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'map' && <SiteMap sites={sites} onSiteClick={(s) => { setSelectedSite(s); setModalMode('view'); }} />}

          {activeTab === 'ai' && isAdmin && (
            <div className="animate-in slide-in-from-right-4 duration-500">
               <div className="mb-8 flex items-center justify-between">
                  <div><h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><BrainCircuit className="text-blue-600" size={28} /> AI Strategist</h2><p className="text-slate-500 text-sm mt-1">Admin-only tactical insights via Gemini 3</p></div>
                  <button onClick={handleRunAiAnalysis} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">{loadingAi ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} />}Recalculate</button>
               </div>
               {aiAnalysis && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl"><h4 className="font-bold text-lg text-blue-400 mb-6 flex items-center gap-2"><Terminal size={20}/> Insights</h4><ul className="space-y-6">{aiAnalysis.strategicInsights.map((insight: string, idx: number) => (<li key={idx} className="flex gap-4"><div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500"></div><p className="text-slate-300 text-sm leading-relaxed">{insight}</p></li>))}</ul></div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white flex flex-col items-center justify-center text-center"><div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Project Health</div><div className="text-7xl font-black mb-4">{aiAnalysis.projectHealth}</div><div className="w-full bg-white/20 h-2 rounded-full"><div className="bg-white h-full" style={{width: aiAnalysis.projectHealth}}></div></div></div>
                 </div>
               )}
            </div>
          )}
        </div>

        {selectedSite && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedSite(null)}></div>
            <div className="w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto relative z-10 p-10">
              {(isDBOperation || loadingWorkflow) && <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>}
              <div className="flex justify-between items-start mb-10">
                <div><span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{modalMode.toUpperCase()} NODE</span><h2 className="text-4xl font-black text-slate-900 mt-2">{modalMode === 'view' ? selectedSite.name : <input value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} className="border-b focus:border-blue-500 outline-none w-full"/>}</h2></div>
                <button onClick={() => setSelectedSite(null)} className="p-3 bg-slate-100 rounded-2xl"><X size={24}/></button>
              </div>

              <div className="space-y-12">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><div className="text-[10px] text-slate-400 font-black uppercase mb-2">Vendor</div><div className="font-bold text-lg">{modalMode === 'view' ? selectedSite.currentVendor : <select className="bg-transparent font-bold w-full outline-none" value={formData.currentVendor} onChange={e=>setFormData({...formData, currentVendor: e.target.value as any})}><option value={Vendor.HUAWEI}>Huawei</option><option value={Vendor.NOKIA}>Nokia</option></select>}</div></div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><div className="text-[10px] text-slate-400 font-black uppercase mb-2">Risk</div><div className="font-bold text-lg">{modalMode === 'view' ? selectedSite.riskLevel : <select className="bg-transparent font-bold w-full outline-none" value={formData.riskLevel} onChange={e=>setFormData({...formData, riskLevel: e.target.value as any})}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select>}</div></div>
                </div>

                {modalMode === 'view' && isAdmin && (
                  <div className="bg-slate-900 rounded-3xl p-8 text-white relative">
                    <div className="flex justify-between items-center mb-6"><h4 className="font-bold text-lg flex items-center gap-2"><ShieldCheck size={22} className="text-emerald-400"/> Technical Dossier</h4>{selectedSite.technicalInstructions && <span className="text-[9px] font-black uppercase text-emerald-400">DB Synched</span>}</div>
                    {selectedSite.technicalInstructions ? (
                      <div className="space-y-4">
                        {selectedSite.technicalInstructions.steps.map((s, i) => (<div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5"><div className="text-blue-400 font-black text-xs">{i+1}.</div><div className="text-sm font-medium">{s.task}</div></div>))}
                        <button onClick={() => handleGenerateWorkflow(selectedSite!)} className="text-[10px] text-blue-400 font-black uppercase mt-4 flex items-center gap-1"><RefreshCw size={12}/> Rebuild Flow</button>
                      </div>
                    ) : (
                      <div className="text-center py-6"><p className="text-slate-500 text-sm mb-6">No dossier linked. Generate hardware-specific instructions now.</p><button onClick={() => handleGenerateWorkflow(selectedSite!)} className="w-full bg-blue-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-blue-500"><BrainCircuit size={18}/> Synthesize & Sync</button></div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 pb-10">
                   {modalMode === 'view' ? (
                     <>{isAdmin && <button onClick={() => setModalMode('edit')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all">Edit metadata</button>}<button onClick={() => alert("Printing...")} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">Print Ops Sheet</button></>
                   ) : (
                     <><button onClick={handleSaveSite} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all">Commit Sync</button><button onClick={() => setModalMode('view')} className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">Cancel</button></>
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
