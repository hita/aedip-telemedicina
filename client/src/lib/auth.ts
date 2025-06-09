import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await response.json();
    return data.user;
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      const data = await response.json();
      return data.user;
    } catch (error) {
      return null;
    }
  },
};
