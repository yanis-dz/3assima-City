import * as fs from "fs";
import * as path from "path";
import type {
  User, InsertUser,
  News, InsertNews,
  Staff, InsertStaff,
  Rule, InsertRule,
  Product, InsertProduct,
  Settings,
  Ticket, InsertTicket, TicketMessage, InsertTicketMessage,
  Faq, InsertFaq,
  Balance, Transaction, InsertTransaction,
  OAuthAccount, ApiKey, PendingOrder
} from "@shared/schema";

const DATA_DIR = path.join(process.cwd(), "server", "data");

function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return { nextId: 1 } as T;
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

interface UsersData {
  users: User[];
  nextId: number;
}

interface NewsData {
  news: News[];
  nextId: number;
}

interface StaffData {
  staff: Staff[];
  nextId: number;
}

interface RulesData {
  rules: Rule[];
  nextId: number;
}

interface ProductsData {
  products: Product[];
  nextId: number;
}

interface TicketsData {
  tickets: Ticket[];
  nextId: number;
}

interface TicketMessagesData {
  messages: TicketMessage[];
  nextId: number;
}

interface FaqsData {
  faqs: Faq[];
  nextId: number;
}

interface BalancesData {
  balances: Balance[];
}

interface TransactionsData {
  transactions: Transaction[];
  nextId: number;
}

interface OAuthAccountsData {
  accounts: OAuthAccount[];
  nextId: number;
}

interface ApiKeysData {
  keys: ApiKey[];
  nextId: number;
}

interface PendingOrdersData {
  orders: PendingOrder[];
}

export class JsonStorage {
  async getUsers(): Promise<User[]> {
    const data = readJson<UsersData>("users.json");
    return data.users || [];
  }
  async getAllUsers(): Promise<User[]> {
  const data = readJson<UsersData>("users.json");
  return data.users || [];
}

