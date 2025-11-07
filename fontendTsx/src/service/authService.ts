// services/authService.ts
import type { Credentials, LoginResponse, RefreshResponse, RegisterCredentials, User } from "@/types/user";
import { privateApi, publicApi } from "../api/api";



export const authService = {
  // Refresh token endpoint - FIXED to use V2
  refresh: async (): Promise<RefreshResponse> => {
    try {
      const response = await publicApi.get("/v2/refresh");
      return response.data;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  },
  googleCallback: async (code: string): Promise<LoginResponse> => {
    try {
      // Send as query parameter, not body
      const response = await publicApi.get("/google/callback", {
        params: { code }
      });
      return response.data;
    } catch (error) {
      console.error("Error Google Callback:", error);
      throw error;
    }
  },
  // Register endpoint
  register: async (registerCredentials: RegisterCredentials, type: 'user' | 'professional' = 'user') => {
    try {
      const endpoint = type === 'professional' ? '/register/professional' : '/register/user';
      const response = await publicApi.post(endpoint, registerCredentials);
      return response.data;
    } catch (error) {
      console.error("Error registering:", error);
      throw error;
    }
  },

  // Login endpoint - FIXED to use V2 and new response structure
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    try {
      const response = await publicApi.post("/v2/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  // Logout endpoint - FIXED to use V2
  logout: async (): Promise<void> => {
    try {
      await privateApi.post("/v2/logout");
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  },

  updatePassword: async (data: any) => {
    try {
      const response = await privateApi.put("/profile/update-password", data);
      return response.data;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  },

  updateProfile: async (data: any, isImg: boolean = false) => {
    try {
      const endpoint = isImg ? "/profile/update-img" : "/profile/update";
      const response = await privateApi.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Get user profile - FIXED to use V2
  getProfile: async (): Promise<{ success: boolean; data: User; message: string }> => {
    try {
      const response = await privateApi.get("/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },
};