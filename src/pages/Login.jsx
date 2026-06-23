import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  FlaskConical,
  Mail,
  Lock,
  LogIn,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
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

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  function validateForm() {
    const next = {};
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please enter a valid email address";
    }
    if (!password) {
      next.password = "Password is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Signed in successfully");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Login failed", {
        description: err.message || "Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  }

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
        <motion.h1
          variants={itemVariants}
          custom={0}
          initial="hidden"
          animate="visible"
          className="mt-4 text-2xl font-bold tracking-tight text-gray-900"
        >
          LabFlow
        </motion.h1>
        <motion.p
          variants={itemVariants}
          custom={1}
          initial="hidden"
          animate="visible"
          className="mt-1 text-sm text-gray-500"
        >
          Laboratory Management System
        </motion.p>
      </div>

      {/* Login form */}
      <form onSubmit={handleSubmit} className="px-8 pb-8" noValidate>
        {/* Email field */}
        <motion.div
          variants={itemVariants}
          custom={2}
          initial="hidden"
          animate="visible"
          className="mb-4"
        >
          <label htmlFor="email" className="label">
            Email address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              placeholder="you@university.edu"
              autoComplete="email"
              className={`input pl-10 ${errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 text-xs text-red-500"
            >
              {errors.email}
            </motion.p>
          )}
        </motion.div>

        {/* Password field */}
        <motion.div
          variants={itemVariants}
          custom={3}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: "" }));
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={`input pl-10 pr-10 ${errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 text-xs text-red-500"
            >
              {errors.password}
            </motion.p>
          )}
        </motion.div>

        {/* Sign In button */}
        <motion.div
          variants={itemVariants}
          custom={5}
          initial="hidden"
          animate="visible"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
