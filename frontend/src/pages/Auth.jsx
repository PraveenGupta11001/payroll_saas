import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Github, Globe, ArrowRight, User } from "lucide-react";
import { cn } from "../lib/utils";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 mb-4 animate-bounce">
            <User size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Please enter your details to access your workspace.</p>
        </div>

        <div className="glass-card p-8 shadow-2xl border-white/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary/50 border border-border p-2.5 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between ml-1 mb-1.5 ">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary/50 border border-border p-2.5 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 ml-1">* Password must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold p-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary transition-all text-sm font-medium">
              <Globe size={16} /> Google
            </button>
            <button className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary transition-all text-sm font-medium">
              <Github size={16} /> GitHub
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground font-medium">
          New to Payroll SaaS?{" "}
          <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      const success = await register(email, password, fullName);
      setLoading(false);
      if (success) navigate("/login");
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
             <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 mb-4 animate-pulse">
                <LogIn size={24} />
             </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Create Workspace</h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium">Join 2,000+ companies managing payroll efficiently.</p>
          </div>
  
          <div className="glass-card p-8 shadow-2xl border-white/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-secondary/50 border border-border p-2.5 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/50 border border-border p-2.5 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
  
              <div className="group">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary/50 border border-border p-2.5 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>
  
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold p-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 group mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
  
          <p className="text-center text-sm text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    );
  };
