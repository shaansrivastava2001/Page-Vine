import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/style.scss";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

import BookService from "../../services/book.service";
import Header from "../common/Header";

const RequestBook = () => {
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const canSubmit = bookName.trim() && author.trim() && !submitting;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await BookService.sendRequest(bookName, author);
      if (res) {
        navigate("/books");
      } else {
        toast.error("Could not send request. Please try again.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not send request.";
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
            <h2 className="page-title">Request a book</h2>
            <p className="page-subtitle">Tell the community about a book you'd like to read.</p>
          </div>
        </div>

        <form className="form-card" onSubmit={submit} autoComplete="off" noValidate>
          <div className="form-grid">
            <div className="field field--full">
              <label htmlFor="bookName" className="field__label">Book name</label>
              <input
                id="bookName"
                type="text"
                className="field__input"
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                placeholder="The book's title"
              />
            </div>

            <div className="field field--full">
              <label htmlFor="author" className="field__label">Author</label>
              <input
                id="author"
                type="text"
                className="field__input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-link" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {submitting ? "Sending…" : "Send request"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default RequestBook;
