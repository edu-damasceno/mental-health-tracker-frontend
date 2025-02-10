"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";
import toast from "react-hot-toast";
import { AuthError } from "@/lib/errors";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new AuthError(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      setUser({
        id: data.userId,
        email: data.email,
        name: data.name,
      });

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new AuthError(
          "Unable to connect to the server. Please check your connection or try again later."
        );
      }
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Registration failed";
        throw new Error(errorMessage);
      }

      localStorage.setItem("token", data.token);
      setUser({
        id: data.userId,
        email: data.email,
        name: data.name,
      });

      toast.success("Registration successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Register error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new AuthError(
          "Unable to connect to the server. Please check your connection or try again later."
        );
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
