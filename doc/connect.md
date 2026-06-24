You are setting up a FastAPI backend with SQLite for local development and adding Google OAuth login (restricted to @kmitl.ac.th). The project is a monorepo with React frontend (`src/`) and FastAPI backend (`app/`).

## Current State

### Backend (`app/`)
- FastAPI + SQLAlchemy, configured for MySQL but NOT running
- `.env` file has ONLY frontend vars (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`) — NO `DATABASE_URL` or `SECRET_KEY` so backend cannot start
- `app/config.py` — `Settings` class with `DATABASE_URL: str`, `SECRET_KEY: str`, reads from `.env`
- `app/database.py` — `create_engine(settings.DATABASE_URL)` only, no SQLite compat
- `app/models/user.py` — User model: id, email, password (NOT NULL), full_name, role (admin|user), is_active, created_at, updated_at
- `app/api/auth.py` — `POST /auth/login` (LoginRequest → LoginResponse), `POST /auth/token` (OAuth2 form for Swagger)
- `app/services/auth_service.py` — authenticate() checks email+password, create_access_token({"sub": str(user.id), "role": user.role.value}); create_user(); list_users(); get_user()
- `app/core/security.py` — hash_password, verify_password (bcrypt), create_access_token, decode_token (HS256, 24h expiry)
- `app/api/deps.py` — get_db (SessionLocal), get_current_user (Bearer → decode_token → query User), require_admin
- `app/main.py` — FastAPI app with lifespan (create_all tables on startup), mounts auth_router + users_router + items_router + locations_router + borrow_router + stats_router at /api
- `requirements.txt` — fastapi==0.111.0, uvicorn[standard]==0.29.0, pydantic==2.7.0, sqlalchemy==2.0.30, pymysql==1.1.0, python-jose[cryptography]==3.3.0, passlib[bcrypt]==1.7.4, etc. (pinned versions incompatible with Python 3.14)

### Frontend (`src/`)
- React 19, react-router-dom v6, @tanstack/react-query v5, framer-motion, sonner, lucide-react
- `.env` has `VITE_API_URL=http://localhost:8000` and `VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com`
- `src/main.jsx` — ReactDOM root with QueryClientProvider, BrowserRouter, AuthProvider, Toaster
- `src/pages/Login.jsx` — email/password form with framer-motion, calls useAuth().login(email, password), toast on success/error
- `src/hooks/useAuth.jsx` — AuthContext: login(email,password) calls authService.login() then stores in localStorage as lab_token + lab_currentUser; logout() clears; also has currentUser, token, isAuthenticated, isLoading; restores from localStorage on mount
- `src/services/authService.js` — `authService.login(email, password)` calls `apiClient.post('/auth/login', { email, password })`
- `src/lib/apiClient.js` — fetch wrapper: base URL `/api`, auto-attaches `Authorization: Bearer <token>` from localStorage, parses `{"detail": "..."}` errors
- `package.json` — react 19, @tanstack/react-query, framer-motion, sonner, lucide-react, recharts, etc. No @react-oauth/google yet

## Tasks

### PART 1: Switch to SQLite + Fix .env + Fix Python 3.14 compatibility

**File 1: `.env`** — Replace the entire file content with:
DATABASE_URL=sqlite:///./invent.db SECRET_KEY=dev-secret-key-change-in-production GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com VITE_API_URL=http://localhost:8000 VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com

(Replace `xxxxxxxxxxxx.apps.googleusercontent.com` with the real Client ID from Google Cloud Console)

**File 2: `app/config.py`** — Add `GOOGLE_CLIENT_ID` to Settings class:
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    GOOGLE_CLIENT_ID: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
File 3: app/database.py — Add SQLite connect_args:

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
File 4: requirements.txt — Replace with versions compatible with Python 3.14 AND add google-auth:

# Web framework
fastapi>=0.115.0
uvicorn[standard]>=0.32.0

# Data validation
pydantic>=2.10.0
pydantic-settings>=2.6.0

# Database
sqlalchemy>=2.0.36
pymysql>=1.1.1
alembic>=1.13.1

# Auth
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
google-auth>=2.35.0

# Dev / testing
pytest>=8.3.0
pytest-asyncio>=0.24.0
httpx>=0.27.2
python-dotenv>=1.0.1

# Utilities
python-multipart>=0.0.12
After updating requirements.txt, run:

pip install -r requirements.txt
PART 2: Add Google OAuth to Backend
File 5: app/models/user.py — Modify User model:

Change password = Column(String(255), nullable=False) → password = Column(String(255), nullable=True) (Google users have no password)
Add after the password line: auth_provider = Column(String(20), nullable=False, default="email")
Keep everything else unchanged (UserRoleEnum, relationship, etc.)
File 6: app/schemas/user.py — Add GoogleLoginRequest at the end (before or after existing classes):

class GoogleLoginRequest(BaseModel):
    credential: str
File 7: app/core/google_auth.py — NEW file:

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status

ALLOWED_DOMAIN = "@kmitl.ac.th"

def verify_google_token(credential: str, client_id: str) -> dict:
    try:
        request = google_requests.Request()
        info = id_token.verify_oauth2_token(credential, request, client_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    if info.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
        )

    email = info.get("email", "")
    if not email.lower().endswith(ALLOWED_DOMAIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only {ALLOWED_DOMAIN} emails are allowed",
        )

    return {
        "email": email,
        "name": info.get("name", ""),
        "google_id": info.get("sub"),
    }
File 8: app/services/auth_service.py — Add authenticate_google() function. Keep all existing functions (authenticate, authenticate_form, create_user, list_users, get_user). Add at the end:

from app.core.google_auth import verify_google_token
from app.core.security import create_access_token
from app.config import settings

def authenticate_google(db: Session, credential: str) -> LoginResponse:
    info = verify_google_token(credential, settings.GOOGLE_CLIENT_ID)
    email = info["email"]
    name = info["name"]

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password=None,
            full_name=name or email.split("@")[0],
            role=UserRoleEnum.user,
            auth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )
