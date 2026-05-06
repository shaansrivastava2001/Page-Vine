import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../styles/style.scss";

import CartService from "../../services/cart.service";

import Header from "../common/Header";
import CartItem from "./CartItem";

import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const Cart = () => {
  const [items, setItems] = useState();
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const childRef = useRef(null);
  const navigate = useNavigate();

  const url = `${process.env.REACT_APP_CART_MS_URL}/cart/getCartItems`;

  useEffect(() => {
    (async () => {
      const response = await CartService.getCartItems(url);
      setItems(response.data.items);
      setTotalPrice(response.data.totalPrice);
    })();
  }, []);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCallChildFunction = () => {
    if (childRef.current) childRef.current.changeCartCount();
  };

  const clearCart = () => CartService.clearCart();

  const checkout = async () => {
    setLoading(true);
    await CartService.checkout(totalPrice);
    setLoading(false);
    await CartService.addOrder(totalPrice);
    CartService.clearCart();
  };

  const handleUpdateQuantity = (price) => setTotalPrice(totalPrice + price);

  const isEmpty = !items || items.length === 0;

  return (
    <>
      <Header ref={childRef} />
      <div className="container bookList">
        <div className="page-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div className="page-header__text">
              <h2 className="page-title">Your cart</h2>
              <p className="page-subtitle">{isEmpty ? "Add a book to start your order." : `${items.length} ${items.length === 1 ? "item" : "items"} ready to checkout.`}</p>
            </div>
          </div>
          {!isEmpty && (
            <div className="cart-total-chip">
              <span className="cart-total-chip__label">Total</span>
              <span className="cart-total-chip__value">Rs. {totalPrice}</span>
            </div>
          )}
        </div>

        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <h3 className="empty-state__title">Your cart is empty</h3>
            <p className="empty-state__subtitle">
              Browse the library and add a book to your cart to get started.
            </p>
            <div className="empty-state__actions">
              <Link to="/books">
                <button className="btn-primary">Browse books</button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {loading ? null : (
              <table>
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Author</th>
                    <th scope="col">Price</th>
                    <th scope="col">Sale Price</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <CartItem
                      item={item}
                      key={item.title}
                      onUpdateQuantity={handleUpdateQuantity}
                      handleCallChildFunction={handleCallChildFunction}
                    />
                  ))}
                </tbody>
              </table>
            )}

            <div className="cartBottom">
              {loading ? (
                <button className="btn btn-loader" disabled>
                  <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                  &nbsp;Placing order
                </button>
              ) : (
                <>
                  <button className="btn-link" onClick={clearCart}>Clear cart</button>
                  <button className="btn-primary" onClick={handleShow}>
                    <i className="fa-regular fa-credit-card" style={{ marginRight: 6 }}></i>
                    Proceed to checkout
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {loading ? (
        <Modal show={show} onHide={handleClose} className="checkoutConfirmBox">
          <Modal.Header closeButton className="closeButton">
            <Modal.Title>Hold on</Modal.Title>
          </Modal.Header>
          <Modal.Body>Placing your order</Modal.Body>
          <Modal.Footer className="modalFooter">
            <button className="btn btn-loader" disabled>
              <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
              &nbsp;Placing order
            </button>
          </Modal.Footer>
        </Modal>
      ) : (
        <Modal show={show} onHide={handleClose} className="checkoutConfirmBox">
          <Modal.Header closeButton className="closeButton">
            <Modal.Title>Place order</Modal.Title>
          </Modal.Header>
          <Modal.Body>Confirm your order of <strong>Rs. {totalPrice}</strong></Modal.Body>
          <Modal.Footer className="modalFooter">
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={checkout} className="checkout">Checkout</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default Cart;
