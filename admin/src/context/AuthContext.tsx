import { API_URL } from "../config/api";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  image?: string;
  job_title?: string;
  permissions?: string[];
}

export interface TwoFactorChallenge {
  require2FA: boolean;
  twoFactorToken?: string;
  methods?: string[];
  phoneMasked?: string;
  whatsappSent?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<TwoFactorChallenge>;
  verify2FA: (twoFactorToken: string, code: string, method?: string) => Promise<void>;
  resendWhatsApp2FA: (twoFactorToken: string) => Promise<string>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  hasPermission: (permissionKey: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("adminToken"));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("adminUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedUser = localStorage.getItem("adminUser");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const hasPermission = (permissionKey: string): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (!user.permissions || !Array.isArray(user.permissions)) return false;
    return user.permissions.includes(permissionKey) || user.permissions.includes("all");
  };

  const login = async (email: string, password: string): Promise<TwoFactorChallenge> => {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Invalid credentials");
    }

    // Check if 2-Step Authentication challenge was returned
    if (data.require2FA) {
      return {
        require2FA: true,
        twoFactorToken: data.twoFactorToken,
        methods: data.methods || ["whatsapp", "authenticator"],
        phoneMasked: data.phoneMasked,
        whatsappSent: data.whatsappSent,
      };
    }

    // Direct Login Successful (2FA Disabled)
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    navigate("/");
    return { require2FA: false };
  };

  const verify2FA = async (twoFactorToken: string, code: string, method?: string) => {
    const res = await fetch(`${API_URL}/api/auth/2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ twoFactorToken, code, method }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Invalid verification code");
    }

    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    navigate("/");
  };

  const resendWhatsApp2FA = async (twoFactorToken: string): Promise<string> => {
    const res = await fetch(`${API_URL}/api/auth/2fa/send-whatsapp-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ twoFactorToken }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to resend WhatsApp OTP");
    }
    return data.message || "OTP resent successfully";
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    setUser(null);
    navigate("/signin");
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("adminUser", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, verify2FA, resendWhatsApp2FA, logout, updateUser, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
