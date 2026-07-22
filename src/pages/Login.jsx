import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { FlaskConical, GraduationCap, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { login, emailLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleGoogleSuccess(response) {
    try {
      await login(response.credential);
      toast.success("Signed in successfully");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Login failed", {
        description: err.message || "Unable to sign in with Google.",
      });
    }
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setEmailLoading(true);
    try {
      await emailLogin(email, password);
      toast.success("Signed in successfully");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Login failed", {
        description: err.message || "Invalid email or password.",
      });
    } finally {
      setEmailLoading(false);
    }
  }

  if (isAuthenticated) return null;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-elevated"
    >
      {/* Brand header */}
      <div className="flex flex-col items-center px-8 pt-8 pb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-500 shadow-soft">
          <FlaskConical className="h-7 w-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
          LabFlow
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Laboratory Management System
        </p>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@kmitl.ac.th"
                className="input pl-10"
                autoComplete="email"
                disabled={emailLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input pl-10"
                autoComplete="current-password"
                disabled={emailLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={emailLoading}
            className="btn btn-primary w-full flex items-center justify-center gap-2 min-h-[44px]"
          >
            {emailLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400">or</span>
          </div>
        </div>

        {/* Google Sign-In */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500 text-center">
            Sign in with your KMITL Google account
          </p>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign-In failed")}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="300"
            />
          </div>

          <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs">
            <GraduationCap className="h-4 w-4 flex-shrink-0" />
            <span>
              Only <strong>@kmitl.ac.th</strong> emails are allowed
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
