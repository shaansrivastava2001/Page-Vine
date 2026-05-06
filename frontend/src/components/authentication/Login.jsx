import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./authenticationStyle.scss";
import { metadata } from '../../metadata/metadata';

import UserService from "../../services/user.service";
import { scheduleAutoLogout } from "../../utils/auth";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import Cookies from 'js-cookie';
import Alert from 'react-bootstrap/Alert';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate();

  // Derived: avoids stale-closure bug the previous handlers had.
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

  const showUnverified = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const persistSession = (token, isVerified) => {
    const payload = jwt_decode(token);
    Cookies.set('userToken', JSON.stringify(payload), { expires: 2 / 24 });
    Cookies.set('token', token, { expires: 2 });
    Cookies.set('isVerified', isVerified, { expires: 2 });
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
        navigate("/books");
      } else {
        showUnverified();
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
      navigate("/books");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Google sign-in failed";
      toast.error(msg);
    }
  };

  return (
    <>
      {showAlert && (
        <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible className="text-center container">
          <strong>Your account is not verified yet.</strong> Check your email for the verification link.
        </Alert>
      )}

      <div className="container auth-container">
        <div className="row">
          <div className="col-sm-6 left">
            <h1>{metadata.appName}</h1>
            <h2>{metadata.appTagline}</h2>
            <img src={metadata.appSvg} alt="donation image" className="mt-5 img-responsive" />
          </div>
          <div className="col-sm-6 right">
            <div className="login-card">
              <h2>Login</h2>
              <h3>Enter your credentials</h3>
              <form className="login-form" onSubmit={login} autoComplete="off" noValidate>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    autoComplete="email"
                  />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="input-container form-floating">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field form-control"
                    autoComplete="current-password"
                  />
                  <label htmlFor="password">Password</label>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowPassword((v) => !v)}
                  >
                    <i className={showPassword ? "fa-sharp fa-solid fa-eye toggle" : "fa-solid fa-eye-slash"} id="toggle"></i>
                  </span>
                </div>
                <Link to={"/register"}>Don't have an account?</Link>
                <button type="submit" id="submitBtn" disabled={!canSubmit}>
                  {submitting ? "Logging in…" : "Login"}
                </button>
                <p className="or">or</p>
                <div className="googleLogin m-auto">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google sign-in failed")}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Login;
