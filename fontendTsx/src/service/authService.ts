import axios from "axios";
import type { LoginCredentials, RegisterCredentials, ResetPasswordData } from "../types/auth";
import { api, privateApi } from "../api/api";


// --- Auth endpoints ---
const authService = {
  // Login user
  login: async (credentials:LoginCredentials) => {
    // credentials = { email, password }
    const response = await api.post("/login", credentials);
    return response.data;
  },

  // Register user
  register: async (userData:RegisterCredentials) => {
    // userData = { name, email, password, password_confirmation }
    const response = await api.post("/register", userData);
    return response.data.access_token
  },

  // Logout user
  logout: async () => {
    const response = await privateApi.post("/logout");
    return response.data;
  },

  // Refresh token
  refresh: async () => {
    const response = await api.get("/refresh");
    return response.data;
  },

  // forgot password
  forgotPassword : async (email: string) => {
  const res = await api.post("/forgot-password", { email });
  return res.data;
  },

  // reset password
  resetPassword : async (data: ResetPasswordData) => {
  const res = await api.post("/reset-password", data);
  return res.data;
}


};

export default authService;


