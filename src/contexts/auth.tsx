"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";
import toast from "react-hot-toast";
import { AuthError } from "@/lib/errors";
import api from "@/lib/api";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (emailOrToken: string, passwordOrUser: string | User) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error("Authentication failed");
          }
          return res.json();
        })
        .then((data) => {
          setUser({
            id: data.userId,
            email: data.email,
            name: data.name,
          });
        })
        .catch(() => {
          localStorage.removeItem("token");
          router.push("/login");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const login = async (emailOrToken: string, passwordOrUser: string | User) => {
    try {
      // Handle Google login (when receiving token and user object)
      if (typeof passwordOrUser === "object") {
        const token = emailOrToken;
        const user = passwordOrUser;
        localStorage.setItem("token", token);
        setUser(user);
        router.push("/dashboard");
        return;
      }

      // Regular email/password login
      const email = emailOrToken;
      const password = passwordOrUser as string;
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      if (response.data?.token && response.data?.user) {
        localStorage.setItem("token", response.data.token);
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
        });
        toast.success("Login successful!");
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        throw new AuthError(
          error.response?.data?.error || "Invalid credentials"
        );
      }
      throw new AuthError("Login failed. Please try again.");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      const data = res.data;
      localStorage.setItem("token", data.token);
      setUser({
        id: data.userId,
        email: data.email,
        name: data.name,
      });

      toast.success("Registration successful!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Register error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new AuthError(
          "Unable to connect to the server. Please check your connection or try again later."
        );
      }
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new AuthError(error.response.data.error);
      }
      throw new AuthError(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setUser(null);
      localStorage.removeItem("token");
      await Promise.resolve();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    loading: isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
