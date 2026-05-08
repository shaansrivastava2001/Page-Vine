import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/style.scss";
import Header from "./common/Header";
import BookCover from "./common/BookCover";
import { getUser } from "../utils/auth";

import BookService from "../services/book.service";
import OrderService from "../services/order.service";
import UserService from "../services/user.service";

const StatCard = ({ tone, icon, label, value, hint, loading, to }) => {
  const inner = (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__top">
        <span className="stat-card__icon"><i className={`fa-solid ${icon}`}></i></span>
        {to && <i className="fa-solid fa-arrow-right stat-card__arrow"></i>}
      </div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">
          {loading ? <span className="skeleton-bar" /> : (value ?? "—")}
        </span>
        {hint && <span className="stat-card__hint">{hint}</span>}
      </div>
    </article>
  );
  return to ? <Link to={to} className="stat-card-link">{inner}</Link> : inner;
};

const ActionTile = ({ to, icon, title, sub, primary }) => (
  <Link to={to} className={`action-tile${primary ? " action-tile--primary" : ""}`}>
    <span className="action-tile__icon"><i className={`fa-solid ${icon}`}></i></span>
    <div>
      <div className="action-tile__title">{title}</div>
      <div className="action-tile__sub">{sub}</div>
    </div>
  </Link>
);

const formatNumber = (n) => (n == null ? null : n.toLocaleString());

