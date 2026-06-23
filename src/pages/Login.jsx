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
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const demoAccounts = [
  {
    role: "Admin",
    email: "admin@labflow.edu",
    userId: "USER-008",
    color: "bg-primary-500",
    iconBg: "bg-primary-50 text-primary-600",
  },
  {
    role: "Professor",
    email: "professor@labflow.edu",
    userId: "USER-001",
    color: "bg-accent-500",
    iconBg: "bg-accent-50 text-accent-600",
  },
  {
    role: "Student",
    email: "student@labflow.edu",
    userId: "USER-009",
    color: "bg-secondary-400",
    iconBg: "bg-secondary-50 text-secondary-600",
  },
  {
    role: "Technician",
    email: "tech@labflow.edu",
    userId: "USER-004",
    color: "bg-muted-400",
    iconBg: "bg-muted-50 text-muted-600",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.06,
      duration: 0.35,
      ease: "easeOut",
    },
  }),
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validateForm() {
    const next = {};

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate auth delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // For demo: accept any email that matches a demo account pattern,
    // otherwise try a simple lookup or default to first user
    const matched = demoAccounts.find(
      (d) => d.email.toLowerCase() === email.toLowerCase().trim(),
    );

    if (matched) {
      const success = login(matched.userId);
      if (success) {
        toast.success("Signed in successfully", {
          description: `Welcome back, ${matched.role}`,
        });
        navigate("/", { replace: true });
        return;
      }
    }

    // Fallback: try login with the email as a lookup
    // Since our auth system uses userId, try basic fallback
    const fallbackSuccess = login("USER-001");
    if (fallbackSuccess) {
      toast.success("Signed in successfully");
      navigate("/", { replace: true });
    } else {
      toast.error("Authentication failed", {
        description: "Please check your credentials and try again.",
      });
    }

    setIsLoading(false);
  }

  function handleDemoClick(account) {
    setEmail(account.email);
    setPassword("password123");
    setErrors({});
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
      <form onSubmit={handleSubmit} className="px-8 pb-6" noValidate>
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
              placeholder="you@labflow.edu"
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
          className="mb-2"
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

        {/* Forgot password */}
        <motion.div
          variants={itemVariants}
          custom={4}
          initial="hidden"
          animate="visible"
          className="mb-6 text-right"
        >
          <button
            type="button"
            onClick={() =>
              toast.info("Password reset", {
                description:
                  "In a production environment, this would send a reset link to your email.",
              })
            }
            className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Forgot password?
          </button>
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

      {/* Demo credentials section */}
      <motion.div
        variants={itemVariants}
        custom={6}
        initial="hidden"
        animate="visible"
        className="border-t border-gray-100 bg-gray-50/50 px-8 py-5"
      >
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
          Demo: Click any credential to auto-fill
        </p>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((account, idx) => (
            <button
              key={account.userId}
              type="button"
              onClick={() => handleDemoClick(account)}
              className="group flex items-center gap-2.5 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-left transition-all duration-200 hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-soft"
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${account.iconBg}`}
              >
                <span className="text-xs font-bold">{account.role[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {account.role}
                </p>
                <p className="truncate text-[11px] text-gray-400">
                  {account.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
