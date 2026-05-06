import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../../styles/style.scss";
import UserService from "../../services/user.service";
import Header from "../common/Header";

import Cookies from "js-cookie";

const pluralize = (n, singular, plural) => `${n ?? 0} ${(n === 1 ? singular : (plural || singular + "s"))}`;

const InfoRow = ({ label, value, action }) => (
  <div className="info-row">
    <span className="info-row__label">{label}</span>
    <span className="info-row__value">
      {value}
      {action}
    </span>
  </div>
);

const Profile = () => {
  const [user, setUser] = useState();
  const [donations, setDonations] = useState(0);
  const [orders, setOrders] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state?.id;
  const me = JSON.parse(Cookies.get("userToken"));
  const isMe = me?._id === id;

  useEffect(() => {
    (async () => {
      const data = await UserService.getUserProfile(id);
      setUser(data.message);
      setDonations(data.donationsCount ?? 0);
      setOrders(data.ordersCount ?? 0);
    })();
  }, []);

  const editAddress = () => {
    navigate(`/editAddress/${me._id}`, {
      state: {
        house: user.address?.house || "",
        city: user.address?.city || "",
        locality: user.address?.locality || "",
        state: user.address?.state || "",
        pin: user.address?.pin || "",
      },
    });
  };

  const goToDonations = () => navigate(`/users/donations/${user.username}`, { state: { userId: me._id } });
  const goToOrders = () => navigate(`/users/orders/${user.username}`, { state: { userId: me._id } });

  const address = user?.address
    ? `${user.address.house}, ${user.address.locality}, ${user.address.city}, ${user.address.state} (${user.address.pin})`
    : null;

  return (
    <>
      <Header />
      <div className="page-narrow profile-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="page-header__text">
            <h2 className="page-title">{isMe ? "Your profile" : `${user?.name || "User"}'s profile`}</h2>
            <p className="page-subtitle">Account details and activity.</p>
          </div>
        </div>

        <section className="form-card profile-card">
          <h3 className="section-title">Details</h3>
          <div className="profile-info">
            <InfoRow label="Name" value={user?.name || "—"} />
            <InfoRow label="Username" value={user?.username || "—"} />
            <InfoRow label="Email" value={user?.email || "—"} />
            <InfoRow
              label="Address"
              value={
                address
                  ? <span>{address}</span>
                  : <span className="info-row__missing">No address provided</span>
              }
              action={
                isMe ? (
                  <button type="button" className="info-row__action" onClick={editAddress} aria-label="Edit address">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                ) : null
              }
            />
          </div>
        </section>

        <h3 className="section-title">Activity</h3>
        <div className="profile-stats">
          <article className="profile-stat">
            <div className="profile-stat__top">
              <span className="profile-stat__label">Donations</span>
              <span className="profile-stat__value">{pluralize(donations, "donation", "donations")}</span>
            </div>
            <p className="profile-stat__hint">
              {isMe
                ? "Your act of kindness and thoughtfulness is truly inspiring."
                : "Their contribution helps us expand the library."}
            </p>
            {isMe && donations > 0 && (
              <button type="button" className="btn-link profile-stat__action" onClick={goToDonations}>
                View donations <i className="fa-solid fa-arrow-right" style={{ fontSize: 11, marginLeft: 4 }}></i>
              </button>
            )}
          </article>

          <article className="profile-stat">
            <div className="profile-stat__top">
              <span className="profile-stat__label">Orders</span>
              <span className="profile-stat__value">{pluralize(orders, "order", "orders")}</span>
            </div>
            <p className="profile-stat__hint">
              {isMe
                ? "We're delighted you chose us to fulfill your needs."
                : "Books they've taken home from the library."}
            </p>
            {isMe && orders > 0 && (
              <button type="button" className="btn-link profile-stat__action" onClick={goToOrders}>
                View orders <i className="fa-solid fa-arrow-right" style={{ fontSize: 11, marginLeft: 4 }}></i>
              </button>
            )}
          </article>
        </div>
      </div>
    </>
  );
};

export default Profile;