  async getUserById(id: number): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(u => u.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const data = readJson<UsersData>("users.json");
    const newUser: User = {
      ...user,
      id: data.nextId,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    data.nextId++;
    writeJson("users.json", data);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const data = readJson<UsersData>("users.json");
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    data.users[index] = { ...data.users[index], ...updates };
    writeJson("users.json", data);
    return data.users[index];
  }

  async deleteUser(id: number): Promise<boolean> {
    const data = readJson<UsersData>("users.json");
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    data.users.splice(index, 1);
    writeJson("users.json", data);
    return true;
  }

  async getNews(): Promise<News[]> {
    const data = readJson<NewsData>("news.json");
    return (data.news || []).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createNews(news: InsertNews): Promise<News> {
    const data = readJson<NewsData>("news.json");
    if (!data.news) data.news = [];
    const newNews: News = {
      ...news,
      id: data.nextId,
      createdAt: new Date().toISOString(),
    };
    data.news.push(newNews);
    data.nextId++;
    writeJson("news.json", data);
    return newNews;
  }

  async updateNews(id: number, updates: Partial<News>): Promise<News | undefined> {
    const data = readJson<NewsData>("news.json");
    const index = data.news.findIndex(n => n.id === id);
    if (index === -1) return undefined;
    data.news[index] = { ...data.news[index], ...updates };
    writeJson("news.json", data);
    return data.news[index];
  }

  async deleteNews(id: number): Promise<boolean> {
    const data = readJson<NewsData>("news.json");
    const index = data.news.findIndex(n => n.id === id);
    if (index === -1) return false;
    data.news.splice(index, 1);
    writeJson("news.json", data);
    return true;
  }

  async getStaff(): Promise<Staff[]> {
    const data = readJson<StaffData>("staff.json");
    return (data.staff || []).sort((a, b) => a.order - b.order);
  }

  async createStaff(staff: InsertStaff): Promise<Staff> {
    const data = readJson<StaffData>("staff.json");
    if (!data.staff) data.staff = [];
    const newStaff: Staff = {
      ...staff,
      id: data.nextId,
      order: data.staff.length + 1,
    };
    data.staff.push(newStaff);
    data.nextId++;
    writeJson("staff.json", data);
    return newStaff;
  }

  async updateStaff(id: number, updates: Partial<Staff>): Promise<Staff | undefined> {
    const data = readJson<StaffData>("staff.json");
    const index = data.staff.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    data.staff[index] = { ...data.staff[index], ...updates };
    writeJson("staff.json", data);
    return data.staff[index];
  }

  async deleteStaff(id: number): Promise<boolean> {
    const data = readJson<StaffData>("staff.json");
    const index = data.staff.findIndex(s => s.id === id);
    if (index === -1) return false;
    data.staff.splice(index, 1);
    writeJson("staff.json", data);
    return true;
  }

  async getRules(): Promise<Rule[]> {
    const data = readJson<RulesData>("rules.json");
    return data.rules || [];
  }

  async createRule(rule: InsertRule): Promise<Rule> {
    const data = readJson<RulesData>("rules.json");
    if (!data.rules) data.rules = [];
    const newRule: Rule = {
      ...rule,
      id: data.nextId,
    };
    data.rules.push(newRule);
    data.nextId++;
    writeJson("rules.json", data);
    return newRule;
  }

  async updateRule(id: number, updates: Partial<Rule>): Promise<Rule | undefined> {
    const data = readJson<RulesData>("rules.json");
    const index = data.rules.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    data.rules[index] = { ...data.rules[index], ...updates };
    writeJson("rules.json", data);
    return data.rules[index];
  }

  async deleteRule(id: number): Promise<boolean> {
    const data = readJson<RulesData>("rules.json");
    const index = data.rules.findIndex(r => r.id === id);
    if (index === -1) return false;
    data.rules.splice(index, 1);
    writeJson("rules.json", data);
    return true;
  }

  async getProducts(): Promise<Product[]> {
    const data = readJson<ProductsData>("store.json");
    return data.products || [];
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const data = readJson<ProductsData>("store.json");
    if (!data.products) data.products = [];
    const newProduct: Product = {
      ...product,
      id: data.nextId,
      type: product.type || "item",
      currency: product.currency || "game_money",
      discount: product.discount || 0,
      imageUrl: product.imageUrl || null,
      inStock: product.inStock ?? true
    };
    data.products.push(newProduct);
    data.nextId++;
    writeJson("store.json", data);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const data = readJson<ProductsData>("store.json");
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    data.products[index] = { ...data.products[index], ...updates };
    writeJson("store.json", data);
    return data.products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const data = readJson<ProductsData>("store.json");
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    data.products.splice(index, 1);
    writeJson("store.json", data);
    return true;
  }

  async getSettings(): Promise<Settings> {
    const data = readJson<Settings>("settings.json");
    return {
      serverName: data.serverName || "Assima City",
      serverNameAr: data.serverNameAr || "Assima City للحياة الواقعية",
      serverIp: data.serverIp || "109.176.229.142:22003",
      discordLink: data.discordLink || "",
      forumLink: data.forumLink || "",
      heroTitle: data.heroTitle || "Assima City",
      heroSubtitle: data.heroSubtitle || "انضم إلى سيرفرنا واستمتع بأفضل تجربة لعب حياة واقعية",
      footerText: data.footerText || "أفضل تجربة لعب حياة واقعية في MTA",
    };
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    writeJson("settings.json", updated);
    return updated;
  }

  async getTickets(): Promise<Ticket[]> {
    const data = readJson<TicketsData>("tickets.json");
    return (data.tickets || []).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    const tickets = await this.getTickets();
    return tickets.filter(t => t.userId === userId);
  }

  async getTicketById(id: number): Promise<Ticket | undefined> {
    const tickets = await this.getTickets();
    return tickets.find(t => t.id === id);
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const data = readJson<TicketsData>("tickets.json");
    if (!data.tickets) data.tickets = [];
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      ...ticket,
      id: data.nextId || 1,
      status: "open",
      adminResponse: null,
      createdAt: now,
      updatedAt: now,
    };
    data.tickets.push(newTicket);
    data.nextId = (data.nextId || 1) + 1;
    writeJson("tickets.json", data);
    return newTicket;
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const data = readJson<TicketsData>("tickets.json");
    if (!data.tickets) return undefined;
    const index = data.tickets.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    data.tickets[index] = {
      ...data.tickets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeJson("tickets.json", data);
    return data.tickets[index];
  }

  async deleteTicket(id: number): Promise<boolean> {
    const data = readJson<TicketsData>("tickets.json");
    if (!data.tickets) return false;
    const index = data.tickets.findIndex(t => t.id === id);
    if (index === -1) return false;
    data.tickets.splice(index, 1);
    writeJson("tickets.json", data);
    return true;
  }

  async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    const data = readJson<TicketMessagesData>("ticket_messages.json");
    return (data.messages || []).filter(m => m.ticketId === ticketId).sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async createTicketMessage(message: Omit<TicketMessage, "id" | "createdAt">): Promise<TicketMessage> {
    const data = readJson<TicketMessagesData>("ticket_messages.json");
    if (!data.messages) data.messages = [];
    const newMessage: TicketMessage = {
      ...message,
      id: data.nextId || 1,
      createdAt: new Date().toISOString(),
    };
    data.messages.push(newMessage);
    data.nextId = (data.nextId || 1) + 1;
    writeJson("ticket_messages.json", data);
    return newMessage;
  }

  async getFaqs(): Promise<Faq[]> {
    const data = readJson<FaqsData>("faqs.json");
    return (data.faqs || []).sort((a, b) => a.order - b.order);
  }

  async getFaqsByCategory(category: string): Promise<Faq[]> {
    const faqs = await this.getFaqs();
    return faqs.filter(f => f.category === category);
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const data = readJson<FaqsData>("faqs.json");
    if (!data.faqs) data.faqs = [];
    const newFaq: Faq = {
      ...faq,
      id: data.nextId || 1,
      order: data.faqs.length + 1,
    };
    data.faqs.push(newFaq);
    data.nextId = (data.nextId || 1) + 1;
    writeJson("faqs.json", data);
    return newFaq;
  }

  async updateFaq(id: number, updates: Partial<Faq>): Promise<Faq | undefined> {
    const data = readJson<FaqsData>("faqs.json");
    if (!data.faqs) return undefined;
    const index = data.faqs.findIndex(f => f.id === id);
    if (index === -1) return undefined;
    data.faqs[index] = { ...data.faqs[index], ...updates };
    writeJson("faqs.json", data);
    return data.faqs[index];
  }

  async deleteFaq(id: number): Promise<boolean> {
    const data = readJson<FaqsData>("faqs.json");
    if (!data.faqs) return false;
    const index = data.faqs.findIndex(f => f.id === id);
    if (index === -1) return false;
    data.faqs.splice(index, 1);
    writeJson("faqs.json", data);
    return true;
  }

  async getBalance(userId: number): Promise<Balance> {
    const data = readJson<BalancesData>("balances.json");
    if (!data.balances) data.balances = [];
    const balance = data.balances.find(b => b.userId === userId);
    if (!balance) {
      return { userId, usd: 0, sar: 0, points: 0 };
    }
    return balance;
  }

  async updateBalance(userId: number, updates: Partial<Balance>): Promise<Balance> {
    const data = readJson<BalancesData>("balances.json");
    if (!data.balances) data.balances = [];
    const index = data.balances.findIndex(b => b.userId === userId);
    if (index === -1) {
      const newBalance: Balance = { userId, usd: 0, sar: 0, points: 0, ...updates };
      data.balances.push(newBalance);
      writeJson("balances.json", data);
      return newBalance;
    }
    data.balances[index] = { ...data.balances[index], ...updates };
    writeJson("balances.json", data);
    return data.balances[index];
  }

  async addToBalance(userId: number, currency: "usd" | "sar" | "points", amount: number): Promise<Balance> {
    const balance = await this.getBalance(userId);
    const newAmount = balance[currency] + amount;
    return this.updateBalance(userId, { [currency]: newAmount });
  }

  async getTransactions(userId?: number): Promise<Transaction[]> {
    const data = readJson<TransactionsData>("transactions.json");
    if (!data.transactions) return [];
    if (userId) {
      return data.transactions.filter(t => t.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return data.transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const data = readJson<TransactionsData>("transactions.json");
    if (!data.transactions) data.transactions = [];
    const newTransaction: Transaction = {
      ...transaction,
      id: data.nextId || 1,
      createdAt: new Date().toISOString(),
    };
    data.transactions.push(newTransaction);
    data.nextId = (data.nextId || 1) + 1;
    writeJson("transactions.json", data);
    return newTransaction;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const data = readJson<TransactionsData>("transactions.json");
    if (!data.transactions) return undefined;
    const index = data.transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    data.transactions[index] = { ...data.transactions[index], ...updates };
    writeJson("transactions.json", data);
    return data.transactions[index];
  }

  async getOAuthAccounts(userId: number): Promise<OAuthAccount[]> {
    const data = readJson<OAuthAccountsData>("oauth_accounts.json");
    if (!data.accounts) return [];
    return data.accounts.filter(a => a.userId === userId);
  }

  async getOAuthAccountByProvider(provider: string, providerId: string): Promise<OAuthAccount | undefined> {
    const data = readJson<OAuthAccountsData>("oauth_accounts.json");
    if (!data.accounts) return undefined;
    return data.accounts.find(a => a.provider === provider && a.providerId === providerId);
  }

  async createOAuthAccount(account: Omit<OAuthAccount, "id" | "createdAt">): Promise<OAuthAccount> {
    const data = readJson<OAuthAccountsData>("oauth_accounts.json");
    if (!data.accounts) data.accounts = [];
    const newAccount: OAuthAccount = {
      ...account,
      id: data.nextId || 1,
      createdAt: new Date().toISOString(),
    };
    data.accounts.push(newAccount);
    data.nextId = (data.nextId || 1) + 1;
    writeJson("oauth_accounts.json", data);
    return newAccount;
  }

  async updateOAuthAccount(id: number, updates: Partial<OAuthAccount>): Promise<OAuthAccount | undefined> {
    const data = readJson<OAuthAccountsData>("oauth_accounts.json");
    if (!data.accounts) return undefined;
    const index = data.accounts.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    data.accounts[index] = { ...data.accounts[index], ...updates };
    writeJson("oauth_accounts.json", data);
    return data.accounts[index];
  }

  async deleteOAuthAccount(id: number): Promise<boolean> {
    const data = readJson<OAuthAccountsData>("oauth_accounts.json");
    if (!data.accounts) return false;
    const index = data.accounts.findIndex(a => a.id === id);
    if (index === -1) return false;
    data.accounts.splice(index, 1);
    writeJson("oauth_accounts.json", data);
    return true;
  }

  async getApiKeys(): Promise<ApiKey[]> {
    const data = readJson<ApiKeysData>("api_keys.json");
    return data.keys || [];
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const keys = await this.getApiKeys();
    return keys.find(k => k.key === key && k.isActive);
  }

  async createApiKey(apiKey: Omit<ApiKey, "id" | "createdAt" | "lastUsed">): Promise<ApiKey> {
    const data = readJson<ApiKeysData>("api_keys.json");
    if (!data.keys) data.keys = [];
    const newKey: ApiKey = {
      ...apiKey,
      id: data.nextId || 1,
      lastUsed: null,
      createdAt: new Date().toISOString(),
    };
    data.keys.push(newKey);
    data.nextId = (data.nextId || 1) + 1;
    writeJson("api_keys.json", data);
    return newKey;
  }

  async updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const data = readJson<ApiKeysData>("api_keys.json");
    if (!data.keys) return undefined;
    const index = data.keys.findIndex(k => k.id === id);
    if (index === -1) return undefined;
    data.keys[index] = { ...data.keys[index], ...updates };
    writeJson("api_keys.json", data);
    return data.keys[index];
  }

  async deleteApiKey(id: number): Promise<boolean> {
    const data = readJson<ApiKeysData>("api_keys.json");
    if (!data.keys) return false;
    const index = data.keys.findIndex(k => k.id === id);
    if (index === -1) return false;
    data.keys.splice(index, 1);
    writeJson("api_keys.json", data);
    return true;
  }

  async getPendingOrder(orderId: string): Promise<PendingOrder | undefined> {
    const data = readJson<PendingOrdersData>("pending_orders.json");
    return (data.orders || []).find(o => o.orderId === orderId);
  }

  async createPendingOrder(order: Omit<PendingOrder, "createdAt">): Promise<PendingOrder> {
    const data = readJson<PendingOrdersData>("pending_orders.json");
    if (!data.orders) data.orders = [];
    const newOrder: PendingOrder = {
      ...order,
      createdAt: new Date().toISOString(),
    };
    data.orders.push(newOrder);
    writeJson("pending_orders.json", data);
    return newOrder;
  }

  async updatePendingOrder(orderId: string, updates: Partial<PendingOrder>): Promise<PendingOrder | undefined> {
    const data = readJson<PendingOrdersData>("pending_orders.json");
    if (!data.orders) return undefined;
    const index = data.orders.findIndex(o => o.orderId === orderId);
    if (index === -1) return undefined;
    data.orders[index] = { ...data.orders[index], ...updates };
    writeJson("pending_orders.json", data);
    return data.orders[index];
  }
}

export const storage = new JsonStorage();

// Helper to keep data files in sync
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const files = [
    "users.json", "news.json", "staff.json", "rules.json",
    "products.json", "tickets.json", "ticket_messages.json", "faqs.json", "balances.json",
    "transactions.json", "oauth_accounts.json", "api_keys.json", "pending_orders.json", "settings.json"
  ];

  files.forEach(file => {
    if (!fs.existsSync(path.join(DATA_DIR, file))) {
      if (file === "settings.json") {
        fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify({
          serverName: "MTA Server",
          serverIp: "127.0.0.1:22003",
          maintenanceMode: false,
          discordUrl: "",
          storeEnabled: true
        }, null, 2));
      } else if (file === "balances.json") {
        fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify({ balances: [] }, null, 2));
      } else if (file === "pending_orders.json") {
        fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify({ orders: [] }, null, 2));
      } else {
        fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify({ [file.split('.')[0]]: [], nextId: 1 }, null, 2));
      }
    }
  });
}

ensureDataFiles();
