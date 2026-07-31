import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { UserResponse } from "@invoice/shared";
import { api } from "@/lib/api";

type AuthState = {
  user: UserResponse | null;
  // true until the initial "am I already logged in?" check resolves — the
  // router shows a loading state instead of bouncing to /login prematurely.
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, ask the backend who we are. The session cookie (if any) is what
  // answers this — that's why a page refresh keeps you logged in.
  useEffect(() => {
    api<UserResponse>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await api<UserResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(u);
  };

  const logout = async () => {
    await api<void>("/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
