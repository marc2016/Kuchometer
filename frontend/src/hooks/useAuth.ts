import { useState, useEffect, useCallback } from "react";

export interface User {
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAuthEnabled(!!data.authEnabled);
      } else {
        setUser(null);
        setAuthEnabled(false);
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Session:", err);
      setUser(null);
      setAuthEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
      }
    } catch (err) {
      console.error("Fehler beim Abmelden:", err);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return {
    user,
    authEnabled,
    loading,
    logout,
    checkAuth,
  };
}
