
export interface User {
  id: number;
  name: string;
  email: string;
}



export interface AuthResponse {
  token: string;
  user: User;
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation:string
}