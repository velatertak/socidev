import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, AuthUser } from "../lib/api/auth";
import { formatBalance } from "../utils/format";

interface User extends Required<AuthUser> {
  profileImage?: string;
  balance: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authApi
        .validateToken(token)
        .then((response: any) => {
          setIsAuthenticated(true);
          if (response.user) {
            setUser({
              ...response.user,
              balance: Number(response.user.balance) || 0,
            });
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      const completeUser: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        username: response.user.username,
        phone: response.user.phone || "",
        balance: Number(response.user.balance) || 0,
        createdAt: response.user.createdAt || new Date().toISOString(),
      };

      // Dispatch a custom event to notify other contexts
      window.dispatchEvent(new CustomEvent("userLoggedIn"));

      localStorage.setItem("token", response.token);
      setUser(completeUser);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    // Dispatch a custom event to notify other contexts
    window.dispatchEvent(new CustomEvent("userLoggedOut"));
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
