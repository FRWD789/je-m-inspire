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

