import { z } from "zod";
import { insertNewsSchema, insertStaffSchema, insertRuleSchema, insertProductSchema, settingsSchema } from "./schema";

export const api = {
  auth: {
    login: {
      path: "/api/auth/login",
      method: "POST" as const,
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    },
    register: {
      path: "/api/auth/register",
      method: "POST" as const,
      input: z.object({
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    },
    me: {
      path: "/api/auth/me",
      method: "GET" as const,
    },
    logout: {
      path: "/api/auth/logout",
      method: "POST" as const,
    },
  },
  news: {
    list: { path: "/api/news", method: "GET" as const },
    create: { path: "/api/news", method: "POST" as const, input: insertNewsSchema },
    update: { path: "/api/news/:id", method: "PUT" as const, input: insertNewsSchema.partial() },
    delete: { path: "/api/news/:id", method: "DELETE" as const },
  },
  staff: {
    list: { path: "/api/staff", method: "GET" as const },
    create: { path: "/api/staff", method: "POST" as const, input: insertStaffSchema },
    update: { path: "/api/staff/:id", method: "PUT" as const, input: insertStaffSchema.partial() },
    delete: { path: "/api/staff/:id", method: "DELETE" as const },
  },
  rules: {
    list: { path: "/api/rules", method: "GET" as const },
    create: { path: "/api/rules", method: "POST" as const, input: insertRuleSchema },
    update: { path: "/api/rules/:id", method: "PUT" as const, input: insertRuleSchema.partial() },
    delete: { path: "/api/rules/:id", method: "DELETE" as const },
  },
  products: {
    list: { path: "/api/products", method: "GET" as const },
    get: { path: "/api/products/:id", method: "GET" as const },
    create: { path: "/api/products", method: "POST" as const, input: insertProductSchema },
    update: { path: "/api/products/:id", method: "PUT" as const, input: insertProductSchema.partial() },
    delete: { path: "/api/products/:id", method: "DELETE" as const },
  },
  settings: {
    get: { path: "/api/settings", method: "GET" as const },
    update: { path: "/api/settings", method: "PUT" as const, input: settingsSchema.partial() },
  },
  server: {
    status: { path: "/api/server/status", method: "GET" as const },
  },
  users: {
    list: { path: "/api/users", method: "GET" as const },
    update: { path: "/api/users/:id", method: "PUT" as const },
    delete: { path: "/api/users/:id", method: "DELETE" as const },
  },
};