Make sure the import at the top of auth_service.py includes LoginResponse and LoginRequest from schemas (check existing — LoginResponse is probably already imported). Also verify User and UserRoleEnum are already imported.

File 9: app/api/auth.py — Add the new route. Keep existing routes (POST /auth/login, POST /auth/token). Add:

from app.schemas.user import GoogleLoginRequest  # add to existing imports

@router.post("/auth/google", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def google_login(
    body: GoogleLoginRequest,
    db: Session = Depends(get_db),
) -> LoginResponse:
    """Login with Google ID token. Only @kmitl.ac.th emails are accepted."""
    return auth_service.authenticate_google(db, body.credential)
PART 3: Update Frontend for Google Login
File 10: Run in terminal:

npm install @react-oauth/google
File 11: src/main.jsx — Import GoogleOAuthProvider and wrap the app. Keep everything else:

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./hooks/useAuth";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <App />
          </AuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#fff",
                border: "1px solid #f0f0f0",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                fontSize: "14px",
              },
            }}
          />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
File 12: src/services/authService.js — Replace login with googleLogin:

import apiClient from '../lib/apiClient'

export const authService = {
  googleLogin(credential) {
    return apiClient.post('/auth/google', { credential })
  },
}
File 13: src/hooks/useAuth.jsx — Replace login(email,password) with googleLogin(credential):

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("lab_token");
      const storedUser = localStorage.getItem("lab_currentUser");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("lab_token");
      localStorage.removeItem("lab_currentUser");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credential) => {
    const data = await authService.googleLogin(credential);
    const { access_token, user } = data;
    localStorage.setItem("lab_token", access_token);
    localStorage.setItem("lab_currentUser", JSON.stringify(user));
    setToken(access_token);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("lab_token");
    localStorage.removeItem("lab_currentUser");
    setToken(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
File 14: src/pages/Login.jsx — Rewrite with Google Sign-In only (no email/password). Keep same visual style and framer-motion animations:

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { FlaskConical, GraduationCap } from "lucide-react";
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
  const { login, isAuthenticated } = useAuth();

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

      {/* Google Sign-In */}
      <div className="px-8 pb-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600 text-center">
            Sign in with your KMITL email to access the lab inventory system.
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
            <span>Only <strong>@kmitl.ac.th</strong> emails are allowed</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
