import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../styles/style.scss";
import BookService from "../../services/book.service";
import Header from "../common/Header";

const EditBook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Initialize from location.state — note Bookdetails uses `name` for title.
  const initial = {
    title: location.state?.name ?? "",
    author: location.state?.author ?? "",
    price: location.state?.price ?? "",
    sale_price: location.state?.sale_price ?? "",
    quantity: location.state?.quantity ?? 0,
    description: location.state?.description ?? "",
    status: (location.state?.quantity ?? 0) > 0 ? "1" : "2",
  };
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onStatusChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      status: v,
      // Snap quantity to a sensible default when toggling status
      quantity: v === "1" ? Math.max(Number(f.quantity) || 0, 1) : 0,
    }));
  };

  const onQuantityChange = (e) => {
    if (form.status !== "1") return; // locked when sold
    setForm((f) => ({ ...f, quantity: e.target.value }));
  };

  const canSubmit =
    form.title.toString().trim() &&
    form.author.toString().trim() &&
    form.price !== "" && Number(form.price) > 0 &&
    form.sale_price !== "" && Number(form.sale_price) > 0 &&
    form.description.toString().trim() &&
    !submitting;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await BookService.editBook(form, id);
      toast.success("Book updated");
      navigate("/books");
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not update book.";
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
            <h2 className="page-title">Edit book</h2>
            <p className="page-subtitle">Update title, pricing, and availability.</p>
          </div>
        </div>

        <form className="form-card" onSubmit={submit} autoComplete="off" noValidate>
          <div className="form-grid">
            <div className="field field--full">
              <label htmlFor="title" className="field__label">Title</label>
              <input id="title" type="text" className="field__input" value={form.title} onChange={set("title")} />
            </div>

            <div className="field field--full">
              <label htmlFor="author" className="field__label">Author</label>
              <input id="author" type="text" className="field__input" value={form.author} onChange={set("author")} />
            </div>

            <div className="field field--full" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field" style={{ gap: 4 }}>
                <label htmlFor="price" className="field__label">Price</label>
                <input id="price" type="number" min={1} className="field__input" value={form.price} onChange={set("price")} />
              </div>
              <div className="field" style={{ gap: 4 }}>
                <label htmlFor="sale_price" className="field__label">Sale price</label>
                <input id="sale_price" type="number" min={1} className="field__input" value={form.sale_price} onChange={set("sale_price")} />
              </div>
              <div className="field" style={{ gap: 4 }}>
                <label htmlFor="quantity" className="field__label">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min={0}
                  className="field__input"
                  value={form.quantity}
                  onChange={onQuantityChange}
                  disabled={form.status !== "1"}
                />
              </div>
            </div>

            <div className="field field--full">
              <label htmlFor="status" className="field__label">Status</label>
              <select
                id="status"
                className="field__input field__select"
                value={form.status}
                onChange={onStatusChange}
              >
                <option value="1">Available</option>
                <option value="2">Sold</option>
              </select>
            </div>

            <div className="field field--full">
              <label htmlFor="description" className="field__label">Description</label>
              <textarea
                id="description"
                className="field__input field__textarea"
                value={form.description}
                onChange={set("description")}
                rows={2}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-link" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {submitting ? "Saving…" : "Save book"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default EditBook;