const Home = () => {
  const me = getUser();
  const isAdmin = ["Admin", "Super Admin"].includes(me?.role);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    availableCount: null,
    totalCount: null,
    totalQuantity: null,
    totalOrders: null,
    totalUsers: null,
    pendingRequestsCount: null,
    myDonationsCount: null,
  });
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const results = await Promise.allSettled([
        BookService.getStats(),
        OrderService.getStats(),
        UserService.getStats(),
        me?._id ? UserService.getDonations(me._id) : Promise.resolve(null),
        BookService.getBooks({ page: 1, limit: 3, search: "", category: "available" }),
      ]);
      if (!alive) return;
      const [books, orders, users, mine, recent] = results;
      const mineList = mine.status === "fulfilled" ? mine.value?.data?.donations : null;
      setStats({
        availableCount:        books.status === "fulfilled" ? books.value.data.availableCount       : null,
        totalCount:            books.status === "fulfilled" ? books.value.data.totalCount           : null,
        totalQuantity:         books.status === "fulfilled" ? books.value.data.totalQuantity        : null,
        pendingRequestsCount:  books.status === "fulfilled" ? books.value.data.pendingRequestsCount : null,
        totalOrders:           orders.status === "fulfilled" ? orders.value.data.totalOrders         : null,
        totalUsers:            users.status === "fulfilled" ? users.value.data.totalUsers           : null,
        myDonationsCount:      Array.isArray(mineList) ? mineList.length : (Number(mineList) || null),
      });
      setFeatured(recent.status === "fulfilled" ? (recent.value?.data?.books || []) : []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const openBook = (book) => {
    navigate(`/book/${book.title}`, { state: { bookId: book._id } });
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "short", day: "numeric",
  });

  const firstName = me?.name ? me.name.split(" ")[0] : me?.username;

  return (
    <>
      <Header />
      <div className="container home">
        <section className="home-hero" aria-labelledby="home-hero-title">
          <div className="home-hero__content">
            <span className="home-hero__eyebrow">{today}</span>
            <h2 id="home-hero-title" className="home-hero__title">
              Welcome back{firstName ? `, ${firstName}` : ""}.
            </h2>
            <p className="home-hero__subtitle">
              Discover a new read, share a book you've loved, or check on the community's wishlist.
            </p>
            <div className="home-hero__actions">
              <Link to="/books" className="btn-primary">
                <i className="fa-solid fa-book" style={{ marginRight: 6 }}></i>
                Browse books
              </Link>
              <Link to="/addBook" className="home-hero__ghost-btn">
                <i className="fa-solid fa-hand-holding-heart" style={{ marginRight: 6 }}></i>
                Donate a book
              </Link>
            </div>
          </div>
          <div className="home-hero__art" aria-hidden="true">
            <div className="home-hero__spine home-hero__spine--a"></div>
            <div className="home-hero__spine home-hero__spine--b"></div>
            <div className="home-hero__spine home-hero__spine--c"></div>
            <div className="home-hero__spine home-hero__spine--d"></div>
            <div className="home-hero__spine home-hero__spine--e"></div>
          </div>
        </section>

        {(featured === null || featured.length > 0) && (
          <>
            <div className="section-title-row">
              <h3 className="section-title" style={{ margin: 0 }}>Recently added</h3>
              <Link to="/books" className="section-title-row__link">
                See all <i className="fa-solid fa-arrow-right" style={{ marginLeft: 4 }}></i>
              </Link>
            </div>
            <div className="featured-strip">
              {featured === null
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div className="featured-card featured-card--skeleton" key={i}>
                      <div className="featured-card__cover-skeleton" />
                      <div className="featured-card__body">
                        <div className="featured-card__line-skeleton" />
                        <div className="featured-card__line-skeleton featured-card__line-skeleton--short" />
                      </div>
                    </div>
                  ))
                : featured.map((book) => (
                    <button
                      type="button"
                      className="featured-card"
                      key={book._id}
                      onClick={() => openBook(book)}
                    >
                      <BookCover title={book.title} author={book.author} size="sm" />
                      <div className="featured-card__body">
                        <div className="featured-card__title" title={book.title}>{book.title}</div>
                        <div className="featured-card__price">Rs. {book.sale_price ?? book.price}</div>
                      </div>
                    </button>
                  ))
              }
            </div>
          </>
        )}

        <h3 className="section-title">Your activity</h3>
        <div className="stat-grid">
          <StatCard
            tone="brand"
            icon="fa-hand-holding-heart"
            label="My donations"
            value={formatNumber(stats.myDonationsCount)}
            hint="Books you've shared with the community"
            loading={loading}
            to={me?.username ? `/users/donations/${me.username}` : null}
          />
        </div>

        <h3 className="section-title">Library</h3>
        <div className="stat-grid">
          <StatCard
            tone="brand"
            icon="fa-book-open"
            label="Books available"
            value={formatNumber(stats.availableCount)}
            hint={stats.totalCount != null ? `${formatNumber(stats.totalCount)} total titles` : null}
            loading={loading}
            to="/books"
          />
          <StatCard
            tone="info"
            icon="fa-layer-group"
            label="Total copies"
            value={formatNumber(stats.totalQuantity)}
            hint="Sum across all titles"
            loading={loading}
          />
          <StatCard
            tone="success"
            icon="fa-receipt"
            label="Orders"
            value={formatNumber(stats.totalOrders)}
            hint="All time"
            loading={loading}
            to={isAdmin ? "/orders" : null}
          />
          <StatCard
            tone="warning"
            icon="fa-users"
            label="Users"
            value={formatNumber(stats.totalUsers)}
            hint="Registered accounts"
            loading={loading}
            to={isAdmin ? "/users" : null}
          />
          <StatCard
            tone="warning"
            icon="fa-bell"
            label="Pending requests"
            value={formatNumber(stats.pendingRequestsCount)}
            hint="Books the community is looking for"
            loading={loading}
            to="/requests"
          />
        </div>

        <h3 className="section-title">Quick actions</h3>
        <div className="quick-actions">
          <ActionTile
            primary
            to="/books"
            icon="fa-book"
            title="Browse books"
            sub="Find your next read"
          />
          <ActionTile
            to="/addBook"
            icon="fa-plus"
            title="Donate a book"
            sub="Share a title with the community"
          />
          <ActionTile
            to="/books/requestBook"
            icon="fa-paper-plane"
            title="Request a book"
            sub="Ask the community for a title"
          />
        </div>
      </div>
    </>
  );
};

export default Home;
