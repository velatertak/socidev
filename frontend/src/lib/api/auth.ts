import { fetchApi } from "../api";

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
  balance: number; // Ensure this is explicitly typed as number
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> =>
    fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (data: RegisterData): Promise<AuthResponse> =>
    fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  validateToken: (token: string): Promise<void> =>
    fetchApi("/auth/validate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
