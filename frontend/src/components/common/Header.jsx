import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import '../../styles/style.scss';
import CartService from '../../services/cart.service';
import UserService from '../../services/user.service';
import { logout as authLogout } from '../../utils/auth';

import { Dropdown } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { metadata } from '../../metadata/metadata';

/**
 * Function that returns the navbar component
 * @returns {React.Component} Header component
 */
const cartItemsUrl = `${process.env.REACT_APP_CART_MS_URL}/cart/getCartItems`;

const Header = forwardRef((props, ref) => {
  const [cartCount, setCartCount] = useState();
  const [cartItems, setCartItems] = useState();
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  // Global search popover state.
  // results: null = idle (no query yet), [] = no matches, [...] = results.
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchWrapRef = useRef(null);
  const searchInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const result = await CartService.getCartCount();
        setCartCount(result);
      } catch (e) { /* not signed in / no cart */ }
    })();

    // Any page that mutates the cart dispatches `cart:changed` on `window`
    // (see CartService.addToCart). Refresh the badge so the count stays
    // current without each caller having to wire a ref into the Header.
    const onCartChanged = () => { changeCartCount(); };
    window.addEventListener('cart:changed', onCartChanged);
    return () => window.removeEventListener('cart:changed', onCartChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose hooks to parents (Cart) so they can ping us after add/remove.
  useImperativeHandle(ref, () => ({
    changeCartCount,
  }));

  // Close the search popover on outside click + Escape.
  useEffect(() => {
    if (!searchOpen) return undefined;
    const onMouseDown = (e) => {
      if (!searchWrapRef.current?.contains(e.target)) closeSearch();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') closeSearch();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  // Autofocus the input when the popover opens.
  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  // Debounced live search — fire 250ms after the user stops typing. Clearing
  // the query resets to idle (no spinner, no "no results"). Cancels via the
  // effect cleanup if the query changes mid-flight.
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) { setSearchResults(null); setSearching(false); return undefined; }
    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await UserService.searchUsers(q);
        if (!cancelled) setSearchResults(res?.data?.users || []);
      } catch (e) {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [searchQuery]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
    setSearching(false);
  };

  const openProfile = (user) => {
    navigate(`/profile/${user.username}`, { state: { id: user._id } });
    closeSearch();
  };

  const logout = () => authLogout();

  const changeCartCount = async () => {
    try {
      const result = await CartService.getCartCount();
      setCartCount(result);
    } catch (e) { /* ignore */ }
  };

  // Fetch the items lazily — only when the popover is opened.
  const loadCartPreview = async () => {
    setCartLoading(true);
    try {
      const res = await CartService.getCartItems(cartItemsUrl);
      setCartItems(res?.data?.items || []);
      setCartTotal(res?.data?.totalPrice || 0);
    } catch (e) {
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setCartLoading(false);
    }
  };

  const onCartToggle = (next) => {
    if (next) loadCartPreview();
  };

  /**
   * Function to navigate to a route which shows details of user with given ID
   * @param {Object} user 
   */
  const getDetails = (id)=>{
    navigate(`/profile/${JSON.parse(Cookies.get('userToken')).username}`,{
      state: {id}
    });
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
        <div className="container-fluid">
          <Link className='navbar-brand' to='/home'>{metadata.appName}</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link mx-2" to="/home">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-2" to="/books">Books</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-2" to="/requests">Requests</Link>
              </li>
              {
                Cookies.get('userToken') &&
                ['Admin', 'Super Admin'].includes(JSON.parse(Cookies.get('userToken')).role) && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link mx-2" to="/users">Users</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link mx-2" to="/orders">Orders</Link>
                    </li>
                  </>
                )
              }
            </ul>
          </div>
        </div>

        <div className="header-search" ref={searchWrapRef}>
          <button
            type="button"
            className="header-search__toggle"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Search users"
            aria-expanded={searchOpen}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>

          {searchOpen && (
            <div className="header-search__popover" role="dialog" aria-label="Search users">
              <div className="header-search__input-wrap">
                <i className="fa-solid fa-magnifying-glass header-search__input-icon"></i>
                <input
                  ref={searchInputRef}
                  className="header-search__input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name, username, or email…"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="header-search__clear"
                    onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                    aria-label="Clear search"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>

              <div className="header-search__results">
                {!searchQuery.trim() ? (
                  <div className="header-search__hint">Start typing to find a user.</div>
                ) : searching && searchResults === null ? (
                  <div className="header-search__hint">Searching…</div>
                ) : searchResults && searchResults.length === 0 ? (
                  <div className="header-search__hint">No users match "{searchQuery.trim()}".</div>
                ) : (
                  <ul className="header-search__list">
                    {searchResults?.map((u) => {
                      const initial = (u.name || u.username || '?').trim().charAt(0).toUpperCase();
                      return (
                        <li key={u._id}>
                          <button
                            type="button"
                            className="header-search__result"
                            onClick={() => openProfile(u)}
                          >
                            <span className="header-search__avatar" aria-hidden="true">{initial}</span>
                            <span className="header-search__meta">
                              <span className="header-search__name">{u.name || u.username}</span>
                              <span className="header-search__sub">@{u.username}</span>
                            </span>
                            {u.role && u.role !== 'User' && (
                              <span className="header-search__role">{u.role}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <Dropdown align="end" onToggle={onCartToggle}>
          <Dropdown.Toggle id="cartIcon" aria-label="Cart" as="button">
            <i className="fa-solid fa-cart-shopping cart-icon"></i>
            {cartCount > 0 && <span key={cartCount} className="cart-count">{cartCount}</span>}
          </Dropdown.Toggle>

          <Dropdown.Menu className="dropdownMenu cart-popover">
            <div className="cart-popover__header">
              <span>Cart</span>
              <span className="cart-popover__count">
                {cartCount > 0 ? `${cartCount} ${cartCount === 1 ? "item" : "items"}` : "Empty"}
              </span>
            </div>

            {cartLoading ? (
              <div className="cart-popover__empty">Loading…</div>
            ) : !cartItems || cartItems.length === 0 ? (
              <div className="cart-popover__empty">
                <div style={{ fontWeight: 500, color: "#20242f", marginBottom: 4 }}>Your cart is empty</div>
                <div style={{ fontSize: 12 }}>Add a book to get started.</div>
              </div>
            ) : (
              <>
                <div className="cart-popover__list">
                  {cartItems.slice(0, 5).map((it) => (
                    <div key={it._id || it.bookId || it.title} className="cart-popover__item">
                      <div className="cart-popover__item-title">{it.title}</div>
                      <div className="cart-popover__item-meta">
                        Qty {it.quantity} · Rs. {it.sale_price}
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 5 && (
                    <div className="cart-popover__more">+ {cartItems.length - 5} more</div>
                  )}
                </div>

                <div className="cart-popover__total">
                  <span>Subtotal</span>
                  <strong>Rs. {cartTotal}</strong>
                </div>
              </>
            )}

            <div className="cart-popover__actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate("/books/cart")}
                style={{ width: "100%" }}
              >
                {cartItems && cartItems.length > 0 ? "View cart & checkout" : "Browse books"}
              </button>
            </div>
          </Dropdown.Menu>
        </Dropdown>
        
        <Dropdown>
          <Dropdown.Toggle className='navDropdown'>
            <i className="fa-solid fa-user"></i>
          </Dropdown.Toggle>

          <Dropdown.Menu className='dropdownMenu'>
            {
              Cookies.get('userToken')?
              <p>Hello {JSON.parse(Cookies.get('userToken')).username}</p>
              : null
            }
            <Dropdown.Item className='dropdownItem' onClick={()=>{getDetails(JSON.parse(Cookies.get('userToken'))._id)}}><i className="fa-solid fa-user"></i>&nbsp;&nbsp;Profile</Dropdown.Item>
            <Dropdown.Item
              className='dropdownItem'
              onClick={() => {
                const u = JSON.parse(Cookies.get('userToken'));
                navigate(`/users/donations/${u.username}`, { state: { userId: u._id } });
              }}
            ><i className="fa-solid fa-hand-holding-heart"></i>&nbsp;&nbsp;My donations</Dropdown.Item>
            <Dropdown.Item
              className='dropdownItem'
              onClick={() => {
                const u = JSON.parse(Cookies.get('userToken'));
                navigate(`/users/orders/${u.username}`, { state: { userId: u._id } });
              }}
            ><i className="fa-solid fa-receipt"></i>&nbsp;&nbsp;Order history</Dropdown.Item>
            <Dropdown.Item href="/books" className='dropdownItem'><i className="fa-solid fa-book"></i>&nbsp;&nbsp;Books</Dropdown.Item>
            <Dropdown.Item href="/books/cart" className='dropdownItem'><i className="fa-solid fa-cart-shopping"></i>&nbsp;&nbsp;Cart</Dropdown.Item>
            <Dropdown.Item className='dropdownItem' onClick={logout}><i className="fa-solid fa-right-from-bracket"></i>&nbsp;&nbsp;Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        
    </nav>
  )
});

export default Header