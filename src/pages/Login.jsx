import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { FlaskConical, ShieldAlert, Loader2 } from "lucide-react";
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
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleGoogleSuccess(credentialResponse) {
    setIsLoading(true);
    try {
      await loginWithGoogle(credentialResponse);
      toast.success("Signed in successfully");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Login failed", {
        description: err.message || "Unable to sign in with Google.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleError() {
    toast.error("Google Sign-In failed", {
      description: "Please try again or use a different account.",
    });
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md overflow-hidden rounded-lg border border-gray-100 bg-white shadow-elevated"
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

      {/* Login section */}
      <div className="px-8 pb-8">
        {/* Domain restriction notice */}
        <motion.div
          variants={itemVariants}
          custom={2}
          initial="hidden"
          animate="visible"
          className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              KMITL accounts only
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              Only <strong>@kmitl.ac.th</strong> email addresses are permitted.
              Please sign in with your university Google account.
            </p>
          </div>
        </motion.div>

        {/* Google Sign-In button */}
        <motion.div
          variants={itemVariants}
          custom={3}
          initial="hidden"
          animate="visible"
          className="flex justify-center"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 rounded-md border border-gray-200 px-6 py-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              size="large"
              shape="pill"
              text="signin_with"
              theme="outline"
              width="320"
            />
          )}
        </motion.div>

        <motion.p
          variants={itemVariants}
          custom={4}
          initial="hidden"
          animate="visible"
          className="mt-6 text-center text-xs text-gray-400"
        >
          By signing in, you agree to LabFlow&apos;s terms of service.
        </motion.p>
      </div>
    </motion.div>
  );
}
