import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./jsonStorage";
import { api } from "@shared/routes";
import { pool } from "./db";
import bcrypt from "bcryptjs";
import session from "express-session";
import { createPaypalOrder, loadPaypalDefault, isPayPalConfigured } from "./paypal";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  next();
};

const requireOwner = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  const user = await storage.getUserById(req.session.userId);
  if (!user || user.role !== "owner") {
    return res.status(403).json({ message: "غير مسموح" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
       secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const { username, email, password } = api.auth.register.input.parse(req.body);

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: "user",
      });

      req.session.userId = user.id;
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } catch (err) {
      res.status(500).json({ message: "فشل في إنشاء الحساب" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      req.session.userId = user.id;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } catch (err) {
      res.status(500).json({ message: "فشل في تسجيل الدخول" });
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "غير مسجل الدخول" });
    }

    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "المستخدم غير موجود" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "فشل في تسجيل الخروج" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (err) {
      res.status(500).json({ message: "فشل في تغيير كلمة المرور" });
    }
  });

  app.delete("/api/auth/delete-account", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      if (user.role === "owner") {
        return res.status(403).json({ message: "لا يمكن حذف حساب المالك" });
      }

      await storage.deleteUser(userId);

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "فشل في حذف الحساب" });
        }
        res.json({ message: "تم حذف الحساب بنجاح" });
      });
    } catch (err) {
      res.status(500).json({ message: "فشل في حذف الحساب" });
    }
  });

  // Discord OAuth
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const _siteDomain = process.env.SITE_DOMAIN || process.env.REPLIT_DEV_DOMAIN;
  const DISCORD_REDIRECT_URI = _siteDomain
    ? `https://${_siteDomain}/api/auth/discord/callback`
    : "http://localhost:5000/api/auth/discord/callback";

  app.get("/api/auth/discord", (req, res) => {
    if (!DISCORD_CLIENT_ID) {
      return res.status(500).json({ message: "Discord OAuth غير مُهيأ" });
    }
    const scope = "identify email";
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    res.redirect(authUrl);
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code } = req.query;

    if (!code || !DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
      return res.redirect("/login?error=discord_failed");
    }

    try {
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: DISCORD_REDIRECT_URI,
        }),
      });

      const tokens = await tokenResponse.json();
      if (!tokens.access_token) {
        return res.redirect("/login?error=discord_failed");
      }

      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const discordUser = await userResponse.json();
      if (!discordUser.id) {
        return res.redirect("/login?error=discord_failed");
      }

      const discordAvatarUrl = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null;

      let oauthAccount = await storage.getOAuthAccountByProvider("discord", discordUser.id);

      if (oauthAccount) {
        // تحديث بيانات الحساب
        await storage.updateOAuthAccount(oauthAccount.id, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          username: discordUser.username,
          avatarUrl: discordAvatarUrl,
        });
        // تحديث discordId في users.json أيضاً
        await storage.updateUser(oauthAccount.userId, {
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          discordAvatarUrl: discordAvatarUrl,
        });
        req.session.userId = oauthAccount.userId;
        return res.redirect("/?login=success");
      }

      const email = discordUser.email || `${discordUser.id}@discord.oauth`;

      // البحث عن مستخدم بنفس الإيميل (قد يكون سجل بـ Google مسبقاً)
      let user = await storage.getUserByEmail(email);

      if (!user) {
        user = await storage.createUser({
          username: discordUser.username || `discord_${discordUser.id}`,
          email,
          password: await bcrypt.hash(crypto.randomUUID(), 10),
          role: "user",
        });
      }

      // حفظ discordId مباشرة في users.json
      await storage.updateUser(user.id, {
        discordId: discordUser.id,
        discordUsername: discordUser.username,
        discordAvatarUrl: discordAvatarUrl,
      });

      await storage.createOAuthAccount({
        userId: user.id,
        provider: "discord",
        providerId: discordUser.id,
        email: discordUser.email || null,
        username: discordUser.username,
        avatarUrl: discordAvatarUrl,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
      });

      req.session.userId = user.id;
      res.redirect("/?login=success");
    } catch (err) {
      console.error("Discord OAuth error:", err);
      res.redirect("/login?error=discord_failed");
    }
  });

  // Google OAuth
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const _googleDomain = process.env.SITE_DOMAIN || process.env.REPLIT_DEV_DOMAIN;
  const GOOGLE_REDIRECT_URI = _googleDomain
    ? `https://${_googleDomain}/api/auth/google/callback`
    : "http://localhost:5000/api/auth/google/callback";

  app.get("/api/auth/google", (req, res) => {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google OAuth غير مُهيأ" });
    }
    const scope = "openid email profile";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    res.redirect(authUrl);
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;

    if (!code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect("/login?error=google_failed");
    }

    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: GOOGLE_REDIRECT_URI,
        }),
      });

      const tokens = await tokenResponse.json();
      if (!tokens.access_token) {
        return res.redirect("/login?error=google_failed");
      }

      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const googleUser = await userResponse.json();
      if (!googleUser.id) {
        return res.redirect("/login?error=google_failed");
      }

      let oauthAccount = await storage.getOAuthAccountByProvider("google", googleUser.id);

      if (oauthAccount) {
        await storage.updateOAuthAccount(oauthAccount.id, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          username: googleUser.name,
          avatarUrl: googleUser.picture || null,
        });
        req.session.userId = oauthAccount.userId;
        return res.redirect("/?login=success");
      }

      const email = googleUser.email;
      if (!email) {
        return res.redirect("/login?error=google_no_email");
      }

      let user = await storage.getUserByEmail(email);

      if (!user) {
        user = await storage.createUser({
          username: googleUser.name || `google_${googleUser.id}`,
          email,
          password: await bcrypt.hash(crypto.randomUUID(), 10),
          role: "user",
        });
      }

      // إضافة Google oauth_account مرتبط بنفس المستخدم
      await storage.createOAuthAccount({
        userId: user.id,
        provider: "google",
        providerId: googleUser.id,
        email: googleUser.email,
        username: googleUser.name,
        avatarUrl: googleUser.picture || null,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
      });

      // إذا كان المستخدم لديه discordId محفوظ (سجّل Discord من قبل)
      // وليس لديه Discord oauth_account حالياً في هذه الجلسة، تأكد من أن البيانات محفوظة
      // لا شيء إضافي مطلوب - discordId محفوظ في users.json من تسجيل Discord

      req.session.userId = user.id;
      res.redirect("/?login=success");
    } catch (err) {
      console.error("Google OAuth error:", err);
      res.redirect("/login?error=google_failed");
    }
  });

  // Get linked OAuth accounts
  app.get("/api/auth/oauth-accounts", requireAuth, async (req, res) => {
    try {
      const accounts = await storage.getOAuthAccounts(req.session.userId!);
      res.json(accounts.map(a => ({
        id: a.id,
        provider: a.provider,
        username: a.username,
        email: a.email,
        avatarUrl: a.avatarUrl,
        createdAt: a.createdAt,
      })));
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب الحسابات المرتبطة" });
    }
  });

  // Unlink OAuth account
  app.delete("/api/auth/oauth-accounts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const accounts = await storage.getOAuthAccounts(req.session.userId!);
      const account = accounts.find(a => a.id === id);

      if (!account) {
        return res.status(404).json({ message: "الحساب غير موجود" });
      }

      await storage.deleteOAuthAccount(id);
      res.json({ message: "تم إلغاء الربط بنجاح" });
    } catch (err) {
      res.status(500).json({ message: "فشل في إلغاء الربط" });
    }
  });

  app.get(api.news.list.path, async (req, res) => {
    const news = await storage.getNews();
    res.json(news);
  });

  app.post(api.news.create.path, requireOwner, async (req, res) => {
    try {
      const input = api.news.create.input.parse(req.body);
      const news = await storage.createNews(input);
      res.status(201).json(news);
    } catch (err) {
      res.status(500).json({ message: "فشل في إنشاء الخبر" });
    }
  });

  app.put("/api/news/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const news = await storage.updateNews(id, req.body);
      if (!news) {
        return res.status(404).json({ message: "الخبر غير موجود" });
      }
      res.json(news);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث الخبر" });
    }
  });

  app.delete("/api/news/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNews(id);
      if (!deleted) {
        return res.status(404).json({ message: "الخبر غير موجود" });
      }
      res.json({ message: "تم حذف الخبر" });
    } catch (err) {
      res.status(500).json({ message: "فشل في حذف الخبر" });
    }
  });

  app.get(api.staff.list.path, async (req, res) => {
    const staff = await storage.getStaff();
    res.json(staff);
  });

  app.post(api.staff.create.path, requireOwner, async (req, res) => {
    try {
      const input = api.staff.create.input.parse(req.body);
      const staff = await storage.createStaff(input);
      res.status(201).json(staff);
    } catch (err) {
      res.status(500).json({ message: "فشل في إضافة العضو" });
    }
  });

  app.put("/api/staff/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staff = await storage.updateStaff(id, req.body);
      if (!staff) {
        return res.status(404).json({ message: "العضو غير موجود" });
      }
      res.json(staff);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث العضو" });
    }
  });

  app.delete("/api/staff/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStaff(id);
      if (!deleted) {
        return res.status(404).json({ message: "العضو غير موجود" });
      }
      res.json({ message: "تم حذف العضو" });
    } catch (err) {
      res.status(500).json({ message: "فشل في حذف العضو" });
    }
  });

  app.get(api.rules.list.path, async (req, res) => {
    const rules = await storage.getRules();
    res.json(rules);
  });

  app.post(api.rules.create.path, requireOwner, async (req, res) => {
    try {
      const input = api.rules.create.input.parse(req.body);
      const rule = await storage.createRule(input);
      res.status(201).json(rule);
    } catch (err) {
      res.status(500).json({ message: "فشل في إضافة القانون" });
    }
  });

  app.put("/api/rules/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rule = await storage.updateRule(id, req.body);
      if (!rule) {
        return res.status(404).json({ message: "القانون غير موجود" });
      }
      res.json(rule);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث القانون" });
    }
  });

  app.delete("/api/rules/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRule(id);
      if (!deleted) {
        return res.status(404).json({ message: "القانون غير موجود" });
      }
      res.json({ message: "تم حذف القانون" });
    } catch (err) {
      res.status(500).json({ message: "فشل في حذف القانون" });
    }
  });

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    res.json(product);
  });

  app.post(api.products.create.path, requireOwner, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ message: "فشل في إضافة المنتج" });
    }
  });

  app.put("/api/products/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث المنتج" });
    }
  });

  app.delete("/api/products/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      res.json({ message: "تم حذف المنتج" });
    } catch (err) {
      res.status(500).json({ message: "فشل في حذف المنتج" });
    }
  });

  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, requireOwner, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث الإعدادات" });
    }
  });

  app.get(api.users.list.path, requireOwner, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    })));
  });

  app.put("/api/users/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث المستخدم" });
    }
  });

  app.delete("/api/users/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      res.json({ message: "تم حذف المستخدم" });
    } catch (err) {
      res.status(500).json({ message: "فشل في حذف المستخدم" });
    }
  });

  app.get(api.server.status.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json({
      online: true,
      players: 0,
      maxPlayers: 500,
      ip: settings.serverIp,
    });
  });

  app.get("/api/tickets", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUserById(userId);
    if (user?.role === "owner" || user?.role === "admin") {
      const tickets = await storage.getTickets();
      res.json(tickets);
    } else {
      const tickets = await storage.getTicketsByUserId(userId);
      res.json(tickets);
    }
  });

  app.get("/api/tickets/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const ticket = await storage.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: "التذكرة غير موجودة" });
    }
    const userId = req.session.userId!;
    const user = await storage.getUserById(userId);
    if (ticket.userId !== userId && user?.role !== "owner" && user?.role !== "admin") {
      return res.status(403).json({ message: "غير مسموح" });
    }
    res.json(ticket);
  });

  app.post("/api/tickets", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(401).json({ message: "المستخدم غير موجود" });
      }
      const { department, subject, message } = req.body;
      if (!department || !subject || !message) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }
      const ticket = await storage.createTicket({
        userId,
        username: user.username,
        department,
        subject,
        message,
      });

      // Create the first message as part of the new chat system
      await storage.createTicketMessage({
        ticketId: ticket.id,
        userId: user.id,
        isAdmin: false,
        message: message,
      });

      res.status(201).json(ticket);
    } catch (err) {
      res.status(500).json({ message: "فشل في إنشاء التذكرة" });
    }
  });

  app.put("/api/tickets/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.updateTicket(id, req.body);
      if (!ticket) {
        return res.status(404).json({ message: "التذكرة غير موجودة" });
      }

      // If the admin is closing the ticket with a single old-style adminResponse, let's also add it as a message
      if (req.body.adminResponse && req.body.status === "closed") {
        await storage.createTicketMessage({
          ticketId: ticket.id,
          userId: req.session.userId!,
          isAdmin: true,
          message: req.body.adminResponse,
        });
      }

      res.json(ticket);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث التذكرة" });
    }
  });

  app.get("/api/tickets/:id/messages", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicketById(id);
      if (!ticket) {
        return res.status(404).json({ message: "التذكرة غير موجودة" });
      }

      const userId = req.session.userId!;
      const user = await storage.getUserById(userId);
      if (ticket.userId !== userId && user?.role !== "owner" && user?.role !== "admin") {
        return res.status(403).json({ message: "غير مسموح" });
      }

      let messages = await storage.getTicketMessages(id);

      // Backward compatibility logic: if no messages exist but the ticket has a message/adminResponse
      if (messages.length === 0) {
        messages = [
          {
            id: 0,
            ticketId: ticket.id,
            userId: ticket.userId,
            isAdmin: false,
            message: ticket.message,
            createdAt: ticket.createdAt,
          }
        ];

        if (ticket.adminResponse) {
          messages.push({
            id: -1,
            ticketId: ticket.id,
            userId: 0, // indicates system/admin
            isAdmin: true,
            message: ticket.adminResponse,
            createdAt: ticket.updatedAt,
          });
        }
      }

      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب الرسائل" });
    }
  });

  app.post("/api/tickets/:id/messages", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicketById(id);
      if (!ticket) {
        return res.status(404).json({ message: "التذكرة غير موجودة" });
      }

      const userId = req.session.userId!;
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(401).json({ message: "المستخدم غير موجود" });
      }

      const isAdmin = user.role === "owner" || user.role === "admin";
      if (ticket.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "غير مسموح" });
      }

      const { message } = req.body;
      if (!message || message.trim() === "") {
        return res.status(400).json({ message: "الرسالة مطلوبة" });
      }

      const ticketMessage = await storage.createTicketMessage({
        ticketId: ticket.id,
        userId: user.id,
        isAdmin,
        message,
      });

      // Update ticket status based on who replied
      if (isAdmin && ticket.status === "open") {
        await storage.updateTicket(ticket.id, { status: "in_progress" });
      } else if (!isAdmin && ticket.status !== "open") {
        await storage.updateTicket(ticket.id, { status: "open" });
      } else {
        // Just touch the updatedAt
        await storage.updateTicket(ticket.id, {});
      }

      res.status(201).json(ticketMessage);
    } catch (err) {
      res.status(500).json({ message: "فشل في إرسال الرسالة" });
    }
  });

  app.delete("/api/tickets/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTicket(id);
      if (!deleted) {
        return res.status(404).json({ message: "التذكرة غير موجودة" });
      }
      res.json({ message: "تم حذف التذكرة" });
    } catch (err) {
      res.status(500).json({ message: "فشل في حذف التذكرة" });
    }
  });

  app.get("/api/faqs", async (req, res) => {
    const faqs = await storage.getFaqs();
    res.json(faqs);
  });

  app.post("/api/faqs", requireOwner, async (req, res) => {
    try {
      const { question, answer, category } = req.body;
      if (!question || !answer || !category) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }
      const faq = await storage.createFaq({ question, answer, category });
      res.status(201).json(faq);
    } catch (err) {
      res.status(500).json({ message: "فشل في إضافة السؤال" });
    }
  });

  app.put("/api/faqs/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const faq = await storage.updateFaq(id, req.body);
      if (!faq) {
        return res.status(404).json({ message: "السؤال غير موجود" });
      }
      res.json(faq);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث السؤال" });
    }
  });

  app.delete("/api/faqs/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFaq(id);
      if (!deleted) {
        return res.status(404).json({ message: "السؤال غير موجود" });
      }
      res.json({ message: "تم حذف السؤال" });
    } catch (err) {
      res.status(500).json({ message: "فشل في حذف السؤال" });
    }
  });

  app.get("/api/wallet/balance", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const balance = await storage.getBalance(userId);
      res.json(balance);
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب الرصيد" });
    }
  });

  app.get("/api/wallet/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب المعاملات" });
    }
  });

  app.get("/api/admin/balances", requireOwner, async (req, res) => {
    try {
      const users = await storage.getUsers();
      const balances = await Promise.all(
        users.map(async (user) => {
          const balance = await storage.getBalance(user.id);
          return { ...balance, username: user.username, email: user.email };
        })
      );
      res.json(balances);
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب الأرصدة" });
    }
  });

  app.get("/api/admin/transactions", requireOwner, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب المعاملات" });
    }
  });

  app.post("/api/admin/balance/add", requireOwner, async (req, res) => {
    try {
      const { userId, currency, amount, description } = req.body;
      if (!userId || !currency || amount === undefined) {
        return res.status(400).json({ message: "الحقول مطلوبة" });
      }

      const balance = await storage.addToBalance(userId, currency, amount);
      await storage.createTransaction({
        userId,
        type: amount >= 0 ? "deposit" : "withdrawal",
        amount: Math.abs(amount),
        currency,
        description: description || (amount >= 0 ? "إضافة رصيد من الإدارة" : "خصم رصيد من الإدارة"),
        reference: null,
        status: "completed",
      });

      res.json(balance);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث الرصيد" });
    }
  });

  const requireApiKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      return res.status(401).json({ message: "API key مطلوب" });
    }
    const key = await storage.getApiKeyByKey(apiKey);
    if (!key) {
      return res.status(401).json({ message: "API key غير صالح" });
    }
    await storage.updateApiKey(key.id, { lastUsed: new Date().toISOString() });
    (req as any).apiKeyPermissions = key.permissions;
    next();
  };

  const checkPermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const permissions = (req as any).apiKeyPermissions || [];
      if (!permissions.includes(permission) && !permissions.includes("*")) {
        return res.status(403).json({ message: "صلاحية غير كافية" });
      }
      next();
    };
  };

  app.get("/api/bot/users", requireApiKey, checkPermission("users.read"), async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt })));
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب المستخدمين" });
    }
  });

  app.get("/api/bot/users/:id", requireApiKey, checkPermission("users.read"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      const balance = await storage.getBalance(id);
      res.json({ id: user.id, username: user.username, email: user.email, role: user.role, createdAt: user.createdAt, balance });
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب المستخدم" });
    }
  });

  app.put("/api/bot/users/:id", requireApiKey, checkPermission("users.write"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;
      const user = await storage.updateUser(id, { role });
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث المستخدم" });
    }
  });

  app.get("/api/bot/balance/:userId", requireApiKey, checkPermission("balance.read"), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const balance = await storage.getBalance(userId);
      res.json(balance);
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب الرصيد" });
    }
  });

  app.post("/api/bot/balance/:userId/add", requireApiKey, checkPermission("balance.write"), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { currency, amount, description } = req.body;
      if (!currency || amount === undefined) {
        return res.status(400).json({ message: "الحقول مطلوبة" });
      }

      const balance = await storage.addToBalance(userId, currency, amount);
      await storage.createTransaction({
        userId,
        type: amount >= 0 ? "deposit" : "withdrawal",
        amount: Math.abs(amount),
        currency,
        description: description || "عملية من Bot API",
        reference: null,
        status: "completed",
      });

      res.json(balance);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث الرصيد" });
    }
  });

  app.get("/api/bot/transactions/:userId", requireApiKey, checkPermission("transactions.read"), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب المعاملات" });
    }
  });

  app.get("/api/bot/settings", requireApiKey, checkPermission("settings.read"), async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put("/api/bot/settings", requireApiKey, checkPermission("settings.write"), async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث الإعدادات" });
    }
  });

  app.get("/api/admin/api-keys", requireOwner, async (req, res) => {
    try {
      const keys = await storage.getApiKeys();
      res.json(keys.map(k => ({ ...k, key: k.key.slice(0, 8) + "..." })));
    } catch (err) {
      res.status(500).json({ message: "فشل في جلب المفاتيح" });
    }
  });

  app.post("/api/admin/api-keys", requireOwner, async (req, res) => {
    try {
      const { name, permissions } = req.body;
      if (!name || !permissions) {
        return res.status(400).json({ message: "الحقول مطلوبة" });
      }

      const crypto = await import("crypto");
      const key = `rixel_${crypto.randomBytes(32).toString("hex")}`;

      const apiKey = await storage.createApiKey({
        name,
        key,
        permissions,
        createdBy: req.session.userId!,
        isActive: true,
      });

      res.status(201).json({ ...apiKey, fullKey: key });
    } catch (err) {
      res.status(500).json({ message: "فشل في إنشاء المفتاح" });
    }
  });

  app.delete("/api/admin/api-keys/:id", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteApiKey(id);
      if (!deleted) {
        return res.status(404).json({ message: "المفتاح غير موجود" });
      }
      res.json({ message: "تم حذف المفتاح" });
    } catch (err) {
      res.status(500).json({ message: "فشل في حذف المفتاح" });
    }
  });

  app.put("/api/admin/api-keys/:id/toggle", requireOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const keys = await storage.getApiKeys();
      const key = keys.find(k => k.id === id);
      if (!key) {
        return res.status(404).json({ message: "المفتاح غير موجود" });
      }
      const updated = await storage.updateApiKey(id, { isActive: !key.isActive });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "فشل في تحديث المفتاح" });
    }
  });

  // Simulate Wallet Topup
  app.post("/api/wallet/topup-simulate", requireAuth, async (req, res) => {
    try {
      const { amount, currency } = req.body;
      const userId = req.session.userId!;

      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "مبلغ غير صالح" });
      }

      if (!["USD", "SAR"].includes(currency)) {
        return res.status(400).json({ message: "عملة غير مدعومة" });
      }

      const currencyKey = currency.toLowerCase() as "usd" | "sar";
      
      // Update balance
      const newBalance = await storage.addToBalance(userId, currencyKey, amount);

      // Record transaction
      await storage.createTransaction({
        userId,
        type: "deposit",
        amount,
        currency: currencyKey,
        description: `شحن رصيد ${currency}`,
        status: "completed",
        reference: `TOPUP-${Date.now()}`
      });

      res.json({
        success: true,
        message: "تم شحن الرصيد بنجاح",
        balance: newBalance,
        amount,
        currency
      });
    } catch (err) {
      console.error("Topup simulation error:", err);
      res.status(500).json({ message: "فشل في عملية الشحن" });
    }
  });

  // Store Purchase with In-Game Currency
  app.post("/api/store/purchase", requireAuth, async (req, res) => {
    try {
      const { productId, method } = req.body;
      const userId = req.session.userId!;

      if (!productId || !method || !["cash", "bank", "wallet"].includes(method)) {
        return res.status(400).json({ message: "بيانات غير صالحة" });
      }

      // 1. Get Product
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }

      if (!product.inStock) {
        return res.status(400).json({ message: "المنتج غير متوفر" });
      }

      if (product.currency === "real_money" && method !== "wallet") {
        return res.status(400).json({ message: "هذا المنتج يتطلب الدفع من المحفظة الإلكترونية" });
      }

      // 2. Get User's Game Account (Discord Linked)
      const user = await storage.getUserById(userId);
      
      // Get Discord ID
      const oauthAccounts = await storage.getOAuthAccounts(userId);
      const discordAccount = oauthAccounts.find(a => a.provider === "discord");
      let discordId = discordAccount ? discordAccount.providerId : (user as any).discordId;

      if (!discordId) {
        return res.status(400).json({ message: "يجب ربط حساب الديسكورد أولاً" });
      }

      // 3. Get Game Character
      // Assuming we charge the most recently played character or the first one
      const [accounts] = await pool.query("SELECT id FROM accounts WHERE discordID = ?", [discordId]);
      const gameAccount = (accounts as any)[0];

      if (!gameAccount) {
        return res.status(400).json({ message: "لا يوجد حساب لعبة مرتبط" });
      }

      const [characters] = await pool.query(
        "SELECT id, money, bankmoney, charactername FROM characters WHERE account = ? ORDER BY lastlogin DESC LIMIT 1",
        [gameAccount.id]
      );
      
      const character = (characters as any)[0];

      if (!character) {
        return res.status(400).json({ message: "لا توجد شخصية في اللعبة" });
      }

      // 4. Calculate Final Price with Discount
      let price = product.price;
      if (product.discount && product.discount > 0) {
        price = Math.floor(price * (1 - product.discount / 100));
      }

      // 5. Check Balance & Deduct Money
      if (method === "wallet") {
        // Real Money Purchase
        const balance = await storage.getBalance(userId);
        // Assuming price is in USD for real money items
        if (balance.usd < price) {
          return res.status(400).json({ message: "رصيد المحفظة غير كافي" });
        }

        // Deduct from wallet
        await storage.updateBalance(userId, { usd: balance.usd - price });

        // Record wallet transaction
        await storage.createTransaction({
          userId,
          type: "purchase",
          amount: price,
          currency: "usd",
          description: `شراء ${product.name}`,
          status: "completed",
          reference: `PURCHASE-${Date.now()}`
        });

      } else {
        // In-Game Currency Purchase
        const currentBalance = method === "cash" ? character.money : character.bankmoney;

        if (currentBalance < price) {
          return res.status(400).json({ message: "رصيد اللعبة غير كافي" });
        }

        const updateField = method === "cash" ? "money" : "bankmoney";
        await pool.query(
          `UPDATE characters SET ${updateField} = ${updateField} - ? WHERE id = ?`,
          [price, character.id]
        );
      }

      // 6. Record Transaction / Deliver Product
      // For now, we just log it in the database or send a webhook
      // You might want to insert into a `store_logs` table or give the item directly if possible via MySQL
      
      // Example: Give item logic would go here
      // if (product.type === 'vehicle') { ... }

      console.log(`Purchase successful: User ${user?.username} bought ${product.name} for ${price} (${method})`);

      res.json({ 
        success: true, 
        message: "تم الشراء بنجاح", 
        // newBalance is tricky because it depends on method, we can omit it or send based on method
      });

    } catch (err) {
      console.error("Store purchase error:", err);
      res.status(500).json({ message: "فشل في إتمام عملية الشراء" });
    }
  });

  app.get("/api/payment/status", (req, res) => {
    res.json({
      paypal: isPayPalConfigured(), // Check if PayPal is configured
    });
  });

  app.post("/api/paypal/order", createPaypalOrder);
  app.get("/paypal/setup", loadPaypalDefault);
  // =============================================
