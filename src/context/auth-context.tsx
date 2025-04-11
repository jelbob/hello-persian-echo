
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in from local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // For demo purposes, we'll accept any login with a valid email format
      // In a real app, this would be a fetch request to your API
      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }

      // Simulating API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock user data
      const userData: User = {
        id: "1",
        name: email.split("@")[0],
        email,
        role: "admin",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success("ورود موفقیت آمیز");
      navigate("/dashboard");
    } catch (error) {
      toast.error("ورود ناموفق. لطفا دوباره تلاش کنید.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("با موفقیت خارج شدید");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
