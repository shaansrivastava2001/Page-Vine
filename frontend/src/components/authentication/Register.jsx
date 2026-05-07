import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import "./authenticationStyle.scss";
import "../../styles/style.scss";
import { metadata } from "../../metadata/metadata";

import UserService from "../../services/user.service";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const canSubmit =
    form.name.trim() &&
    form.username.trim() &&
    form.email.trim() &&
    form.password.length >= 6 &&
    !emailError &&
    !submitting;

  useEffect(() => {
    document.body.classList.add("auth-bg");
    return () => document.body.classList.remove("auth-bg");
  }, []);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key === "email") {
      setEmailError(e.target.value && !emailRegex.test(e.target.value) ? "Please enter a valid email address" : "");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const response = await UserService.registerUser(form.name, form.username, form.email, form.password);
      const newUserId = response?.data?.newUser?._id;
      if (!newUserId) {
        toast.error("Registration failed. Please try again.");
        return;
      }
      const otpResponse = await UserService.sendOtp(newUserId);
      if (otpResponse) {
        navigate("/verifyEmail", { state: { id: newUserId, email: form.email } });
      } else {
        toast.error("Could not send verification code");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="auth-page">
      <aside className="auth-hero">
        <div className="auth-hero__books" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="auth-hero__book" />
          ))}
        </div>
        <div className="auth-hero__content">
          <span className="auth-hero__tag">{metadata.appName}</span>
          <h1 className="auth-hero__title">
            Join the library. <br />
            Pass on a book.
          </h1>
          <p className="auth-hero__lede">
            Sign up free, donate the books you've finished, request the ones
            you want next, and meet readers in your area.
          </p>
          <ul className="auth-hero__stats">
            <li><strong>2 mins</strong><span>to sign up</span></li>
            <li><strong>0 ₹</strong><span>to join</span></li>
            <li><strong>1 click</strong><span>to donate</span></li>
          </ul>
        </div>
      </aside>

      <main className="auth-card">
        <div className="auth-card__brand">{metadata.appName}</div>

        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Join the library — donate, borrow, and request books.</p>

        <form className="auth-form" onSubmit={submit} autoComplete="off" noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name" className="field__label">Full name</label>
              <input id="name" type="text" className="field__input" value={form.name} onChange={set("name")} placeholder="Jane Doe" autoComplete="name" />
            </div>

            <div className="field">
              <label htmlFor="username" className="field__label">Username</label>
              <input id="username" type="text" className="field__input" value={form.username} onChange={set("username")} placeholder="janedoe" autoComplete="username" />
            </div>

            <div className="field field--full">
              <label htmlFor="email" className="field__label">Email</label>
              <input
                id="email"
                type="email"
                className="field__input"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && <span id="email-error" className="field__error">{emailError}</span>}
            </div>

            <div className="field field--full">
              <label htmlFor="password" className="field__label">Password</label>
              <div className="field__input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="field__input"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  minLength={6}
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
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={!canSubmit}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </main>
    </div>
    <ToastContainer />
    </>
  );
};

export default Register;
