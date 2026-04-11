"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "./types";
import { useAppStore } from "@/store";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const clearOperationalData = useAppStore(state => state.clearOperationalData);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          if (mounted) {
            setUser(data.user);
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch auth session", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request failed", err);
    } finally {
      clearOperationalData();
      router.push("/login");
      router.refresh(); // Ensure the layout rerenders fully
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
