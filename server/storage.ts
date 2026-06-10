import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
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
import * as schema from "@shared/schema";

export class DatabaseStorage {
  // --- Users ---
  async getUsers(): Promise<User[]> {
    return db.select().from(schema.users);
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [res] = await db.insert(schema.users).values(user);
    return this.getUserById(res.insertId) as Promise<User>;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    await db.update(schema.users).set(updates).where(eq(schema.users.id, id));
    return this.getUserById(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const [res] = await db.delete(schema.users).where(eq(schema.users.id, id));
    return res.affectedRows > 0;
  }

  // --- News ---
  async getNews(): Promise<News[]> {
    return db.select().from(schema.news).orderBy(desc(schema.news.createdAt));
  }

  async createNews(news: InsertNews): Promise<News> {
    const [res] = await db.insert(schema.news).values(news);
    const [item] = await db.select().from(schema.news).where(eq(schema.news.id, res.insertId));
    return item;
  }

  async updateNews(id: number, updates: Partial<News>): Promise<News | undefined> {
    await db.update(schema.news).set(updates).where(eq(schema.news.id, id));
    const [item] = await db.select().from(schema.news).where(eq(schema.news.id, id));
    return item;
  }

  async deleteNews(id: number): Promise<boolean> {
    const [res] = await db.delete(schema.news).where(eq(schema.news.id, id));
    return res.affectedRows > 0;
  }

  // --- Staff ---
  async getStaff(): Promise<Staff[]> {
    return db.select().from(schema.staff).orderBy(schema.staff.order);
  }

  async createStaff(staff: InsertStaff): Promise<Staff> {
    const allStaff = await this.getStaff();
    const order = allStaff.length + 1;
    const [res] = await db.insert(schema.staff).values({ ...staff, order });
    const [item] = await db.select().from(schema.staff).where(eq(schema.staff.id, res.insertId));
    return item;
  }

  async updateStaff(id: number, updates: Partial<Staff>): Promise<Staff | undefined> {
    await db.update(schema.staff).set(updates).where(eq(schema.staff.id, id));
    const [item] = await db.select().from(schema.staff).where(eq(schema.staff.id, id));
    return item;
  }

  async deleteStaff(id: number): Promise<boolean> {
    const [res] = await db.delete(schema.staff).where(eq(schema.staff.id, id));
    return res.affectedRows > 0;
  }

  // --- Rules ---
  async getRules(): Promise<Rule[]> {
    return db.select().from(schema.rules);
  }

  async createRule(rule: InsertRule): Promise<Rule> {
    const [res] = await db.insert(schema.rules).values(rule);
    const [item] = await db.select().from(schema.rules).where(eq(schema.rules.id, res.insertId));
    return item;
  }

  async updateRule(id: number, updates: Partial<Rule>): Promise<Rule | undefined> {
    await db.update(schema.rules).set(updates).where(eq(schema.rules.id, id));
    const [item] = await db.select().from(schema.rules).where(eq(schema.rules.id, id));
    return item;
  }

  async deleteRule(id: number): Promise<boolean> {
    const [res] = await db.delete(schema.rules).where(eq(schema.rules.id, id));
    return res.affectedRows > 0;
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    return db.select().from(schema.products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [item] = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return item;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [res] = await db.insert(schema.products).values(product);
    return this.getProductById(res.insertId) as Promise<Product>;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    await db.update(schema.products).set(updates).where(eq(schema.products.id, id));
    return this.getProductById(id);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [res] = await db.delete(schema.products).where(eq(schema.products.id, id));
    return res.affectedRows > 0;
  }

  // --- Settings ---
  async getSettings(): Promise<Settings> {
    const [item] = await db.select().from(schema.settings).limit(1);
    if (!item) {
      const [res] = await db.insert(schema.settings).values({});
      const [newItem] = await db.select().from(schema.settings).where(eq(schema.settings.id, res.insertId));
      return newItem;
    }
    return item;
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const [item] = await db.select().from(schema.settings).limit(1);
    if (!item) {
      const [res] = await db.insert(schema.settings).values(updates);
      const [newItem] = await db.select().from(schema.settings).where(eq(schema.settings.id, res.insertId));
      return newItem;
    } else {
      await db.update(schema.settings).set(updates).where(eq(schema.settings.id, item.id));
      const [updatedItem] = await db.select().from(schema.settings).where(eq(schema.settings.id, item.id));
      return updatedItem;
    }
  }

  // --- Tickets ---
  async getTickets(): Promise<Ticket[]> {
    return db.select().from(schema.tickets).orderBy(desc(schema.tickets.createdAt));
  }

  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    return db.select().from(schema.tickets).where(eq(schema.tickets.userId, userId)).orderBy(desc(schema.tickets.createdAt));
  }

  async getTicketById(id: number): Promise<Ticket | undefined> {
    const [item] = await db.select().from(schema.tickets).where(eq(schema.tickets.id, id));
    return item;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [res] = await db.insert(schema.tickets).values(ticket);
    return this.getTicketById(res.insertId) as Promise<Ticket>;
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    await db.update(schema.tickets).set({ ...updates, updatedAt: new Date() }).where(eq(schema.tickets.id, id));
    return this.getTicketById(id);
  }

  async deleteTicket(id: number): Promise<boolean> {
    const [res] = await db.delete(schema.tickets).where(eq(schema.tickets.id, id));
    return res.affectedRows > 0;
  }

  // --- Ticket Messages ---
  async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    return db.select().from(schema.ticketMessages).where(eq(schema.ticketMessages.ticketId, ticketId)).orderBy(schema.ticketMessages.createdAt);
  }

