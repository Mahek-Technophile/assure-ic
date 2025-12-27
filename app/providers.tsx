"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  token?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  });

  const login = async (email: string, password: string) => {
    // Call functions auth/login
    const functionsBase = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
    if (!functionsBase) throw new Error("NEXT_PUBLIC_FUNCTIONS_BASE_URL not configured");
    const resp = await fetch(`${functionsBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Login failed");
    }
    const json = await resp.json();
    const newUser = { email: json.user.email, name: json.user.name };
    setUser(newUser);
    setToken(json.token);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", json.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
