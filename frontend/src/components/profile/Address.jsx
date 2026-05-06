import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../styles/style.scss";
import UserService from "../../services/user.service";
import Header from "../common/Header";

const Address = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    house: location.state?.house || "",
    locality: location.state?.locality || "",
    city: location.state?.city || "",
    state: location.state?.state || "",
    pin: location.state?.pin || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit =
    form.house.toString().trim() &&
    form.locality.toString().trim() &&
    form.city.toString().trim() &&
    form.state.toString().trim() &&
    form.pin.toString().trim() &&
    !submitting;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await UserService.addAddress(form);
      if (res) navigate(-1);
      else toast.error("Could not save address. Please try again.");
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not save address.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Empty placeholder for an icon-button column on the right of the header.
  useEffect(() => {}, []);

  return (
    <>
      <Header />
      <div className="page-narrow">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="page-header__text">
            <h2 className="page-title">Your address</h2>
            <p className="page-subtitle">We use this for shipping and order updates.</p>
          </div>
        </div>

        <form className="form-card" onSubmit={submit} autoComplete="off" noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="house" className="field__label">House no.</label>
              <input id="house" type="text" className="field__input" value={form.house} onChange={set("house")} placeholder="A‑12, Apt 4B" />
            </div>

            <div className="field">
              <label htmlFor="locality" className="field__label">Locality</label>
              <input id="locality" type="text" className="field__input" value={form.locality} onChange={set("locality")} placeholder="Street, area" />
            </div>

            <div className="field">
              <label htmlFor="city" className="field__label">City</label>
              <input id="city" type="text" className="field__input" value={form.city} onChange={set("city")} placeholder="Mumbai" />
            </div>

            <div className="field">
              <label htmlFor="state" className="field__label">State</label>
              <input id="state" type="text" className="field__input" value={form.state} onChange={set("state")} placeholder="Maharashtra" />
            </div>

            <div className="field field--full">
              <label htmlFor="pin" className="field__label">PIN code</label>
              <input id="pin" type="text" inputMode="numeric" pattern="[0-9]*" className="field__input" value={form.pin} onChange={set("pin")} placeholder="6-digit PIN" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-link" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {submitting ? "Saving…" : "Save address"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default Address;
