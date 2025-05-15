import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { Moon, Sun, Globe } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { login, loading } = useAuth();
  const { theme, toggleTheme, language, toggleLanguage, t } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await login(email, password);
    } catch (error: any) {
      setErrorMsg(error.message || (language === "ar" ? "فشل تسجيل الدخول" : "Login failed"));
    }
  };

  //  dashboard 
  // const { user } = useAuth();
  // if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-dna-pattern bg-cover flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 flex gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleLanguage}>
          <Globe size={20} />
        </Button>
      </div>
      
      <Card className="w-full max-w-md glass-morphism">
        <CardHeader className="text-center">
          <CardTitle className={`text-2xl font-bold ${language === "ar" ? "font-vazir" : ""}`}>
            DNA Admin
          </CardTitle>
          <CardDescription className={language === "ar" ? "font-vazir" : ""}>
            {t("login")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className={`text-sm font-medium ${language === "ar" ? "font-vazir" : ""}`}>
                {t("email")}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className={`text-sm font-medium ${language === "ar" ? "font-vazir" : ""}`}>
                {t("password")}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <span className={language === "ar" ? "font-vazir" : ""}>
                {loading ? (language === "ar" ? "جارٍ تسجيل الدخول..." : "Logging in...") : t("loginButton")}
              </span>
            </Button>
            {errorMsg && (
              <div className="text-red-500 text-sm text-center">{errorMsg}</div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          <p className={language === "ar" ? "font-vazir" : ""}>
            DNA Admin &copy; {new Date().getFullYear()}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
