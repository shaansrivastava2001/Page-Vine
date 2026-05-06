import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./authenticationStyle.scss";
import "../../styles/style.scss";
import { metadata } from "../../metadata/metadata";

import UserService from "../../services/user.service";
import { scheduleAutoLogout } from "../../utils/auth";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  useEffect(() => {
    document.body.classList.add("auth-bg");
    return () => document.body.classList.remove("auth-bg");
  }, []);

  useEffect(() => {
    try {
      const flash = sessionStorage.getItem("auth:flash");
      if (flash) {
        toast.info(flash);
        sessionStorage.removeItem("auth:flash");
      }
    } catch {}
  }, []);

  const persistSession = (token, isVerified) => {
    const payload = jwt_decode(token);
    Cookies.set("userToken", JSON.stringify(payload), { expires: 2 / 24 });
    Cookies.set("token", token, { expires: 2 });
    Cookies.set("isVerified", isVerified, { expires: 2 });
    scheduleAutoLogout();
  };

  const login = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await UserService.loginUser(email, password);
      if (res.data.user.isVerified) {
        persistSession(res.data.token, true);
        navigate("/home");
      } else {
        toast.warning("Your account is not verified yet. Check your email for the verification link.");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwt_decode(credentialResponse.credential);
      const res = await UserService.postGoogleUser({
        email: decoded.email,
        username: decoded.given_name,
        name: decoded.name,
        role: "User",
      });
      if (!res?.data?.token) {
        toast.error("Google sign-in failed");
        return;
      }
      persistSession(res.data.token, res.data.user.isVerified);
      navigate("/home");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Google sign-in failed";
      toast.error(msg);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-hero">
        <h1 className="auth-hero__title">{metadata.appName}</h1>
        <p className="auth-hero__tagline">{metadata.appTagline}</p>
        <img src={metadata.appSvg} alt="" className="auth-hero__image" />
      </aside>

      <div className="auth-card">
        <div className="auth-card__brand">{metadata.appName}</div>

        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__subtitle">Sign in to continue to your library.</p>

        <form className="auth-form" onSubmit={login} autoComplete="off" noValidate>
          <div className="field">
            <label htmlFor="email" className="field__label">Email</label>
            <input
              id="email"
              type="email"
              className="field__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <div className="field__label-row">
              <label htmlFor="password" className="field__label">Password</label>
            </div>
            <div className="field__input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="field__addon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={!canSubmit}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>

        <div className="auth-google">
          <GoogleLogin
            theme="outline"
            size="large"
            shape="rectangular"
            text="continue_with"
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google sign-in failed")}
          />
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