// MTA Link System - نظام ربط حساب اللعبة
// =============================================

// جلب كود الربط للمستخدم
app.get("/api/mta/link-code", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await storage.getUserById(userId);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    // إنشاء كود عشوائي إذا ما عنده
    let linkCode = (user as any).mtaLinkCode;
    if (!linkCode) {
      linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await storage.updateUser(userId, { mtaLinkCode: linkCode } as any);
    }

    res.json({ code: linkCode, mtaUsername: (user as any).mtaUsername || null });
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب الكود" });
  }
});

// التحقق من الكود وربط الحساب (يستدعيه سكريبت MTA)
app.post("/api/mta/verify-link", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const keys = await storage.getApiKeys();
    const validKey = keys.find((k: any) => k.key === apiKey);
    if (!validKey) return res.status(401).json({ message: "API key غير صالح" });

    const { username, code } = req.body;
    if (!username || !code) return res.status(400).json({ message: "بيانات ناقصة" });

    // البحث عن المستخدم بالكود
    const allUsers = await storage.getAllUsers();
    const user = allUsers.find((u: any) => u.mtaLinkCode === code.toUpperCase());
    if (!user) return res.status(404).json({ success: false, message: "الكود غير صحيح" });

    // ربط اليوزرنيم
    await storage.updateUser(user.id, { 
      mtaUsername: username,
      mtaLinkCode: null 
    } as any);

    res.json({ success: true, message: "تم الربط بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

// استقبال بيانات اللاعب من MTA
app.post("/api/mta/player-login", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const keys = await storage.getApiKeys();
    const validKey = keys.find((k: any) => k.key === apiKey);
    if (!validKey) return res.status(401).json({ message: "غير مصرح" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/mta/player-logout", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const keys = await storage.getApiKeys();
    const validKey = keys.find((k: any) => k.key === apiKey);
    if (!validKey) return res.status(401).json({ message: "غير مصرح" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/mta/player-update", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const keys = await storage.getApiKeys();
    const validKey = keys.find((k: any) => k.key === apiKey);
    if (!validKey) return res.status(401).json({ message: "غير مصرح" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

  app.get("/api/mysql-stats", async (req, res) => {
    try {
      const [accountsResult] = await pool.query("SELECT COUNT(*) as count FROM accounts");
      const totalAccounts = (accountsResult as any)[0].count;

      const [charactersResult] = await pool.query("SELECT COUNT(*) as count FROM characters");
      const totalCharacters = (charactersResult as any)[0].count;

      res.json({ 
        totalAccounts,
        totalCharacters
      });
    } catch (err) {
      console.error("MySQL stats error:", err);
      res.status(500).json({ message: "فشل في جلب الإحصائيات" });
    }
  });

  app.get("/api/user/game-data", requireAuth, async (req, res) => {
    try {
      // 1. Get Discord ID - first from oauth_accounts, then from users.json directly
      const userId = req.session.userId!;
      const oauthAccounts = await storage.getOAuthAccounts(userId);
      const discordAccount = oauthAccounts.find(a => a.provider === "discord");

      let discordId: string | null = null;

      if (discordAccount) {
        discordId = discordAccount.providerId;
      } else {
        // Fallback: read discordId saved directly in users.json (set when Discord was used first)
        const user = await storage.getUserById(userId);
        if (user && (user as any).discordId) {
          discordId = (user as any).discordId;
        }
      }

      if (!discordId) {
        return res.json({ linked: false, message: "لم يتم ربط حساب ديسكورد بهذا الحساب" });
      }

      // 2. Query game accounts
      const [accounts] = await pool.query(
        "SELECT * FROM accounts WHERE discordID = ?",
        [discordId]
      );

      const gameAccount = (accounts as any)[0];

      if (!gameAccount) {
        return res.json({ linked: false, message: "لم يتم العثور على حساب لعبة مرتبط بهذا الديسكورد" });
      }

      // 3. Query characters
      const [characters] = await pool.query(
        "SELECT * FROM characters WHERE account = ?",
        [gameAccount.id]
      );

      // 4. Query vehicles for each character
      const charactersWithVehicles = await Promise.all(
        (characters as any[]).map(async (char: any) => {
          const [vehicles] = await pool.query(
            `SELECT id, model, plate, color1, color2, hp, fuel, locked, lights,
                    odometer, faction, job, description1, Impounded, stolen,
                    lastUsed, creationDate, createdBy, deleted
             FROM vehicles
             WHERE owner = ? AND deleted = 0`,
            [char.id]
          );
          return { ...char, vehicles: vehicles || [] };
        })
      );

      res.json({
        linked: true,
        account: gameAccount,
        characters: charactersWithVehicles
      });
    } catch (err) {
      console.error("Game data fetch error:", err);
      res.status(500).json({ message: "فشل في جلب بيانات اللعبة" });
    }
  });

  app.get("/api/factions", async (req, res) => {
    try {
      // Government faction IDs with their names
      const governmentFactions: { [key: number]: string } = {
        1: "الامن العام",
        2: "وزارة الصحة",
        3: "الحكومة الملكية",
        4: "شركة الموقف",
        17: "هيئة الترفيه",
        20: "امن المنشآت",
        47: "هيئة الطيران",
        50: "القوات الخاصة",
        55: "المباحث الفيدرالية",
        59: "وزارة الدفاع",
        69: "الصيانة العامة للمركبات"
      };

      const factionIds = Object.keys(governmentFactions).map(Number);

      // Get faction data and count members from characters table
      const [rows] = (await pool.query(`
        SELECT 
          f.id, 
          f.bankbalance, 
          f.motd, 
          f.phone,
          f.type,
          COUNT(c.id) as memberCount
        FROM factions f
        LEFT JOIN characters c ON c.faction_id = f.id
        WHERE f.id IN (${factionIds.join(',')})
        GROUP BY f.id
      `)) as any;

      const processedFactions = rows.map((f: any) => {
        const decodeArabic = (val: any) => {
          if (!val || typeof val !== 'string') return val;
          try {
            const buf = Buffer.from(val, 'latin1');
            return buf.toString('utf8');
          } catch (e) {
            return val;
          }
        };

        return {
          id: f.id,
          name: governmentFactions[f.id],
          type: f.type,
          bankbalance: f.bankbalance,
          motd: decodeArabic(f.motd),
          phone: f.phone,
          memberCount: f.memberCount || 0,
          category: "official"
        };
      });

      res.json(processedFactions);
    } catch (err) {
      console.error("Factions fetch error:", err);
      res.status(500).json({ message: "فشل في جلب بيانات المنظمات" });
    }
  });

  return httpServer;
}
