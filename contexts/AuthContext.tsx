import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSecureItem, saveSecureItem, deleteSecureItem } from '../utils/storage';

export type UserRole = 'USER' | 'ADMIN';

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (token: string, userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserData>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Key constant
export const TOKEN_KEY = 'jwt_token';
export const USER_KEY = 'user_data';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục phiên đăng nhập khi boot app
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await getSecureItem(TOKEN_KEY);
        const storedUserJSON = await getSecureItem(USER_KEY);
        
        if (token && storedUserJSON) {
          const storedUser = JSON.parse(storedUserJSON);
          setUser(storedUser);
        }
      } catch (e) {
        console.error("Lỗi khi khôi phục Auth State", e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  const login = async (token: string, userData: UserData) => {
    await saveSecureItem(TOKEN_KEY, token);
    await saveSecureItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await deleteSecureItem(TOKEN_KEY);
    await deleteSecureItem(USER_KEY);
    setUser(null);
  };

  const updateUser = async (userData: Partial<UserData>) => {
    if (user) {
      const updated = { ...user, ...userData };
      await saveSecureItem(USER_KEY, JSON.stringify(updated));
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
