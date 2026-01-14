
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
  LayoutDashboard, Activity, AlertTriangle, 
  CheckCircle2, ChevronRight, Search, X, Calendar, PlayCircle, Clock, 
  Zap, Loader2, CheckCircle, Plus, RefreshCw, LogOut, 
  MapPin, Info, Wifi, Cpu, Globe, Terminal, ShieldCheck, Server,
  Database, Trash2, ListFilter, BarChart3, Table as TableIcon, Sparkles
} from 'lucide-react';
import { Site, SiteStatus, Vendor, DeploymentTask, Equipment, User, UserRole, RiskLevel, SiteMilestones } from './types.ts';
import SiteMap from './components/SiteMap.tsx';
import { strategyEngine } from './services/strategyEngine.ts';
import { dbService } from './services/db.ts';

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#94a3b8'];

const DEFAULT_MILESTONES: SiteMilestones = {
  survey: { plan: '', actual: '' },
  survey_report: { plan: '', actual: '' },
  installation: { plan: '', actual: '' },
  integration: { plan: '', actual: '' },
  completion_report: { plan: '', actual: '' },
  site_close: { plan: '', actual: '' },
};

const DEFAULT_TASKS: DeploymentTask[] = [
  { id: '1', site_id: '', label: 'Site Survey & Pre-checks', is_completed: true, assigned_role: 'Surveyor' },
  { id: '2', site_id: '', label: 'Equipment De-staging', is_completed: false, assigned_role: 'Field Tech' },
  { id: '3', site_id: '', label: 'Ericsson Module Installation', is_completed: false, assigned_role: 'Field Tech' },
  { id: '4', site_id: '', label: 'Fiber Re-patching', is_completed: false, assigned_role: 'Rigger' },
  { id: '5', site_id: '', label: 'Integration & Testing', is_completed: false, assigned_role: 'Core Engineer' },
  { id: '6', site_id: '', label: 'Acceptance Sign-off', is_completed: false, assigned_role: 'Team Lead' },
];

const NavItem: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({active, onClick, icon, label}) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
    {icon}
    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const StatusCard: React.FC<{icon: React.ReactNode, label: string, value: string, sub: string}> = ({icon, label, value, sub}) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <h3 className="text-4xl font-black text-slate-900">{value}</h3>
    <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub}</div>
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
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="flex h-screen bg-white font-['Inter'] overflow-hidden">
      <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center p-20">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900 opacity-90"></div>
         <div className="relative z-10 text-white max-w-lg">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black mb-10 shadow-2xl">E</div>
           <h1 className="text-6xl font-black leading-tight mb-6">Nationwide Network Swap.</h1>
           <p className="text-slate-400 text-xl leading-relaxed">Precision project management for the Ericsson-Globe infrastructure initiative.</p>
         </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-10 bg-slate-50">
        <div className="w-full max-w-md">
           <div className="mb-10">
             <h2 className="text-3xl font-black text-slate-900">{isLogin ? 'Sign In' : 'Register'}</h2>
             <p className="text-slate-500 mt-2 text-sm">Enterprise Nodal Planner Access</p>
           </div>
           <form onSubmit={handleSubmit} className="space-y-6">
             {!isLogin && (
               <div>
                 <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Full Name</label>
                 <input required value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-colors" placeholder="Field Engineer"/>
               </div>
             )}
             <div>
               <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Enterprise Email</label>
               <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-colors" placeholder="user@ericsson.com"/>
             </div>
             <div>
               <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Password</label>
               <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-colors" placeholder="••••••••"/>
             </div>
             {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
             <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
               {loading ? 'Processing...' : 'Enter Planner'}
             </button>
             <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
               {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
             </button>
           </form>
        </div>
      </div>
    </div>
  );
};

