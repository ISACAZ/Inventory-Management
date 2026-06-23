import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { users } from "../data/mockData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("lab_currentUser");
      return stored ? JSON.parse(stored) : users[0];
    } catch {
      return users[0];
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("lab_currentUser", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const login = useCallback((userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("lab_currentUser", JSON.stringify(user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("lab_currentUser");
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, isAuthenticated: !!currentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
