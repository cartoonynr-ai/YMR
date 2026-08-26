import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'pos' | null;

export interface User {
  id: string;
  role: UserRole;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Load from LocalStorage on initial render
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    // Save to LocalStorage whenever user state changes
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = (role: UserRole) => {
    // Mock login logic
    const mockUser: User = {
      id: Math.random().toString(36).substring(7),
      role,
      name: role === 'admin' ? 'Administrator' : 'POS Staff',
      email: role === 'admin' ? 'admin@shop.com' : 'pos@shop.com',
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