const GanttChart: React.FC<{sites: Site[]}> = ({sites}) => {
  const milestonesList = [
    { key: 'survey', label: 'Survey' },
    { key: 'survey_report', label: 'Report' },
    { key: 'installation', label: 'Install' },
    { key: 'integration', label: 'Integ' },
    { key: 'completion_report', label: 'Final' },
    { key: 'site_close', label: 'Close' },
  ];

  if (!sites || sites.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No site data available for timeline analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Project Timeline Analysis (Gantt)</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 rounded-sm"></div><span className="text-[10px] font-bold text-slate-500 uppercase">Planned</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div><span className="text-[10px] font-bold text-slate-500 uppercase">Actual</span></div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[1200px] p-6 space-y-10">
          {sites.map(site => {
            if (!site) return null;
            const ms = site.milestones || DEFAULT_MILESTONES;
            return (
              <div key={site.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{site.id} - {site.name}</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{site.progress}% Complete</span>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {milestonesList.map(m => {
                    const data = (ms as any)?.[m.key] || { plan: '', actual: '' };
                    return (
                      <div key={m.key} className="space-y-2">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center">{m.label}</div>
                        <div className="h-8 w-full bg-slate-50 rounded-lg relative overflow-hidden flex flex-col border border-slate-100">
                          <div className={`h-1/2 w-full ${data.plan ? 'bg-slate-200' : 'bg-transparent'}`} title={`Planned: ${data.plan || 'N/A'}`}></div>
                          <div className={`h-1/2 w-full ${data.actual ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-transparent'}`} title={`Actual: ${data.actual || 'N/A'}`}></div>
                        </div>
                        <div className="text-[8px] font-mono font-bold text-slate-500 text-center">{data.actual || '--'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SpreadsheetTable: React.FC<{sites: Site[]}> = ({sites}) => {
  const milestoneKeys = [
    { key: 'survey', label: 'Survey' },
    { key: 'survey_report', label: 'S. Report' },
    { key: 'installation', label: 'Installation' },
    { key: 'integration', label: 'Integration' },
    { key: 'completion_report', label: 'Comp. Report' },
    { key: 'site_close', label: 'Site Close' },
  ];

  if (!sites || sites.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No site records to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Node Identifier</th>
              {milestoneKeys.map(m => (
                <th key={m.key} colSpan={2} className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">{m.label}</th>
              ))}
            </tr>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-2 sticky left-0 bg-slate-50 z-10 border-r border-slate-200"></th>
              {milestoneKeys.map(m => (
                <React.Fragment key={m.key}>
                  <th className="px-2 py-2 text-[9px] font-black text-slate-400 uppercase border-r border-slate-100 text-center">Plan</th>
                  <th className="px-2 py-2 text-[9px] font-black text-blue-500 uppercase border-r border-slate-200 text-center">Actual</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sites.map(s => {
              if (!s) return null;
              const ms = s.milestones || DEFAULT_MILESTONES;
              return (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-slate-200 font-bold text-xs">
                    <div className="flex flex-col">
                      <span className="text-slate-900">{s.id}</span>
                      <span className="text-[10px] text-slate-400 font-normal truncate max-w-[180px]">{s.name}</span>
                    </div>
                  </td>
                  {milestoneKeys.map(m => {
                    const data = (ms as any)?.[m.key] || { plan: '', actual: '' };
                    return (
                      <React.Fragment key={m.key}>
                        <td className="px-2 py-4 text-[10px] font-mono text-center border-r border-slate-100 text-slate-500">{data.plan || '--'}</td>
                        <td className={`px-2 py-4 text-[10px] font-mono text-center border-r border-slate-200 ${data.actual ? 'text-blue-600 font-bold' : 'text-slate-300'}`}>
                          {data.actual || '--'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'sites' | 'plan' | 'actual' | 'map' | 'ai' | 'track'>('monitoring');
  const [trackView, setTrackView] = useState<'table' | 'gantt'>('table');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [formData, setFormData] = useState<Partial<Site>>({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isDBOperation, setIsDBOperation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);

  useEffect(() => {
    const user = dbService.getCurrentUser();
    if (user) { 
      setCurrentUser(user); 
      dbService.getSites().then(data => setSites(Array.isArray(data) ? data : [])); 
    }
  }, []);

  const isAdmin = currentUser?.role === UserRole.Admin;

  const stats = useMemo(() => {
    const data = sites || [];
    const total = data.length;
    const completed = data.filter(s => s?.status === SiteStatus.COMPLETED).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const highRisk = data.filter(s => s?.risk_level === RiskLevel.High).length;
    const inProgress = data.filter(s => s?.status === SiteStatus.IN_PROGRESS).length;
    return { total, completed, progress, highRisk, inProgress };
  }, [sites]);

  const filteredSites = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (sites || []).filter(s => 
      s && (
        (s.id?.toLowerCase() || '').includes(q) || 
        (s.name?.toLowerCase() || '').includes(q)
      )
    );
  }, [sites, searchQuery]);

  const handleOpenSite = (site: Site, mode: 'view' | 'edit' | 'create') => {
    setSelectedSite(site);
    setFormData({ ...site, milestones: site.milestones || { ...DEFAULT_MILESTONES } });
    setModalMode(mode);
  };

  const handleSaveSite = async () => {
    if (!isAdmin || isDBOperation) return;
    if (!formData.id) {
      alert("Error: Site ID is required.");
      return;
    }
    
    setIsDBOperation(true);
    try {
      const siteToSave = {
        ...formData,
        name: formData.name || 'Unnamed Node',
        last_update: new Date().toISOString(),
        progress: formData.progress || 0,
        status: formData.status || SiteStatus.PENDING,
        risk_level: formData.risk_level || RiskLevel.Low,
        target_vendor: Vendor.ERICSSON,
        milestones: formData.milestones || { ...DEFAULT_MILESTONES },
        tasks: formData.tasks || DEFAULT_TASKS.map(t => ({ ...t, site_id: formData.id! })),
        equipment: formData.equipment || []
      } as Site;
      
      await dbService.upsertSite(siteToSave);
      const updatedData = await dbService.getSites();
      
      setSites(Array.isArray(updatedData) ? updatedData : []);
      setSelectedSite(null);
      setFormData({});
    } catch (e) { 
      console.error(e);
      alert("Database error occurred."); 
    } finally { 
      setIsDBOperation(false); 
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!isAdmin || isDBOperation) return;
    if (!window.confirm("Purge Node Dossier? This action cannot be undone.")) return;
    
    setIsDBOperation(true);
    try {
      await dbService.deleteSite(id);
      const updatedData = await dbService.getSites();
      setSites(Array.isArray(updatedData) ? updatedData : []);
      setSelectedSite(null);
      setFormData({});
    } catch (e) {
      console.error(e);
    } finally {
      setIsDBOperation(false);
    }
  };

  const handleMilestoneChange = (key: keyof SiteMilestones, field: 'plan' | 'actual', value: string) => {
    const currentMilestones = { ...(formData.milestones || { ...DEFAULT_MILESTONES }) };
    currentMilestones[key] = { ...currentMilestones[key], [field]: value };
    setFormData({ ...formData, milestones: currentMilestones });
  };

  const handleSingleSiteAutoSchedule = async () => {
    if (!isAdmin) return;
    // Set first milestone plan to today by default if nothing exists
    const newMilestones = await strategyEngine.generateMilestonePlan();
    setFormData({ 
      ...formData, 
      milestones: newMilestones,
      scheduled_date: newMilestones.survey.plan,
      status: SiteStatus.PLANNED
    });
  };

  const handleTaskToggle = async (siteId: string, taskId: string) => {
    const data = sites || [];
    const site = data.find(s => s.id === siteId);
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
      setSites(Array.isArray(updatedData) ? updatedData : []);
    } finally {
      setIsDBOperation(false);
    }
  };

  const handleAutoSchedule = async () => {
    if (!isAdmin) return;
    setScheduling(true);
    try {
      const schedule = await strategyEngine.generateDeploymentSchedule(sites);
      const updatedSites = await Promise.all(sites.map(async s => {
        const item = schedule.find((sch: any) => sch.siteId === s.id);
        if (item) {
          // Also generate milestones based on the scheduled date for consistency
          const milestones = await strategyEngine.generateMilestonePlan(item.scheduledDate);
          return { 
            ...s, 
            scheduled_date: item.scheduledDate, 
            status: SiteStatus.PLANNED,
            milestones: milestones
          };
        }
        return s;
      }));
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
      const result = await strategyEngine.analyzeProjectStatus(sites);
      setAiAnalysis(result);
      setActiveTab('ai');
    } catch (error: any) {
      console.error(error);
      alert("Analysis Failed.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (!currentUser) return <AuthPage onAuth={u => { setCurrentUser(u); dbService.getSites().then(data => setSites(Array.isArray(data) ? data : [])); }} />;

  const pendingSites = sites.filter(s => s.status !== SiteStatus.COMPLETED);

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
          <NavItem active={activeTab === 'track'} onClick={() => setActiveTab('track')} icon={<ListFilter size={18}/>} label="Milestones" />
          <NavItem active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<Calendar size={18}/>} label="Planning" />
          <NavItem active={activeTab === 'actual'} onClick={() => setActiveTab('actual')} icon={<PlayCircle size={18}/>} label="Field Ops" />
          <NavItem active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<Globe size={18}/>} label="Deployment Map" />
          {isAdmin && <NavItem active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Cpu size={18}/>} label="Cognitive Core" />}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { dbService.logout(); setCurrentUser(null); }} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"><LogOut size={14}/> Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search Node Identifier..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white transition-colors" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase text-emerald-500">
            <ShieldCheck size={14}/> 100% Offline Security Verified
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#fdfdfd]">
          {activeTab === 'monitoring' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div><h2 className="text-2xl font-bold text-slate-900">Project Overview</h2><p className="text-slate-500 text-sm mt-1">Real-time nationwide synchronization</p></div>
              </div>
              <div className="grid grid-cols-4 gap-6">
                <StatusCard icon={<Activity className="text-blue-500"/>} label="Project Health" value={`${(stats?.progress || 0).toFixed(1)}%`} sub="Aggregate Sync" />
                <StatusCard icon={<CheckCircle2 className="text-emerald-500"/>} label="Completed" value={(stats?.completed || 0).toString()} sub="Verified Nodes" />
                <StatusCard icon={<Clock className="text-amber-500"/>} label="In Field" value={(stats?.inProgress || 0).toString()} sub="Active Ops" />
                <StatusCard icon={<AlertTriangle className="text-red-500"/>} label="Blocked" value={(stats?.highRisk || 0).toString()} sub="Risk Nodes" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-[350px]">
                    <h3 className="font-bold text-slate-800 mb-6 uppercase text-[10px] tracking-widest text-slate-400">Execution Velocity</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Week 1', progress: 5 },
                        { name: 'Week 2', progress: 12 },
                        { name: 'Week 3', progress: stats?.progress || 0 },
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
                    <h3 className="font-bold text-slate-800 mb-6 uppercase text-[10px] tracking-widest text-slate-400">Project Distribution</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[
                            { name: 'Completed', value: stats?.completed || 0 },
                            { name: 'In Progress', value: stats?.inProgress || 0 },
                            { name: 'Pending', value: Math.max(0, (stats?.total || 0) - (stats?.completed || 0) - (stats?.inProgress || 0)) },
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
                  {isAdmin && (
                    <button 
                      onClick={() => handleOpenSite({ id: `PH-G-${Math.floor(Math.random()*9999)}`, name: '', region: 'NCR', lat: 14.59, lng: 120.98, current_vendor: Vendor.HUAWEI, status: SiteStatus.PENDING, equipment: [], target_vendor: Vendor.ERICSSON, risk_level: RiskLevel.Low, progress: 0, last_update: new Date().toISOString(), milestones: { ...DEFAULT_MILESTONES } } as Site, 'create')} 
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all"
                    >
                      <Plus size={18}/> New Site
                    </button>
                  )}
               </div>
               <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Site ID</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">GPS Coordinates</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {(filteredSites || []).map(s => (
                       <tr key={s.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => handleOpenSite(s, 'view')}>
                         <td className="px-6 py-4 font-bold">{s.id}</td>
                         <td className="px-6 py-4 text-sm font-medium">{s.name}</td>
                         <td className="px-6 py-4 text-xs font-bold text-blue-600">{s.current_vendor}</td>
                         <td className="px-6 py-4 text-[10px] font-mono text-slate-400">{(s.lat || 0).toFixed(4)}, {(s.lng || 0).toFixed(4)}</td>
                         <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${s.status === SiteStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{s.status}</span></td>
                         <td className="px-6 py-4 text-right">
                           {isAdmin && (
                             <button onClick={(e) => { e.stopPropagation(); handleDeleteSite(s.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                           )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'track' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div className="flex justify-between items-center">
                 <div><h2 className="text-2xl font-bold text-slate-900">Milestone Tracking</h2><p className="text-slate-500 text-sm mt-1">Plan vs Actual project execution analysis</p></div>
                 <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                   <button onClick={() => setTrackView('table')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${trackView === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <TableIcon size={14}/> Spreadsheet
                   </button>
                   <button onClick={() => setTrackView('gantt')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${trackView === 'gantt' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <BarChart3 size={14}/> Gantt Chart
                   </button>
                 </div>
              </div>
              {trackView === 'table' ? <SpreadsheetTable sites={filteredSites} /> : <GanttChart sites={filteredSites} />}
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-8">
                  <div><h2 className="text-2xl font-bold text-slate-900">Batch Planning</h2><p className="text-slate-500 text-sm mt-1">Intelligent Local Offline Scheduler</p></div>
                  {isAdmin && <button onClick={handleAutoSchedule} disabled={scheduling} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50">{scheduling ? <Loader2 className="animate-spin" size={18}/> : <Calendar size={18}/>} Local Batch Plan</button>}
               </div>
               <div className="space-y-4">
                 {pendingSites.length === 0 ? (
                    <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                       <Calendar className="text-slate-200 mx-auto mb-4" size={48} />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No sites pending scheduling.</p>
                    </div>
                 ) : (
                   pendingSites.map(site => (
                    <div key={site.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-blue-500 transition-all cursor-pointer" onClick={() => handleOpenSite(site, 'view')}>
                      <div className="flex items-center gap-6"><div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">{site?.id?.slice(0,3) || '??'}</div><div><h4 className="font-bold text-slate-900">{site.name}</h4><div className="text-[10px] text-slate-400 font-bold uppercase">{site.id} • {site.region}</div></div></div>
                      <div className="flex items-center gap-8"><div className="text-right"><div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Deployment Date</div><div className="text-sm font-bold text-slate-700">{site.scheduled_date || 'TBD'}</div></div><button className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={18}/></button></div>
                    </div>
                   ))
                 )}
               </div>
            </div>
          )}

          {activeTab === 'actual' && (
            <div className="animate-in fade-in duration-500">
               <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900">Field Handover</h2><p className="text-slate-500 text-sm mt-1">Local procedure execution tracking</p></div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {sites.filter(s => s.status === SiteStatus.IN_PROGRESS).length === 0 ? (
                    <div className="lg:col-span-2 p-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                       <PlayCircle className="text-slate-200 mx-auto mb-4" size={48} />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active field operations detected.</p>
                    </div>
                  ) : (
                    sites.filter(s => s.status === SiteStatus.IN_PROGRESS).map(site => (
                      <div key={site.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center"><div><div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{site.id}</div><h3 className="text-xl font-bold mt-1">{site.name}</h3></div><div className="text-3xl font-black text-blue-500">{site.progress}%</div></div>
                        <div className="p-6 space-y-3">
                           {(site.tasks || []).map(task => (
                             <div key={task.id} onClick={() => handleTaskToggle(site.id, task.id)} className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer border transition-colors ${task.is_completed ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}>
                               <div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${task.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>{task.is_completed && <CheckCircle size={14}/>}</div><span className="text-sm font-medium">{task.label}</span></div>
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

          {activeTab === 'map' && <SiteMap sites={sites || []} onSiteClick={s => handleOpenSite(s, 'view')} />}

          {activeTab === 'ai' && isAdmin && (
            <div className="animate-in slide-in-from-right-4 duration-500">
               <div className="mb-8 flex items-center justify-between">
                  <div><h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><Cpu className="text-blue-600" size={28} /> Strategy Core</h2><p className="text-slate-500 text-sm mt-1">Advanced offline analysis of nodal telemetry</p></div>
                  <button onClick={handleRunAiAnalysis} disabled={loadingAi} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50">{loadingAi ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} />} Synthesize Data</button>
               </div>
               
               {loadingAi && (
                 <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-6" size={48} />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Engaging Cognitive Logic Engine...</h3>
                    <p className="text-sm text-slate-500">Calculating regional risk density and hardware dependency chains...</p>
                 </div>
               )}

               {aiAnalysis && !loadingAi && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                      <h4 className="font-bold text-lg text-blue-400 mb-6 flex items-center gap-2"><Terminal size={20}/> Technical Insights</h4>
                      <ul className="space-y-6">
                        {(aiAnalysis.strategicInsights || []).map((insight: string, idx: number) => (
                          <li key={idx} className="flex gap-4"><div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500"></div><p className="text-slate-300 text-sm leading-relaxed">{insight}</p></li>
                        ))}
                      </ul>
                      <div className="mt-10 pt-8 border-t border-white/10">
                         <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Risk Management Vectors</h5>
                         <div className="space-y-3">
                           {(aiAnalysis.riskMitigation || [])?.map((risk: string, i: number) => (
                             <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-xs text-slate-400 border border-white/5"><Info size={14} className="text-amber-500"/> {risk}</div>
                           ))}
                         </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white flex flex-col items-center justify-center text-center shadow-2xl">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Rollout Health Gradient</div>
                      <div className="text-8xl font-black mb-4 tracking-tighter">{aiAnalysis.projectHealth || '0%'}</div>
                      <div className="w-full max-w-xs bg-white/20 h-3 rounded-full overflow-hidden">
                        <div className="bg-white h-full transition-all duration-1000" style={{width: aiAnalysis.projectHealth || '0%'}}></div>
                      </div>
                      <p className="mt-6 text-[10px] font-black uppercase text-blue-100 tracking-[0.3em]">Computed via Local Cognitive Core</p>
                    </div>
                 </div>
               )}
               {!aiAnalysis && !loadingAi && (
                 <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                    <Cpu className="text-slate-200 mx-auto mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Strategy analysis idle. Run synthesis to generate report.</p>
                 </div>
               )}
            </div>
          )}
        </div>

        {selectedSite && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedSite(null)}></div>
            <div className="w-full max-w-2xl h-full bg-white shadow-2xl relative z-10 p-10 overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{modalMode === 'create' ? 'Register New Node' : 'Node Dossier'}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-widest">Ericsson-Globe Nationwide Swap Project</p>
                </div>
                <button onClick={() => { setSelectedSite(null); setFormData({}); }} className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors rounded-xl"><X size={20}/></button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Site Identifier</label><input disabled={modalMode !== 'create'} value={formData.id || ''} onChange={e=>setFormData({...formData, id:e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"/></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Node Name</label><input value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"/></div>
                </div>

                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><ListFilter size={14}/> Project Milestone Tracker (Plan vs Actual)</h4>
                    {isAdmin && (
                      <button 
                        onClick={handleSingleSiteAutoSchedule}
                        className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-200 shadow-sm"
                        title="Auto-fill planned dates based on standard Ericsson rollout offsets"
                      >
                        <Sparkles size={12}/> Auto-Fill Plan
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {(Object.keys(DEFAULT_MILESTONES) as Array<keyof SiteMilestones>).map((key) => (
                      <div key={key} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1"><span className="text-[8px] font-bold text-slate-400 uppercase">Planned</span><input type="date" value={formData.milestones?.[key]?.plan || ''} onChange={e => handleMilestoneChange(key, 'plan', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"/></div>
                          <div className="space-y-1"><span className="text-[8px] font-bold text-blue-400 uppercase">Actual</span><input type="date" value={formData.milestones?.[key]?.actual || ''} onChange={e => handleMilestoneChange(key, 'actual', e.target.value)} className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-mono"/></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pb-20">
                  <button onClick={handleSaveSite} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">Commit to Database</button>
                  <button onClick={() => { setSelectedSite(null); setFormData({}); }} className="px-6 bg-white border border-slate-200 py-4 rounded-2xl font-black hover:bg-slate-50 transition-colors text-slate-600">Cancel</button>
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
