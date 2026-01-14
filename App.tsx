
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
  LayoutDashboard, Map as MapIcon, Database, Activity, AlertTriangle, 
  CheckCircle2, ChevronRight, Search, Box, BrainCircuit, 
  Terminal, X, Calendar, PlayCircle, Clock, ListTodo, TrendingUp, 
  Zap, Loader2, CheckCircle, FileText, Plus, Trash2, Edit2, Save, 
  History, MessageSquare, Radio, Server, ShieldCheck, RefreshCw, LogOut, Lock, User as UserIcon,
  MapPin, Navigation, Info, Wifi, WifiOff, Cpu, Database as DbIcon, Globe
} from 'lucide-react';
import { Site, SiteStatus, Vendor, DeploymentTask, Equipment, User, UserRole, RiskLevel } from './types.ts';
import SiteMap from './components/SiteMap.tsx';
import { strategyEngine } from './services/strategyEngine.ts';
import { dbService } from './services/db.ts';
import { geminiService } from './services/gemini.ts';

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#94a3b8'];

const DEFAULT_TASKS: DeploymentTask[] = [
  { id: '1', site_id: '', label: 'Site Survey & Pre-checks', is_completed: true, assigned_role: 'Surveyor' },
  { id: '2', site_id: '', label: 'Equipment De-staging', is_completed: false, assigned_role: 'Field Tech' },
  { id: '3', site_id: '', label: 'Ericsson Module Installation', is_completed: false, assigned_role: 'Field Tech' },
  { id: '4', site_id: '', label: 'Fiber Re-patching', is_completed: false, assigned_role: 'Rigger' },
  { id: '5', site_id: '', label: 'Integration & Testing', is_completed: false, assigned_role: 'Core Engineer' },
  { id: '6', site_id: '', label: 'Acceptance Sign-off', is_completed: false, assigned_role: 'Team Lead' },
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
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen bg-white font-['Inter'] overflow-hidden">
      <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center p-20">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900 opacity-90"></div>
         <div className="relative z-10 text-white max-w-lg">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-4xl font-black mb-10 shadow-2xl">E</div>
           <h1 className="text-6xl font-black leading-tight mb-6">Nationwide Network Swap.</h1>
           <p className="text-slate-400 text-xl leading-relaxed">Precision project management for the Ericsson-Globe infrastructure initiative.</p>
         </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-10 bg-slate-50">
        <div className="w-full max-w-md">
           <div className="mb-10"><h2 className="text-3xl font-black text-slate-900">{isLogin ? 'Sign In' : 'Register'}</h2><p className="text-slate-500 mt-2">Enterprise Telemetry Access</p></div>
           <form onSubmit={handleSubmit} className="space-y-6">
             {!isLogin && (<div><label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Full Name</label><input required value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="Field Engineer"/></div>)}
             <div><label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Enterprise Email</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="user@ericsson.com"/></div>
             <div><label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Password</label><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="••••••••"/></div>
             {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
             <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-600/20">{loading ? 'Processing...' : 'Enter Planner'}</button>
           </form>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'sites' | 'plan' | 'actual' | 'map' | 'ai'>('monitoring');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [formData, setFormData] = useState<Partial<Site>>({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isDBOperation, setIsDBOperation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const user = dbService.getCurrentUser();
    if (user) { setCurrentUser(user); dbService.getSites().then(setSites); }
  }, []);

  const isAdmin = currentUser?.role === UserRole.Admin;

  const stats = useMemo(() => {
    const total = sites.length;
    const completed = sites.filter(s => s.status === SiteStatus.COMPLETED).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const highRisk = sites.filter(s => s.risk_level === RiskLevel.High).length;
    const inProgress = sites.filter(s => s.status === SiteStatus.IN_PROGRESS).length;
    return { total, completed, progress, highRisk, inProgress };
  }, [sites]);

  const filteredSites = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sites.filter(s => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [sites, searchQuery]);

  const handleSaveSite = async () => {
    if (!isAdmin) return;
    setIsDBOperation(true);
    try {
      const siteToSave = {
        ...formData,
        last_update: new Date().toISOString(),
        progress: formData.progress || 0,
        status: formData.status || SiteStatus.PENDING,
        risk_level: formData.risk_level || RiskLevel.Low,
        target_vendor: Vendor.ERICSSON,
        tasks: formData.tasks || DEFAULT_TASKS.map(t => ({ ...t, site_id: formData.id! })),
        equipment: formData.equipment || []
      } as Site;
      await dbService.upsertSite(siteToSave);
      const updatedData = await dbService.getSites();
      setSites(updatedData);
      setSelectedSite(null);
    } catch (e) { alert("Data Sync Error"); } finally { setIsDBOperation(false); }
  };

  const handleEquipmentChange = (type: 'swapped' | 'install', field: keyof Equipment, value: string) => {
    const currentEquip = formData.equipment || [];
    const vendor = type === 'install' ? Vendor.ERICSSON : (formData.current_vendor as Vendor || Vendor.HUAWEI);
    
    let equip = currentEquip.find(e => e.type === (type === 'install' ? 'Ericsson-Module' : 'Legacy-Module'));
    if (!equip) {
      equip = { id: Math.random().toString(), site_id: formData.id!, type: type === 'install' ? 'Ericsson-Module' : 'Legacy-Module', vendor, model: '', serial_number: '' };
      currentEquip.push(equip);
    }
    (equip as any)[field] = value;
    setFormData({ ...formData, equipment: [...currentEquip] });
  };

  const handleTaskToggle = async (siteId: string, taskId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;
    const newTasks = site.tasks?.map(t => t.id === taskId ? { ...t, is_completed: !t.is_completed } : t) || [];
    const completedCount = newTasks.filter(t => t.is_completed).length;
    const progress = Math.round((completedCount / (newTasks.length || 1)) * 100);
    let newStatus = site.status;
    if (progress === 100) newStatus = SiteStatus.COMPLETED;
    else if (progress > 0) newStatus = SiteStatus.IN_PROGRESS;
    const updatedSite = { ...site, tasks: newTasks, progress, status: newStatus };
    setIsDBOperation(true);
    try {
      await dbService.upsertSite(updatedSite);
      const updatedData = await dbService.getSites();
      setSites(updatedData);
    } finally {
      setIsDBOperation(false);
    }
  };

  const handleAutoSchedule = async () => {
    if (!isAdmin) return;
    setScheduling(true);
    try {
      const schedule = await geminiService.generateDeploymentSchedule(sites);
      const updatedSites = sites.map(s => {
        const item = schedule.find((sch: any) => sch.siteId === s.id);
        if (item) return { ...s, scheduled_date: item.scheduledDate, status: SiteStatus.PLANNED };
        return s;
      });
      for (const site of updatedSites) await dbService.upsertSite(site);
      setSites(updatedSites);
    } catch (error: any) {
      console.error(error);
      alert("Scheduling error: " + error.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!isAdmin) return;
    setLoadingAi(true);
    try {
      const result = await geminiService.analyzeProjectStatus(sites);
      setAiAnalysis(result);
      setActiveTab('ai');
    } catch (error: any) {
      console.error(error);
      alert("AI Synthesis Failed. Please check your API key.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (!currentUser) return <AuthPage onAuth={u => { setCurrentUser(u); dbService.getSites().then(setSites); }} />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-['Inter']">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg">E</div>
          <div><h1 className="text-white font-bold text-sm uppercase">Ericsson Globe</h1><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nodal Planner</p></div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <NavItem active={activeTab === 'sites'} onClick={() => setActiveTab('sites')} icon={<Database size={18}/>} label="Inventory" />
          <NavItem active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<Calendar size={18}/>} label="Planning" />
          <NavItem active={activeTab === 'actual'} onClick={() => setActiveTab('actual')} icon={<PlayCircle size={18}/>} label="Field Ops" />
          <NavItem active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<Globe size={18}/>} label="Deployment Map" />
          {isAdmin && <NavItem active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Cpu size={18}/>} label="Edge AI" />}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black uppercase text-slate-500">System Link Active</span>
             </div>
             <p className="text-[8px] text-slate-400">Node Sync: 100%</p>
          </div>
          <button onClick={() => { dbService.logout(); setCurrentUser(null); }} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"><LogOut size={14}/> Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search Inventory..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase text-emerald-500"><Wifi size={14}/> Telemetry Synchronized</div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#fdfdfd]">
          {activeTab === 'monitoring' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div><h2 className="text-2xl font-bold text-slate-900">Project Overview</h2><p className="text-slate-500 text-sm mt-1">Real-time nationwide synchronization</p></div>
              </div>
              <div className="grid grid-cols-4 gap-6">
                <StatusCard icon={<Activity className="text-blue-500"/>} label="Project Health" value={`${stats.progress.toFixed(1)}%`} sub="Aggregate Sync" />
                <StatusCard icon={<CheckCircle2 className="text-emerald-500"/>} label="Completed" value={stats.completed.toString()} sub="Verified Nodes" />
                <StatusCard icon={<Clock className="text-amber-500"/>} label="In Field" value={stats.inProgress.toString()} sub="Active Ops" />
                <StatusCard icon={<AlertTriangle className="text-red-500"/>} label="Blocked" value={stats.highRisk.toString()} sub="Risk Nodes" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-[350px]">
                    <h3 className="font-bold text-slate-800 mb-6 uppercase text-[10px] tracking-widest text-slate-400">Execution Velocity</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Week 1', progress: 5 },
                        { name: 'Week 2', progress: 12 },
                        { name: 'Week 3', progress: stats.progress },
                      ]}>
                        <defs><linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProg)" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6 uppercase text-[10px] tracking-widest text-slate-400">Regional Distribution</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[
                            { name: 'Completed', value: stats.completed },
                            { name: 'In Progress', value: stats.inProgress },
                            { name: 'Pending', value: stats.total - stats.completed - stats.inProgress },
                          ]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {COLORS.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'sites' && (
            <div className="animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Project Inventory</h2>
                  {isAdmin && <button onClick={() => { setModalMode('create'); setFormData({ id: `PH-G-${Math.floor(Math.random()*9999)}`, name: '', region: 'NCR', lat: 14.59, lng: 120.98, current_vendor: Vendor.HUAWEI, status: SiteStatus.PENDING, equipment: [] }); setSelectedSite({} as Site); }} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18}/> New Site</button>}
               </div>
               <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Site ID</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">GPS Coordinates</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {filteredSites.map(s => (
                       <tr key={s.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedSite(s); setModalMode('view'); }}>
                         <td className="px-6 py-4 font-bold">{s.id}</td>
                         <td className="px-6 py-4 text-sm">{s.name}</td>
                         <td className="px-6 py-4 text-xs font-bold text-blue-600">{s.current_vendor}</td>
                         <td className="px-6 py-4 text-[10px] font-mono text-slate-400">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</td>
                         <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${s.status === SiteStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{s.status}</span></td>
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
                  <div><h2 className="text-2xl font-bold text-slate-900">Batch Planning</h2><p className="text-slate-500 text-sm mt-1">Intelligent Deployment Scheduling</p></div>
                  {isAdmin && <button onClick={handleAutoSchedule} disabled={scheduling} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50">{scheduling ? <Loader2 className="animate-spin" size={18}/> : <Calendar size={18}/>} AI Batch Schedule</button>}
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
                      <div className="flex items-center gap-8"><div className="text-right"><div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Target</div><div className="text-sm font-bold text-slate-700">{site.scheduled_date || 'TBD'}</div></div><button className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={18}/></button></div>
                    </div>
                   ))
                 )}
               </div>
            </div>
          )}

          {activeTab === 'actual' && (
            <div className="animate-in fade-in duration-500">
               <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900">Field Handover</h2><p className="text-slate-500 text-sm mt-1">Real-time procedure execution tracking</p></div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {sites.filter(s => s.status === SiteStatus.IN_PROGRESS).length === 0 ? (
                    <div className="lg:col-span-2 p-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                       <PlayCircle className="text-slate-200 mx-auto mb-4" size={48} />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active field operations found.</p>
                       <button onClick={() => setActiveTab('plan')} className="mt-4 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Schedule a site to begin</button>
                    </div>
                  ) : (
                    sites.filter(s => s.status === SiteStatus.IN_PROGRESS).map(site => (
                      <div key={site.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden relative shadow-sm transition-all hover:shadow-md">
                        {isDBOperation && <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10"><Loader2 className="animate-spin text-blue-600" /></div>}
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center"><div><div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{site.id}</div><h3 className="text-xl font-bold mt-1">{site.name}</h3></div><div className="text-3xl font-black text-blue-500">{site.progress}%</div></div>
                        <div className="p-6 space-y-3">
                           {site.tasks?.map(task => (
                             <div key={task.id} onClick={() => handleTaskToggle(site.id, task.id)} className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer border transition-colors ${task.is_completed ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}>
                               <div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${task.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>{task.is_completed && <CheckCircle size={14}/>}</div><span className={`text-sm font-medium ${task.is_completed ? 'line-through opacity-60' : ''}`}>{task.label}</span></div>
                               <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-slate-200 text-slate-500">{task.assigned_role}</span>
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

          {activeTab === 'ai' && isAdmin && (
            <div className="animate-in slide-in-from-right-4 duration-500">
               <div className="mb-8 flex items-center justify-between">
                  <div><h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><Cpu className="text-blue-600" size={28} /> Project Strategist</h2><p className="text-slate-500 text-sm mt-1">AI-driven cognitive analysis of swap telemetry</p></div>
                  <button onClick={handleRunAiAnalysis} disabled={loadingAi} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50">{loadingAi ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} />} Synthesize Data</button>
               </div>
               
               {loadingAi && (
                 <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-6" size={48} />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Analyzing Project Pool...</h3>
                    <p className="text-sm text-slate-500">Cross-referencing hardware dependencies and regional risk factors with Gemini Core...</p>
                 </div>
               )}

               {aiAnalysis && !loadingAi && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                      <h4 className="font-bold text-lg text-blue-400 mb-6 flex items-center gap-2"><Terminal size={20}/> AI Insights</h4>
                      <ul className="space-y-6">
                        {aiAnalysis.strategicInsights.map((insight: string, idx: number) => (
                          <li key={idx} className="flex gap-4"><div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500"></div><p className="text-slate-300 text-sm leading-relaxed">{insight}</p></li>
                        ))}
                      </ul>
                      <div className="mt-10 pt-8 border-t border-white/10">
                         <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Risk Mitigation</h5>
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
                      <p className="mt-6 text-[10px] font-black uppercase text-blue-100 tracking-[0.3em]">Computed by Gemini-3-Flash</p>
                    </div>
                 </div>
               )}
               {!aiAnalysis && !loadingAi && (
                 <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                    <Radio className="text-slate-200 mx-auto mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active AI report. Run synthesis to generate.</p>
                 </div>
               )}
            </div>
          )}
        </div>

        {selectedSite && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedSite(null)}></div>
            <div className="w-full max-w-2xl h-full bg-white shadow-2xl relative z-10 p-10 overflow-y-auto">
              {isDBOperation && <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50"><Loader2 className="animate-spin text-blue-600" size={48}/></div>}
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">{modalMode === 'create' ? 'Register New Node' : 'Node Dossier'}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-widest">Project: Ericsson-Globe nationwide swap</p>
                </div>
                <button onClick={() => setSelectedSite(null)} className="p-2 bg-slate-100 rounded-xl"><X size={20}/></button>
              </div>

              <div className="space-y-8">
                {/* PRIMARY DETAILS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Site Identifier</label>
                  <input disabled={modalMode !== 'create'} value={formData.id || ''} onChange={e=>setFormData({...formData, id:e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="MNL-GLOBE-XXX"/></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Node Name</label>
                  <input value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="Makati Tower A"/></div>
                </div>

                {/* GPS DETAILS */}
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> Geospatial Telemetry (GPS)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">Latitude (DECIMAL 10,8)</label>
                    <input type="number" step="0.00000001" value={formData.lat || ''} onChange={e=>setFormData({...formData, lat: parseFloat(e.target.value)})} className="w-full p-3 bg-white border border-blue-100 rounded-xl font-mono text-xs"/></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">Longitude (DECIMAL 11,8)</label>
                    <input type="number" step="0.00000001" value={formData.lng || ''} onChange={e=>setFormData({...formData, lng: parseFloat(e.target.value)})} className="w-full p-3 bg-white border border-blue-100 rounded-xl font-mono text-xs"/></div>
                  </div>
                </div>

                {/* EQUIPMENT TO BE SWAPPED OUT (Legacy) */}
                <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-4">
                  <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2"><RefreshCw size={14}/> Hardware to Swapped With (Legacy)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">Legacy Vendor</label>
                    <select value={formData.current_vendor} onChange={e=>setFormData({...formData, current_vendor: e.target.value as any})} className="w-full p-3 bg-white border border-red-100 rounded-xl font-bold text-sm">
                      <option value={Vendor.HUAWEI}>Huawei</option><option value={Vendor.NOKIA}>Nokia</option></select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">Current Model</label>
                    <input value={formData.equipment?.find(e=>e.type==='Legacy-Module')?.model || ''} onChange={e=>handleEquipmentChange('swapped', 'model', e.target.value)} className="w-full p-3 bg-white border border-red-100 rounded-xl text-sm" placeholder="e.g. BBU3900"/></div>
                    <div className="col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-400">Legacy Serial Number</label>
                    <input value={formData.equipment?.find(e=>e.type==='Legacy-Module')?.serial_number || ''} onChange={e=>handleEquipmentChange('swapped', 'serial_number', e.target.value)} className="w-full p-3 bg-white border border-red-100 rounded-xl text-sm font-mono" placeholder="SN-XXXX-XXXX"/></div>
                  </div>
                </div>

                {/* EQUIPMENT TO INSTALL (Ericsson) */}
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Server size={14}/> Equipment to Install (Target: Ericsson)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">Ericsson Model</label>
                    <input value={formData.equipment?.find(e=>e.type==='Ericsson-Module')?.model || ''} onChange={e=>handleEquipmentChange('install', 'model', e.target.value)} className="w-full p-3 bg-white border border-emerald-100 rounded-xl text-sm" placeholder="e.g. BB 6630"/></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">New Serial Number</label>
                    <input value={formData.equipment?.find(e=>e.type==='Ericsson-Module')?.serial_number || ''} onChange={e=>handleEquipmentChange('install', 'serial_number', e.target.value)} className="w-full p-3 bg-white border border-emerald-100 rounded-xl text-sm font-mono" placeholder="SN-ERIC-XXXX"/></div>
                  </div>
                </div>

                <div className="flex gap-4 pb-8">
                  <button onClick={handleSaveSite} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">Commit to Database</button>
                  <button onClick={() => setSelectedSite(null)} className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl font-black hover:bg-slate-50 transition-colors">Cancel</button>
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
