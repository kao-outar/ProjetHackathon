import { createContext, useState, useEffect } from "react";
import { verifyToken, signout as apiSignout } from "../api/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const verifiedUser = await verifyToken();
        if (verifiedUser) {
          setUser(verifiedUser);
        } else {
          setUser(null);
        }
      }
      
      setLoading(false);
    }

    checkAuth();
  }, []);

  const logout = async () => {
    await apiSignout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}