import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, User } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize auth token getter from localStorage on mount
    const stored = localStorage.getItem("token");
    setAuthTokenGetter(stored ? () => stored : null);
  }, []);

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("token");
      setAuthTokenGetter(null);
      setToken(null);
    }
  }, [isError]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setAuthTokenGetter(() => newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthTokenGetter(null);
    setToken(null);
    // Clear all cached query data so no stale user/data bleeds through
    queryClient.clear();
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: token ? (user ?? null) : null,
        token,
        isLoading: !!token && isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