  async createTicketMessage(message: Omit<TicketMessage, "id" | "createdAt">): Promise<TicketMessage> {
    const [res] = await db.insert(schema.ticketMessages).values(message);
    const [item] = await db.select().from(schema.ticketMessages).where(eq(schema.ticketMessages.id, res.insertId));
    return item;
  }

  // --- Faqs ---
  async getFaqs(): Promise<Faq[]> {
    return db.select().from(schema.faqs).orderBy(schema.faqs.order);
  }

  async getFaqsByCategory(category: string): Promise<Faq[]> {
    return db.select().from(schema.faqs).where(eq(schema.faqs.category, category)).orderBy(schema.faqs.order);
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const all = await this.getFaqs();
    const order = all.length + 1;
    const [res] = await db.insert(schema.faqs).values({ ...faq, order });
    const [item] = await db.select().from(schema.faqs).where(eq(schema.faqs.id, res.insertId));
    return item;
  }

  async updateFaq(id: number, updates: Partial<Faq>): Promise<Faq | undefined> {
    await db.update(schema.faqs).set(updates).where(eq(schema.faqs.id, id));
    const [item] = await db.select().from(schema.faqs).where(eq(schema.faqs.id, id));
    return item;
  }

  async deleteFaq(id: number): Promise<boolean> {
    const [res] = await db.delete(schema.faqs).where(eq(schema.faqs.id, id));
    return res.affectedRows > 0;
  }

  // --- Balances ---
  async getBalance(userId: number): Promise<Balance> {
    const [item] = await db.select().from(schema.balances).where(eq(schema.balances.userId, userId));
    if (!item) {
      await db.insert(schema.balances).values({ userId });
      const [newItem] = await db.select().from(schema.balances).where(eq(schema.balances.userId, userId));
      return newItem;
    }
    return item;
  }

  async updateBalance(userId: number, updates: Partial<Balance>): Promise<Balance> {
    const [item] = await db.select().from(schema.balances).where(eq(schema.balances.userId, userId));
    if (!item) {
      await db.insert(schema.balances).values({ userId, ...updates });
    } else {
      await db.update(schema.balances).set(updates).where(eq(schema.balances.userId, userId));
    }
    return this.getBalance(userId);
  }

  async addToBalance(userId: number, currency: "usd" | "sar" | "points", amount: number): Promise<Balance> {
    const balance = await this.getBalance(userId);
    const newAmount = balance[currency] + amount;
    return this.updateBalance(userId, { [currency]: newAmount });
  }

