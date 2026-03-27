import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const CASHIER_EMAIL = 'MangoQ@gmail.com';
const CASHIER_PASSWORD = 'Saro_1973';
const AUTH_STORAGE_KEY = 'cashier_session';

interface AuthUser {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedEmail === CASHIER_EMAIL) {
      setUser({ email: storedEmail });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (email === CASHIER_EMAIL && password === CASHIER_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, email);
      setUser({ email });
      return { error: null };
    }
    return { error: 'Credenciales inválidas.' };
  };

  const signOut = async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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
