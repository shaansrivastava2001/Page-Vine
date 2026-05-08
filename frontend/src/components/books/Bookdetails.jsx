import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import "../../styles/style.scss";
import CartService from "../../services/cart.service";
import BookService from "../../services/book.service";

import Header from "../common/Header";
import BookCover from "../common/BookCover";

import Cookies from "js-cookie";

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-row__label">{label}</span>
    <span className="info-row__value">{value ?? "—"}</span>
  </div>
);

const BookDetails = () => {
  const [book, setBook] = useState();
  const [disabled, setDisabled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.bookId;

  const me = Cookies.get("userToken") ? JSON.parse(Cookies.get("userToken")) : null;
  const isOwner = book && me && String(book.donatedById) === String(me._id);
  // Strict ownership: only the donator can edit, no admin override.
  const canEdit = isOwner;

  useEffect(() => {
    compareBook();
    (async () => {
      const data = await BookService.getBookData(id);
      setBook(data.data.book);
    })();
  }, []);

  const editBook = (b) => {
    navigate(`/books/${b._id}`, {
      state: {
        name: b.title,
        author: b.author,
        description: b.description,
        price: b.price,
        quantity: b.quantity,
        sale_price: b.sale_price,
      },
    });
  };

  const addToCart = async (b) => {
    if (await compareBook()) {
      CartService.addToCart(b);
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const compareBook = async () => {
    const result = await BookService.compareBook(me?._id, book?._id);
    setDisabled(!result);
    return result;
  };

  const isAvailable = book?.status === "available" || book?.quantity > 0;

  return (
    <>
      <Header />
      <div className="page-narrow">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="page-header__text">
            <h2 className="page-title">{book?.title || "Book details"}</h2>
            <p className="page-subtitle">
              {book?.author ? `by ${book.author}` : "Title information"}
            </p>
          </div>
        </div>

        <section className="form-card profile-card book-detail">
          <div className="book-detail__cover">
            <BookCover title={book?.title} author={book?.author} size="lg" />
          </div>
          <div className="book-detail__body">
            <h3 className="section-title">Details</h3>
            <div className="profile-info">
              <InfoRow label="Title" value={book?.title} />
              <InfoRow label="Author" value={book?.author} />
              <InfoRow
                label="Status"
                value={
                  book ? (
                    <span className={isAvailable ? "statusAvailable" : "statusSold"}>
                      {book.status || (book.quantity > 0 ? "available" : "sold")}
                    </span>
                  ) : "—"
                }
              />
              <InfoRow label="Price" value={book?.price != null ? `Rs. ${book.price}` : "—"} />
              {book?.sale_price != null && (
                <InfoRow label="Sale price" value={`Rs. ${book.sale_price}`} />
              )}
              {book?.quantity != null && (
                <InfoRow label="Quantity" value={book.quantity} />
              )}
              <InfoRow label="Description" value={book?.description} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-link" onClick={() => navigate(-1)}>
                Go back
              </button>
              {canEdit && (
                <button type="button" className="btn-link" onClick={() => editBook(book)}>
                  Edit details
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={() => addToCart(book)}
                disabled={disabled || !book}
              >
                <i className="fa-solid fa-cart-shopping" style={{ marginRight: 6 }}></i>
                Add to cart
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BookDetails;