  // --- Transactions ---
  async getTransactions(userId?: number): Promise<Transaction[]> {
    if (userId) {
      return db.select().from(schema.transactions).where(eq(schema.transactions.userId, userId)).orderBy(desc(schema.transactions.createdAt));
    }
    return db.select().from(schema.transactions).orderBy(desc(schema.transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [res] = await db.insert(schema.transactions).values({ ...transaction });
    const [item] = await db.select().from(schema.transactions).where(eq(schema.transactions.id, res.insertId));
    return item;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    await db.update(schema.transactions).set(updates).where(eq(schema.transactions.id, id));
    const [item] = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id));
    return item;
  }

  // --- OAuth Accounts ---
  async getOAuthAccounts(userId: number): Promise<OAuthAccount[]> {
    return db.select().from(schema.oauthAccounts).where(eq(schema.oauthAccounts.userId, userId));
  }

  async getOAuthAccountByProvider(provider: "discord" | "google", providerId: string): Promise<OAuthAccount | undefined> {
    const [item] = await db.select()
      .from(schema.oauthAccounts)
      .where(and(eq(schema.oauthAccounts.provider, provider), eq(schema.oauthAccounts.providerId, providerId)));
    return item;
  }

  async createOAuthAccount(account: Omit<OAuthAccount, "id" | "createdAt">): Promise<OAuthAccount> {
    const [res] = await db.insert(schema.oauthAccounts).values(account);
    const [item] = await db.select().from(schema.oauthAccounts).where(eq(schema.oauthAccounts.id, res.insertId));
    return item;
  }

  async updateOAuthAccount(id: number, updates: Partial<OAuthAccount>): Promise<OAuthAccount | undefined> {
    await db.update(schema.oauthAccounts).set(updates).where(eq(schema.oauthAccounts.id, id));
    const [item] = await db.select().from(schema.oauthAccounts).where(eq(schema.oauthAccounts.id, id));
    return item;
  }

  async deleteOAuthAccount(id: number): Promise<boolean> {
    const [res] = await db.delete(schema.oauthAccounts).where(eq(schema.oauthAccounts.id, id));
    return res.affectedRows > 0;
  }

  // --- API Keys ---
  async getApiKeys(): Promise<ApiKey[]> {
    return db.select().from(schema.apiKeys);
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [item] = await db.select().from(schema.apiKeys).where(and(eq(schema.apiKeys.key, key), eq(schema.apiKeys.isActive, true)));
    return item;
  }

  async createApiKey(apiKey: Omit<ApiKey, "id" | "createdAt" | "lastUsed">): Promise<ApiKey> {
    const [res] = await db.insert(schema.apiKeys).values(apiKey);
    const [item] = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.id, res.insertId));
    return item;
  }

  async updateApiKey(id: number, updates: Partial<ApiKey>): Promise<ApiKey | undefined> {
    await db.update(schema.apiKeys).set(updates).where(eq(schema.apiKeys.id, id));
    const [item] = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.id, id));
    return item;
  }

  async deleteApiKey(id: number): Promise<boolean> {
    const [res] = await db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, id));
    return res.affectedRows > 0;
  }

  // --- Pending Orders ---
  async getPendingOrder(orderId: string): Promise<PendingOrder | undefined> {
    const [item] = await db.select().from(schema.pendingOrders).where(eq(schema.pendingOrders.orderId, orderId));
    return item;
  }

  async createPendingOrder(order: Omit<PendingOrder, "createdAt">): Promise<PendingOrder> {
    await db.insert(schema.pendingOrders).values(order);
    const [item] = await db.select().from(schema.pendingOrders).where(eq(schema.pendingOrders.orderId, order.orderId));
    return item;
  }

  async updatePendingOrder(orderId: string, updates: Partial<PendingOrder>): Promise<PendingOrder | undefined> {
    await db.update(schema.pendingOrders).set(updates).where(eq(schema.pendingOrders.orderId, orderId));
    return this.getPendingOrder(orderId);
  }
}

export const storage = new DatabaseStorage();
