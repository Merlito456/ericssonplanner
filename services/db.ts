
import { Site, User, UserRole, Equipment, DeploymentTask, Vendor, SiteStatus, RiskLevel } from "../types.ts";

const SITES_KEY = 'pg_sites_v1';
const EQUIP_KEY = 'pg_equipment_v1';
const TASKS_KEY = 'pg_tasks_v1';
const USERS_KEY = 'pg_users_v1';
const SESSION_KEY = 'pg_session_v1';

export class DatabaseService {
  private async delay(ms: number = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Relational Storage Mock ---
  async getSites(): Promise<Site[]> {
    await this.delay();
    const sitesRaw = localStorage.getItem(SITES_KEY);
    const equipRaw = localStorage.getItem(EQUIP_KEY);
    const tasksRaw = localStorage.getItem(TASKS_KEY);

    const sites: Site[] = sitesRaw ? JSON.parse(sitesRaw) : this.seedSites();
    const equipment: Equipment[] = equipRaw ? JSON.parse(equipRaw) : [];
    const tasks: DeploymentTask[] = tasksRaw ? JSON.parse(tasksRaw) : [];

    // Aggregate for frontend usage
    return sites.map(s => ({
      ...s,
      equipment: equipment.filter(e => e.site_id === s.id),
      tasks: tasks.filter(t => t.site_id === s.id)
    }));
  }

  async upsertSite(site: Site): Promise<void> {
    await this.delay();
    const sitesRaw = localStorage.getItem(SITES_KEY);
    let sites: Site[] = sitesRaw ? JSON.parse(sitesRaw) : [];

    // Separate relational data
    const { equipment, tasks, ...siteData } = site;
    
    // Update main site table
    const index = sites.findIndex(s => s.id === site.id);
    const updatedSite = { 
      ...siteData, 
      last_update: new Date().toISOString() 
    } as Site;

    if (index >= 0) sites[index] = updatedSite;
    else sites.push(updatedSite);

    localStorage.setItem(SITES_KEY, JSON.stringify(sites));

    // Update equipment table
    if (equipment) {
      const allEquipRaw = localStorage.getItem(EQUIP_KEY);
      let allEquip: Equipment[] = allEquipRaw ? JSON.parse(allEquipRaw) : [];
      // Replace equipment for this site
      allEquip = allEquip.filter(e => e.site_id !== site.id).concat(equipment);
      localStorage.setItem(EQUIP_KEY, JSON.stringify(allEquip));
    }

    // Update tasks table
    if (tasks) {
      const allTasksRaw = localStorage.getItem(TASKS_KEY);
      let allTasks: DeploymentTask[] = allTasksRaw ? JSON.parse(allTasksRaw) : [];
      allTasks = allTasks.filter(t => t.site_id !== site.id).concat(tasks);
      localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
    }
  }

  async deleteSite(id: string): Promise<void> {
    await this.delay();
    const sitesRaw = localStorage.getItem(SITES_KEY);
    if (!sitesRaw) return;
    const sites: Site[] = JSON.parse(sitesRaw);
    localStorage.setItem(SITES_KEY, JSON.stringify(sites.filter(s => s.id !== id)));
    
    // Cascade delete equipment and tasks
    const equip = JSON.parse(localStorage.getItem(EQUIP_KEY) || '[]');
    localStorage.setItem(EQUIP_KEY, JSON.stringify(equip.filter((e: Equipment) => e.site_id !== id)));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks.filter((t: DeploymentTask) => t.site_id !== id)));
  }

  private seedSites(): Site[] {
    const seeds: Site[] = [
      {
        id: 'MNL-GLOBE-001',
        name: 'Makati Central Hub',
        region: 'NCR',
        lat: 14.5547,
        lng: 121.0244,
        current_vendor: Vendor.HUAWEI,
        target_vendor: Vendor.ERICSSON,
        status: SiteStatus.IN_PROGRESS,
        risk_level: RiskLevel.Low,
        progress: 35,
        last_update: new Date().toISOString(),
        milestones: {
          survey: { plan: '2024-06-01', actual: '2024-06-02' },
          survey_report: { plan: '2024-06-05', actual: '2024-06-07' },
          installation: { plan: '2024-06-15', actual: '' },
          integration: { plan: '2024-06-20', actual: '' },
          completion_report: { plan: '2024-06-25', actual: '' },
          site_close: { plan: '2024-06-30', actual: '' },
        }
      }
    ];
    localStorage.setItem(SITES_KEY, JSON.stringify(seeds));
    return seeds;
  }

  async checkConnection(): Promise<boolean> {
    await this.delay(100);
    return true;
  }

  async login(email: string, password: string): Promise<User> {
    await this.delay(600);
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error("Invalid credentials.");
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    await this.delay(600);
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("User with this email already exists.");
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: UserRole.User,
      password
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  }

  logout() { localStorage.removeItem(SESSION_KEY); }
  getCurrentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  private getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    let users: any[] = data ? JSON.parse(data) : [];
    if (!users.some(u => u.email === 'admin@ericsson.com')) {
      users.push({ id: 'admin-001', name: 'Admin', email: 'admin@ericsson.com', role: UserRole.Admin, password: 'admin123' });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return users;
  }

  async clearDatabase() {
    localStorage.removeItem(SITES_KEY);
    localStorage.removeItem(EQUIP_KEY);
    localStorage.removeItem(TASKS_KEY);
  }
}

export const dbService = new DatabaseService();
