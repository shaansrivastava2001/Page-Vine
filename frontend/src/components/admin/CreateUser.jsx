import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Header from "../common/Header";
import UserService from "../../services/user.service";
import { getUser } from "../../utils/auth";

const ROLES = ["User", "Implementor", "Admin", "Super Admin"];
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const CreateUser = () => {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "User",
  });
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const availableRoles = currentUser?.role === "Super Admin"
    ? ROLES
    : ROLES.filter((r) => r !== "Admin" && r !== "Super Admin");

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key === "email") {
      setEmailError(e.target.value && !emailRegex.test(e.target.value) ? "Please enter a valid email address" : "");
    }
  };

  const canSubmit =
    form.name.trim() &&
    form.username.trim() &&
    form.email.trim() &&
    form.password.length >= 6 &&
    !emailError &&
    !submitting;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await UserService.createUser(form);
      toast.success(`${form.role} "${form.username}" created`);
      navigate("/users");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create user";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="page-narrow">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="page-header__text">
            <h2 className="page-title">Create user</h2>
            <p className="page-subtitle">Add a new account and assign a role.</p>
          </div>
        </div>

        <form className="form-card" onSubmit={submit} autoComplete="off" noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name" className="field__label">Full name</label>
              <input
                id="name"
                type="text"
                className="field__input"
                value={form.name}
                onChange={set("name")}
                autoComplete="off"
                placeholder="Jane Doe"
              />
            </div>

            <div className="field">
              <label htmlFor="username" className="field__label">Username</label>
              <input
                id="username"
                type="text"
                className="field__input"
                value={form.username}
                onChange={set("username")}
                autoComplete="off"
                placeholder="janedoe"
              />
            </div>

            <div className="field field--full">
              <label htmlFor="email" className="field__label">Email</label>
              <input
                id="email"
                type="email"
                className="field__input"
                value={form.email}
                onChange={set("email")}
                autoComplete="off"
                placeholder="jane@example.com"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && <span id="email-error" className="field__error">{emailError}</span>}
            </div>

            <div className="field field--full">
              <label htmlFor="password" className="field__label">Password</label>
              <input
                id="password"
                type="password"
                className="field__input"
                value={form.password}
                onChange={set("password")}
                autoComplete="new-password"
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="field field--full">
              <label htmlFor="role" className="field__label">Role</label>
              <select
                id="role"
                className="field__input field__select"
                value={form.role}
                onChange={set("role")}
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {currentUser?.role !== "Super Admin" && (
                <span className="field__hint">Only Super Admins can assign Admin or Super Admin.</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-link" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {submitting ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateUser;
