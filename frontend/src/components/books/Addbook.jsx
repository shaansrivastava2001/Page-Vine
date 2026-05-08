import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import '../../styles/style.scss';
import { toast } from 'react-toastify';

import BookService from '../../services/book.service';
import Header from '../common/Header';

const AddBook = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // When this page is opened from /requests with a "Fulfill" click, the request
  // id and the prefill values come through location.state. We lock the title +
  // author fields so the donation matches the request, and mark it fulfilled
  // after the book is created.
  const prefill = location.state?.prefill;
  const requestId = location.state?.requestId;

  const [form, setForm] = useState({
    title: prefill?.title || '',
    author: prefill?.author || '',
    price: '',
    sale_price: '',
    quantity: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit =
    form.title.trim() &&
    form.author.trim() &&
    form.price !== '' && Number(form.price) > 0 &&
    form.sale_price !== '' && Number(form.sale_price) > 0 &&
    form.quantity !== '' && Number(form.quantity) > 0 &&
    !submitting;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await BookService.addBook(form);
      if (!res) {
        toast.error('Could not add book. Please try again.');
        return;
      }
      // If we came from a "Fulfill" click on the requests page, mark the
      // originating request as fulfilled. A failure here is non-fatal — the
      // book has already been added.
      if (requestId) {
        try {
          await BookService.fulfillRequest(requestId);
          toast.success('Request fulfilled. Thank you for donating!');
        } catch (err) {
          console.warn('fulfillRequest failed', err);
        }
      }
      navigate(requestId ? '/requests' : '/books');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not add book.';
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
            <h2 className="page-title">{requestId ? 'Fulfill request' : 'Donate a book'}</h2>
            <p className="page-subtitle">
              {requestId
                ? `You're donating "${prefill?.title}" — fill in price and quantity to complete.`
                : 'Add a book to share with the community.'}
            </p>
          </div>
        </div>

        <form className="form-card" onSubmit={submit} autoComplete="off" noValidate>
          <div className="form-grid">
            <div className="field field--full">
              <label htmlFor="title" className="field__label">Title</label>
              <input
                id="title"
                type="text"
                className="field__input"
                value={form.title}
                onChange={set('title')}
                placeholder="The book's title"
                readOnly={!!requestId}
              />
            </div>

            <div className="field field--full">
              <label htmlFor="author" className="field__label">Author</label>
              <input
                id="author"
                type="text"
                className="field__input"
                value={form.author}
                onChange={set('author')}
                placeholder="Author name"
                readOnly={!!requestId}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="price" className="field__label">Price</label>
                <input id="price" type="number" min={1} className="field__input" value={form.price} onChange={set('price')} placeholder="Original" />
              </div>
              <div className="field">
                <label htmlFor="sale_price" className="field__label">Sale price</label>
                <input id="sale_price" type="number" min={1} className="field__input" value={form.sale_price} onChange={set('sale_price')} placeholder="Asking" />
              </div>
              <div className="field">
                <label htmlFor="quantity" className="field__label">Quantity</label>
                <input id="quantity" type="number" min={1} className="field__input" value={form.quantity} onChange={set('quantity')} placeholder="Copies" />
              </div>
            </div>

            <div className="field field--full">
              <label htmlFor="description" className="field__label">
                Description <span className="field__optional">(optional)</span>
              </label>
              <textarea
                id="description"
                className="field__input field__textarea"
                value={form.description}
                onChange={set('description')}
                placeholder="A short description, condition, edition…"
                rows={2}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-link" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {submitting ? 'Adding…' : 'Donate book'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddBook;
