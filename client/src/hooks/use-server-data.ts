import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useLoading } from "@/contexts/LoadingContext";
import { apiRequest } from "@/lib/queryClient";
import type { News, Staff, Rule, Product, Settings, User } from "@shared/schema";

export function useNews() {
  return useQuery<News[]>({
    queryKey: ["/api/news"],
  });
}

export function useStaff() {
  return useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });
}

export function useRules() {
  return useQuery<Rule[]>({
    queryKey: ["/api/rules"],
  });
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
}

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ["/api/settings"],
  });
}

export function useServerStatus() {
  return useQuery<any>({
    queryKey: ["mta-server-status"],
    queryFn: async () => {
      try {
        const response = await fetch("https://mtasa.com/api/?ip=109.176.229.142&port=22003");
        const data = await response.json();
        
        // Find the specific server
        const targetIp = "109.176.229.142";
        const targetPort = 22003;
        
        let server = null;
        if (Array.isArray(data)) {
          server = data.find((s: any) => s.ip === targetIp && parseInt(s.port) === targetPort);
        } else if (data && data.ip === targetIp && parseInt(data.port) === targetPort) {
          server = data;
        }
        
        if (server) {
          // Fix mojibake/encoding issues in server name if present
          let fixedName = server.name;
          try {
            // Try to decode as UTF-8 if it was misinterpreted as Latin-1
            // This is a common issue with MTA server names
            const bytes = Uint8Array.from(fixedName, (c: string) => c.charCodeAt(0));
            const decoded = new TextDecoder('utf-8').decode(bytes);
            // Only use if it looks valid (simple heuristic check)
            if (decoded && decoded.length < fixedName.length) {
                fixedName = decoded;
            }
          } catch (e) {
            // If decoding fails, keep original name
          }

          return {
            online: true,
            name: fixedName,
            players: parseInt(server.players) || 0,
            maxPlayers: parseInt(server.maxplayers) || 0,
            ip: "109.176.229.142:22003",
            map: server.map || "-",
            gametype: server.gametype || "-",
            version: server.version
          };
        }
        
        return {
          online: false,
          name: "Offline",
          players: 0,
          maxPlayers: 0,
          ip: "109.176.229.142:22003",
          map: "-",
          gametype: "-",
          version: "-"
        };
      } catch (error) {
        console.error("Failed to fetch server status:", error);
        return {
          online: false,
          name: "Error",
          players: 0,
          maxPlayers: 0,
          ip: "109.176.229.142:22003",
          map: "-",
          gametype: "-",
          version: "-"
        };
      }
    },
    staleTime: 60000,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  });
}

export function useMysqlStats() {
  return useQuery<{ totalAccounts: number; totalCharacters: number }>({
    queryKey: ["/api/mysql-stats"],
    queryFn: async () => {
      const res = await fetch("/api/mysql-stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 60000,
    retry: 2,
  });
}

export function useGameData() {
  return useQuery<{
    linked: boolean;
    account?: any;
    characters?: any[];
    message?: string;
  }>({
    queryKey: ["/api/user/game-data"],
  });
}

export function useFactions() {
  return useQuery<any[]>({
    queryKey: ["/api/factions"],
  });
}

type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { setIsLoading } = useLoading();

  const userQuery = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      return res.json();
    },
    onSuccess: () => {
      setIsLoading(true);
      queryClient.setQueryData(["/api/auth/me"], null);
      setTimeout(() => {
        setLocation("/");
        setIsLoading(false);
      }, 3500);
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isLoggedIn: !!userQuery.data && !userQuery.isError,
    isOwner: userQuery.data?.role === "owner",
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}

export function useUsers() {
  return useQuery<AuthUser[]>({
    queryKey: ["/api/users"],
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<News, "id" | "createdAt">) => {
      const res = await apiRequest("POST", "/api/news", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<News>) => {
      const res = await apiRequest("PUT", `/api/news/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/news/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Staff, "id" | "order">) => {
      const res = await apiRequest("POST", "/api/staff", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Staff>) => {
      const res = await apiRequest("PUT", `/api/staff/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/staff/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Rule, "id">) => {
      const res = await apiRequest("POST", "/api/rules", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
    },
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Rule>) => {
      const res = await apiRequest("PUT", `/api/rules/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
    },
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/rules/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Product, "id">) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Product>) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/products/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const res = await apiRequest("PUT", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; role?: string }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}
