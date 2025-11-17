import { authService } from "@/service/authService";
import { tokenService } from "@/service/TokenService";
import axios from "axios";
const API_URL  = "http://localhost:8000/api"
export const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials:true
});


export const privateApi = axios.create({
  baseURL: API_URL,
  withCredentials:true
});

// --------------------
// Request Interceptor
// --------------------

privateApi.interceptors.request.use(
  (config) => {
    const token = tokenService.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// Response Interceptor
// --------------------

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { access_token } = await authService.refresh();
          tokenService.set(access_token);
          isRefreshing = false;
          onRefreshed(access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return privateApi(originalRequest);
        } catch (err) {
          isRefreshing = false;
          tokenService.clear();
          return Promise.reject(err);
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(privateApi(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);