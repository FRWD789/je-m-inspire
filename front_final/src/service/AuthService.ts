// services/authService.js
import { privateApi, publicApi } from "../api/api";

export type Credentials = {
    email:string,
    password:string
}
 export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation:string
}




export const authService = {
  // Refresh token endpoint
  refresh: async (): Promise<{access_token:string}> => {
    try {
      const response = await privateApi.get("/refresh");
    console.log(response.data.access_token)
      return response.data; // Return only data
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error; // Let the caller handle it
    }
  },

  // Login endpoint
  register: async (registerCredentials:RegisterCredentials) => {
    try {
      const response = await publicApi.post("/register", registerCredentials);
      return response.data;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },
  // Login endpoint
  login: async (credentials:Credentials) => {
    try {
      const response = await publicApi.post("/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  // Logout endpoint
  logout: async () => {
    try {
      const response = await privateApi.post("/logout");
      return response.data;
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  },

  // Optional: Get user profile
  getProfile: async () => {
    try {
      const response = await privateApi.get("/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },
};