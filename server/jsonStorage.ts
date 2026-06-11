import mysql from "mysql2/promise";
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

// =============================================
// اتصال قاعدة البيانات
// =============================================
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

async function query(sql: string, params: any[] = []): Promise<any> {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// =============================================
// إنشاء الجداول تلقائياً
// =============================================
async function initTables() {
  await query(`CREATE TABLE IF NOT EXISTS site_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    fullName VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    avatarUrl TEXT,
    discordId VARCHAR(255),
    discordUsername VARCHAR(255),
    discordAvatarUrl TEXT,
    mtaUsername VARCHAR(255),
    mtaLinkCode VARCHAR(50),
    createdAt DATETIME DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255),
    imageUrl TEXT,
    createdAt DATETIME DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    avatarUrl TEXT,
    \`order\` INT DEFAULT 0
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255)
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    imageUrl TEXT,
    category VARCHAR(255),
    inStock BOOLEAN DEFAULT TRUE,
    currency VARCHAR(50) DEFAULT 'game_money',
    discount INT DEFAULT 0,
    type VARCHAR(50) DEFAULT 'item'
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    serverName VARCHAR(255),
    serverNameAr VARCHAR(255),
    serverIp VARCHAR(255),
    discordLink TEXT,
    forumLink TEXT,
    heroTitle VARCHAR(255),
    heroSubtitle TEXT,
    footerText TEXT
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open',
    adminResponse TEXT,
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_ticket_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticketId INT NOT NULL,
    userId INT NOT NULL,
    message TEXT NOT NULL,
    isAdmin BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(255),
    \`order\` INT DEFAULT 0
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_balances (
    userId INT PRIMARY KEY,
    usd DECIMAL(10,2) DEFAULT 0,
    sar DECIMAL(10,2) DEFAULT 0,
    points INT DEFAULT 0
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type VARCHAR(50),
    amount DECIMAL(10,2),
    currency VARCHAR(50),
    description TEXT,
    status VARCHAR(50),
    createdAt DATETIME DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_oauth_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    providerId VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    avatarUrl TEXT,
    createdAt DATETIME DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    key_value VARCHAR(255) UNIQUE NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    lastUsed DATETIME,
    createdAt DATETIME DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS site_pending_orders (
    orderId VARCHAR(255) PRIMARY KEY,
    userId INT,
    productId INT,
    amount DECIMAL(10,2),
    currency VARCHAR(50),
    status VARCHAR(50),
    createdAt DATETIME DEFAULT NOW()
  )`);

  // إضافة إعدادات افتراضية إذا ما كانت موجودة
  const settings = await query(`SELECT id FROM site_settings WHERE id = 1`);
  if (!settings.length) {
    await query(`INSERT INTO site_settings (id, serverName, serverNameAr, serverIp, discordLink, heroTitle, heroSubtitle, footerText)
      VALUES (1, 'Assima City', 'عاصمة سيتي', '82.22.174.127:22011', 'https://discord.gg/kZyMWTawKY', 'Assima City', 'انضم إلى سيرفرنا واستمتع بأفضل تجربة لعب حياة واقعية', 'أفضل تجربة لعب حياة واقعية في MTA')`);
  }

  console.log("[MySQL] Tables initialized successfully");
}

initTables().catch(console.error);

// =============================================
// Storage Class
// =============================================
export class JsonStorage {

  // USERS
  async getUsers(): Promise<User[]> {
    return query(`SELECT * FROM site_users`);
  }
  async getAllUsers(): Promise<User[]> {
    return query(`SELECT * FROM site_users`);
  }
  async getUserById(id: number): Promise<User | undefined> {
    const rows = await query(`SELECT * FROM site_users WHERE id = ?`, [id]);
    return rows[0];
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const rows = await query(`SELECT * FROM site_users WHERE email = ?`, [email]);
    return rows[0];
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const rows = await query(`SELECT * FROM site_users WHERE username = ?`, [username]);
    return rows[0];
  }
  async createUser(user: InsertUser): Promise<User> {
    const result = await query(
      `INSERT INTO site_users (username, email, password, role) VALUES (?, ?, ?, ?)`,
      [user.username, user.email, user.password, (user as any).role || 'user']
    );
    return this.getUserById(result.insertId) as Promise<User>;
  }
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    if (!fields) return this.getUserById(id);
    await query(`UPDATE site_users SET ${fields} WHERE id = ?`, [...values, id]);
    return this.getUserById(id);
  }
  async deleteUser(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM site_users WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // NEWS
  async getNews(): Promise<News[]> {
    return query(`SELECT * FROM site_news ORDER BY createdAt DESC`);
  }
  async createNews(news: InsertNews): Promise<News> {
    const result = await query(
      `INSERT INTO site_news (title, content, author, imageUrl) VALUES (?, ?, ?, ?)`,
      [news.title, news.content, news.author, news.imageUrl]
    );
    const rows = await query(`SELECT * FROM site_news WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
  async updateNews(id: number, updates: Partial<News>): Promise<News | undefined> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_news SET ${fields} WHERE id = ?`, [...values, id]);
    const rows = await query(`SELECT * FROM site_news WHERE id = ?`, [id]);
    return rows[0];
  }
  async deleteNews(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM site_news WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // STAFF
  async getStaff(): Promise<Staff[]> {
    return query(`SELECT * FROM site_staff ORDER BY \`order\` ASC`);
  }
  async createStaff(staff: InsertStaff): Promise<Staff> {
    const result = await query(
      `INSERT INTO site_staff (username, role, avatarUrl, \`order\`) VALUES (?, ?, ?, ?)`,
      [staff.username, staff.role, staff.avatarUrl, (staff as any).order || 0]
    );
    const rows = await query(`SELECT * FROM site_staff WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
  async updateStaff(id: number, updates: Partial<Staff>): Promise<Staff | undefined> {
    const fields = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_staff SET ${fields} WHERE id = ?`, [...values, id]);
    const rows = await query(`SELECT * FROM site_staff WHERE id = ?`, [id]);
    return rows[0];
  }
  async deleteStaff(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM site_staff WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // RULES
  async getRules(): Promise<Rule[]> {
    return query(`SELECT * FROM site_rules`);
  }
  async createRule(rule: InsertRule): Promise<Rule> {
    const result = await query(
      `INSERT INTO site_rules (title, description, category) VALUES (?, ?, ?)`,
      [rule.title, rule.description, rule.category]
    );
    const rows = await query(`SELECT * FROM site_rules WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
  async updateRule(id: number, updates: Partial<Rule>): Promise<Rule | undefined> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_rules SET ${fields} WHERE id = ?`, [...values, id]);
    const rows = await query(`SELECT * FROM site_rules WHERE id = ?`, [id]);
    return rows[0];
  }
  async deleteRule(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM site_rules WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    return query(`SELECT * FROM site_products`);
  }
  async getProductById(id: number): Promise<Product | undefined> {
    const rows = await query(`SELECT * FROM site_products WHERE id = ?`, [id]);
    return rows[0];
  }
  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await query(
      `INSERT INTO site_products (name, description, price, imageUrl, category, inStock, currency, discount, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product.name, product.description, product.price, product.imageUrl, product.category, product.inStock ?? true, product.currency || 'game_money', product.discount || 0, (product as any).type || 'item']
    );
    return this.getProductById(result.insertId) as Promise<Product>;
  }
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_products SET ${fields} WHERE id = ?`, [...values, id]);
    return this.getProductById(id);
  }
  async deleteProduct(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM site_products WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // SETTINGS
  async getSettings(): Promise<Settings> {
    const rows = await query(`SELECT * FROM site_settings WHERE id = 1`);
    if (!rows.length) {
      return {
        serverName: "Assima City",
        serverNameAr: "عاصمة سيتي",
        serverIp: "82.22.174.127:22011",
        discordLink: "https://discord.gg/kZyMWTawKY",
        forumLink: "",
        heroTitle: "Assima City",
        heroSubtitle: "انضم إلى سيرفرنا واستمتع بأفضل تجربة لعب حياة واقعية",
        footerText: "أفضل تجربة لعب حياة واقعية في MTA",
      };
    }
    return rows[0];
  }
  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const fields = Object.keys(settings).map(k => `${k} = ?`).join(', ');
    const values = Object.values(settings);
    await query(`UPDATE site_settings SET ${fields} WHERE id = 1`, values);
    return this.getSettings();
  }

  // TICKETS
  async getTickets(): Promise<Ticket[]> {
    return query(`SELECT * FROM site_tickets ORDER BY createdAt DESC`);
  }
  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    return query(`SELECT * FROM site_tickets WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
  }
  async getTicketById(id: number): Promise<Ticket | undefined> {
    const rows = await query(`SELECT * FROM site_tickets WHERE id = ?`, [id]);
    return rows[0];
  }
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const result = await query(
      `INSERT INTO site_tickets (userId, subject, message, category) VALUES (?, ?, ?, ?)`,
      [ticket.userId, ticket.subject, ticket.message, ticket.category]
    );
    return this.getTicketById(result.insertId) as Promise<Ticket>;
  }
  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_tickets SET ${fields}, updatedAt = NOW() WHERE id = ?`, [...values, id]);
    return this.getTicketById(id);
  }
  async deleteTicket(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM site_tickets WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // TICKET MESSAGES
  async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    return query(`SELECT * FROM site_ticket_messages WHERE ticketId = ? ORDER BY createdAt ASC`, [ticketId]);
  }
  async createTicketMessage(message: Omit<TicketMessage, "id" | "createdAt">): Promise<TicketMessage> {
    const result = await query(
      `INSERT INTO site_ticket_messages (ticketId, userId, message, isAdmin) VALUES (?, ?, ?, ?)`,
      [message.ticketId, message.userId, message.message, message.isAdmin || false]
    );
    const rows = await query(`SELECT * FROM site_ticket_messages WHERE id = ?`, [result.insertId]);
    return rows[0];
  }

  // FAQS
  async getFaqs(): Promise<Faq[]> {
    return query(`SELECT * FROM site_faqs ORDER BY \`order\` ASC`);
  }
  async getFaqsByCategory(category: string): Promise<Faq[]> {
    return query(`SELECT * FROM site_faqs WHERE category = ? ORDER BY \`order\` ASC`, [category]);
  }
  async createFaq(faq: InsertFaq): Promise<Faq> {
    const count = await query(`SELECT COUNT(*) as cnt FROM site_faqs`);
    const result = await query(
      `INSERT INTO site_faqs (question, answer, category, \`order\`) VALUES (?, ?, ?, ?)`,
      [faq.question, faq.answer, faq.category, count[0].cnt + 1]
    );
    const rows = await query(`SELECT * FROM site_faqs WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
  async updateFaq(id: number, updates: Partial<Faq>): Promise<Faq | undefined> {
    const fields = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_faqs SET ${fields} WHERE id = ?`, [...values, id]);
    const rows = await query(`SELECT * FROM site_faqs WHERE id = ?`, [id]);
    return rows[0];
  }
  async deleteFaq(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM site_faqs WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // BALANCES
  async getBalance(userId: number): Promise<Balance> {
    const rows = await query(`SELECT * FROM site_balances WHERE userId = ?`, [userId]);
    if (!rows.length) return { userId, usd: 0, sar: 0, points: 0 };
    return rows[0];
  }
  async updateBalance(userId: number, updates: Partial<Balance>): Promise<Balance> {
    const existing = await query(`SELECT userId FROM site_balances WHERE userId = ?`, [userId]);
    if (!existing.length) {
      await query(`INSERT INTO site_balances (userId, usd, sar, points) VALUES (?, ?, ?, ?)`,
        [userId, updates.usd || 0, updates.sar || 0, updates.points || 0]);
    } else {
      const fields = Object.keys(updates).filter(k => k !== 'userId').map(k => `${k} = ?`).join(', ');
      const values = Object.entries(updates).filter(([k]) => k !== 'userId').map(([, v]) => v);
      if (fields) await query(`UPDATE site_balances SET ${fields} WHERE userId = ?`, [...values, userId]);
    }
    return this.getBalance(userId);
  }
  async addToBalance(userId: number, currency: "usd" | "sar" | "points", amount: number): Promise<Balance> {
    const balance = await this.getBalance(userId);
    return this.updateBalance(userId, { [currency]: balance[currency] + amount });
  }

  // TRANSACTIONS
  async getTransactions(userId?: number): Promise<Transaction[]> {
    if (userId) return query(`SELECT * FROM site_transactions WHERE userId = ? ORDER BY createdAt DESC`, [userId]);
    return query(`SELECT * FROM site_transactions ORDER BY createdAt DESC`);
  }
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await query(
      `INSERT INTO site_transactions (userId, type, amount, currency, description, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [transaction.userId, transaction.type, transaction.amount, transaction.currency, transaction.description, transaction.status]
    );
    const rows = await query(`SELECT * FROM site_transactions WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_transactions SET ${fields} WHERE id = ?`, [...values, id]);
    const rows = await query(`SELECT * FROM site_transactions WHERE id = ?`, [id]);
    return rows[0];
  }

  // OAUTH ACCOUNTS
  async getOAuthAccounts(userId: number): Promise<OAuthAccount[]> {
    return query(`SELECT * FROM site_oauth_accounts WHERE userId = ?`, [userId]);
  }
  async getOAuthAccountByProvider(provider: string, providerId: string): Promise<OAuthAccount | undefined> {
    const rows = await query(`SELECT * FROM site_oauth_accounts WHERE provider = ? AND providerId = ?`, [provider, providerId]);
    return rows[0];
  }
  async createOAuthAccount(account: Omit<OAuthAccount, "id" | "createdAt">): Promise<OAuthAccount> {
    const result = await query(
      `INSERT INTO site_oauth_accounts (userId, provider, providerId, username, avatarUrl) VALUES (?, ?, ?, ?, ?)`,
      [account.userId, account.provider, account.providerId, account.username, account.avatarUrl]
    );
    const rows = await query(`SELECT * FROM site_oauth_accounts WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
  async updateOAuthAccount(id: number, updates: Partial<OAuthAccount>): Promise<OAuthAccount | undefined> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_oauth_accounts SET ${fields} WHERE id = ?`, [...values, id]);
    const rows = await query(`SELECT * FROM site_oauth_accounts WHERE id = ?`, [id]);
    return rows[0];
  }
  async deleteOAuthAccount(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM site_oauth_accounts WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // API KEYS
  async getApiKeys(): Promise<ApiKey[]> {
    return query(`SELECT * FROM site_api_keys`);
  }
  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const rows = await query(`SELECT * FROM site_api_keys WHERE key_value = ? AND isActive = TRUE`, [key]);
    return rows[0];
  }
  async createApiKey(apiKey: Omit<ApiKey, "id" | "createdAt" | "lastUsed">): Promise<ApiKey> {
    const result = await query(
      `INSERT INTO site_api_keys (name, key_value, isActive) VALUES (?, ?, ?)`,
      [apiKey.name, (apiKey as any).key, apiKey.isActive ?? true]
    );
    const rows = await query(`SELECT * FROM site_api_keys WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
  async updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_api_keys SET ${fields} WHERE id = ?`, [...values, id]);
    const rows = await query(`SELECT * FROM site_api_keys WHERE id = ?`, [id]);
    return rows[0];
  }
  async deleteApiKey(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM site_api_keys WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  // PENDING ORDERS
  async getPendingOrder(orderId: string): Promise<PendingOrder | undefined> {
    const rows = await query(`SELECT * FROM site_pending_orders WHERE orderId = ?`, [orderId]);
    return rows[0];
  }
  async createPendingOrder(order: Omit<PendingOrder, "createdAt">): Promise<PendingOrder> {
    await query(
      `INSERT INTO site_pending_orders (orderId, userId, productId, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [order.orderId, (order as any).userId, (order as any).productId, (order as any).amount, (order as any).currency, (order as any).status]
    );
    return this.getPendingOrder(order.orderId) as Promise<PendingOrder>;
  }
  async updatePendingOrder(orderId: string, updates: Partial<PendingOrder>): Promise<PendingOrder | undefined> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    await query(`UPDATE site_pending_orders SET ${fields} WHERE orderId = ?`, [...values, orderId]);
    return this.getPendingOrder(orderId);
  }
}

export const storage = new JsonStorage();
