// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure stored user has an id (in case it was saved before the change)
      setUser(parsed.id ? parsed : { ...parsed, id: Date.now() });
    }
  }, []);

  const login = (userData, token) => {
    // --------------------------------------------------------------
    // 1. Make sure the user object ALWAYS has an `id`
    // --------------------------------------------------------------
    const userWithId = userData.id
      ? userData
      : { ...userData, id: Date.now() }; // <-- auto-generated id

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userWithId));
    setUser(userWithId);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);