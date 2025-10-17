import { createContext, useState, useEffect } from "react";
import { verifyToken, signout as apiSignout } from "../api/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const verifiedUser = await verifyToken();
          if (verifiedUser) {
            setUser(verifiedUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            // Optionnel : nettoyer le local storage si le token est invalide
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
            localStorage.removeItem('clientToken');
          }
        } catch (error) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);
    }

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData.user);
    setIsAuthenticated(true);
    // La sauvegarde dans localStorage est déjà faite par signin dans auth.js
  };

  const logout = async () => {
    await apiSignout();
    setUser(null);
    setIsAuthenticated(false);
    // Le nettoyage du localStorage est déjà fait par signout dans auth.js
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
}