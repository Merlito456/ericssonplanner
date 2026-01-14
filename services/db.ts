
import { Site, User, UserRole } from "../types.ts";

const DB_KEY = 'ericsson_globe_planner_db_prod_v1';
const USERS_KEY = 'ericsson_globe_users_v1';
const SESSION_KEY = 'ericsson_session_v1';

/**
 * IDEMPOTENT SQL SCHEMA FOR BACKEND SETUP
 * 
 * -- 1. CREATE TYPES SAFELY
 * DO $$
 * BEGIN
 *     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
 *         CREATE TYPE user_role AS ENUM ('Admin', 'User');
 *     END IF;
 *     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'site_vendor') THEN
 *         CREATE TYPE site_vendor AS ENUM ('Huawei', 'Nokia', 'Ericsson');
 *     END IF;
 *     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'site_status') THEN
 *         CREATE TYPE site_status AS ENUM ('Pending', 'Surveyed', 'Planned', 'In Progress', 'Completed', 'Blocked');
 *     END IF;
 *     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
 *         CREATE TYPE risk_level AS ENUM ('Low', 'Medium', 'High');
 *     END IF;
 * END$$;
 * 
 * -- 2. CREATE TABLES
 * CREATE TABLE IF NOT EXISTS users (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     email VARCHAR(255) UNIQUE NOT NULL,
 *     name VARCHAR(100) NOT NULL,
 *     password_hash TEXT NOT NULL,
 *     role user_role DEFAULT 'User',
 *     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * CREATE TABLE IF NOT EXISTS sites (
 *     id VARCHAR(50) PRIMARY KEY, -- SITE ID
 *     name VARCHAR(255) NOT NULL, -- SITE NAME
 *     region VARCHAR(100) NOT NULL,
 *     lat DECIMAL(10, 8) NOT NULL,
 *     lng DECIMAL(11, 8) NOT NULL,
 *     current_vendor site_vendor NOT NULL,
 *     target_vendor site_vendor DEFAULT 'Ericsson',
 *     status site_status DEFAULT 'Pending',
 *     risk_level risk_level DEFAULT 'Low',
 *     progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
 *     scheduled_date DATE,
 *     last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 */

export class DatabaseService {
  private connectionString = "postgresql://postgres.hzcshylxfwqxoeovfimc:z2bkKiibM6UrjWkI@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

  private async delay(ms: number = 400) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Site Operations ---
  async getSites(): Promise<Site[]> {
    await this.delay();
    const data = localStorage.getItem(DB_KEY);
    if (!data) return [];
    return JSON.parse(data);
  }

  async upsertSite(site: Site): Promise<void> {
    await this.delay();
    const sites = await this.getSites();
    const index = sites.findIndex(s => s.id === site.id);
    if (index >= 0) {
      sites[index] = { ...site, lastUpdate: new Date().toISOString().split('T')[0] };
    } else {
      sites.push({ ...site, lastUpdate: new Date().toISOString().split('T')[0] });
    }
    localStorage.setItem(DB_KEY, JSON.stringify(sites));
  }

  async deleteSite(id: string): Promise<void> {
    await this.delay();
    const sites = await this.getSites();
    const filtered = sites.filter(s => s.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  }

  async clearDatabase(): Promise<void> {
    await this.delay();
    localStorage.setItem(DB_KEY, JSON.stringify([]));
  }

  // --- Auth Operations ---
  async register(name: string, email: string, password: string): Promise<User> {
    await this.delay(800);
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("User with this email already exists");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: email.toLowerCase().includes('admin@ericsson') ? UserRole.ADMIN : UserRole.USER,
      password
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  }

  async login(email: string, password: string): Promise<User> {
    await this.delay(800);
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error("Invalid credentials. Please check your email and password.");
    
    const { password: _, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser as User;
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  getCurrentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  private getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    let users: User[] = data ? JSON.parse(data) : [];
    
    const defaultAdminEmail = 'admin@ericsson.com';
    if (!users.some(u => u.email.toLowerCase() === defaultAdminEmail.toLowerCase())) {
      users.push({
        id: 'admin-root-001',
        name: 'Ericsson Admin',
        email: defaultAdminEmail,
        role: UserRole.ADMIN,
        password: 'admin123'
      });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    return users;
  }

  getConnectionInfo() {
    return {
      host: "aws-1-ap-south-1.pooler.supabase.com",
      project: "hzcshylxfwqxoeovfimc",
      pooler: "Active",
      tables: ["sites", "equipment", "users", "technical_instructions"]
    };
  }
}

export const dbService = new DatabaseService();
