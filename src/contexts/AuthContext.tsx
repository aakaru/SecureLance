import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { jwtDecode } from "jwt-decode"; 
import axios from 'axios'; 
type User = {
  id: string; 
  address: string;
  username: string;
};
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwtToken')); 
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('jwtToken');
      if (storedToken) {
        try {
          const decodedToken: { id: string; exp: number } = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 < Date.now()) {
            console.log("Token expired, logging out.");
            logout(); 
          } else {
            console.log("Token valid, setting user state.");
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            } else {
              console.warn("Token found but user data missing from localStorage.");
              logout(); 
            }
            setToken(storedToken);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          logout(); 
        }
      } else {
        console.log("No token found.");
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);
  const login = (userData: User, receivedToken: string) => {
    console.log("Logging in user:", userData);
    console.log("Received token:", receivedToken);
    setUser(userData);
    setToken(receivedToken);
    localStorage.setItem('jwtToken', receivedToken);
    localStorage.setItem('user', JSON.stringify(userData)); 
  };
  const logout = () => {
    console.log("Logging out user.");
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    toast.info('You have been logged out');
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token, 
        isLoading,
        login,
        logout,
        setUser, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
