"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/auth";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import axios from "axios";

export function GoogleLoginButton() {
  const { login } = useAuth();

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "email profile",
    onSuccess: async (response) => {
      try {
        // Get user info from Google using access token
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        ).then((res) => res.json());

        // Send to our backend
        const result = await api.post("/api/auth/google", {
          googleUser: {
            email: userInfo.email,
            name: userInfo.given_name
              ? `${userInfo.given_name} ${userInfo.family_name || ""}`.trim()
              : userInfo.email.split("@")[0],
            googleId: userInfo.sub,
          },
        });

        if (result.data?.token && result.data?.user) {
          // Store token and user info directly
          localStorage.setItem("token", result.data.token);
          login(result.data.token, result.data.user);
          toast.success("Successfully logged in with Google!");
        }
      } catch (error) {
        console.error("Full error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          response: axios.isAxiosError(error) ? error.response?.data : null,
          status: axios.isAxiosError(error) ? error.response?.status : null,
        });
        toast.error("Failed to login with Google");
      }
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
      toast.error("Google login failed");
    },
  });

  return (
    <button
      onClick={() => googleLogin()}
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </button>
  );
}
