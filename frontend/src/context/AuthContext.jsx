import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on load
  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          // Token is invalid or expired
          console.error("Session verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password) => {
    const data = await authService.register(username, email, password);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const data = await authService.updateMe(profileData);
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
