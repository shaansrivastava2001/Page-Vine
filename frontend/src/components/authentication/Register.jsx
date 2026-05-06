import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import "./authenticationStyle.scss";
import { metadata } from '../../metadata/metadata';

import UserService from "../../services/user.service";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const Register = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Derived: avoids the stale-closure bug the previous handlers had.
  const allFilled =
    name.trim().length > 0 &&
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0;
  const canSubmit = allFilled && !emailError && !submitting;

  useEffect(() => {
    document.body.classList.add("auth-bg");
    return () => document.body.classList.remove("auth-bg");
  }, []);

  const onEmailChange = (e) => {
    const v = e.target.value;
    setEmail(v);
    setEmailError(v && !emailRegex.test(v) ? "Please enter a valid email address" : "");
  };

  const register = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const response = await UserService.registerUser(name, username, email, password);
      const newUserId = response?.data?.newUser?._id;
      if (!newUserId) {
        toast.error("Registration failed. Please try again.");
        return;
      }
      const otpResponse = await UserService.sendOtp(newUserId);
      if (otpResponse) {
        navigate('/verifyEmail', { state: { id: newUserId, email } });
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
      <div className="container auth-container">
        <div className="row">
          <div className="col-sm-6 left">
            <h1>{metadata.appName}</h1>
            <h2>{metadata.appTagline}</h2>
            <img src={metadata.appSvg} alt="donation image" className="mt-5 img-responsive" />
          </div>
          <div className="col-sm-6 right">
            <div className="register-card">
              <h2>Register</h2>
              <h3>Enter your credentials</h3>
              <form className="register-form" onSubmit={register} autoComplete="off" noValidate>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    placeholder="Name"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                    autoComplete="name"
                  />
                  <label htmlFor="name">Name</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    placeholder="Username"
                    name="username"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control"
                    autoComplete="username"
                  />
                  <label htmlFor="username">Username</label>
                </div>
                <div className="form-floating">
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={onEmailChange}
                    className="form-control"
                    autoComplete="email"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                  <label htmlFor="email">Email</label>
                </div>
                <p id="email-error" className="text-danger m-0 p-0" role="alert">{emailError}</p>
                <div className="input-container form-floating">
                  <input
                    className="input-field form-control"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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
                <Link to={"/login"}>Already have an account?</Link>
                <button type="submit" id="submitBtn" disabled={!canSubmit}>
                  {submitting ? "Creating account…" : "Register"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Register;
