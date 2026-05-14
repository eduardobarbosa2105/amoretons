import { useState, useEffect } from "react";

const STORAGE_KEY = "band_auth";
const BAND_PASSWORD = import.meta.env.VITE_BAND_PASSWORD ?? "amoretons2025";

type AuthUser = { email: string };

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setUser(stored ? (JSON.parse(stored) as AuthUser) : null);
    setLoading(false);
  }, []);

  const signIn = (password: string): boolean => {
    if (password !== BAND_PASSWORD) return false;
    const u: AuthUser = { email: "banda@amoretons.com" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return true;
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
