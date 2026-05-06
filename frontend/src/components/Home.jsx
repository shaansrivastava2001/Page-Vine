import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/style.scss";
import Header from "./common/Header";
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

  useEffect(() => {
    let alive = true;
    (async () => {
      const results = await Promise.allSettled([
        BookService.getStats(),
        OrderService.getStats(),
        UserService.getStats(),
        me?._id ? UserService.getDonations(me._id) : Promise.resolve(null),
      ]);
      if (!alive) return;
      const [books, orders, users, mine] = results;
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
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "short", day: "numeric",
  });

  const firstName = me?.name ? me.name.split(" ")[0] : me?.username;

  return (
    <>
      <Header />
      <div className="container home">
        <div className="page-header">
          <div className="page-header__text">
            <h2 className="page-title">Welcome back{firstName ? `, ${firstName}` : ""}.</h2>
            <p className="page-subtitle">{today} · A snapshot of the library at a glance.</p>
          </div>
        </div>

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
