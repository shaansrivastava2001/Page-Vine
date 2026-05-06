import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

import "../../styles/style.scss";
import UserService from "../../services/user.service";

import Donation from "./Donation";
import Header from "../common/Header";

const Donations = () => {
  const [donations, setDonations] = useState();
  const navigate = useNavigate();
  const location = useLocation();

  // Default to the current user if no userId was passed in router state.
  const me = Cookies.get("userToken") ? JSON.parse(Cookies.get("userToken")) : null;
  const targetUserId = location.state?.userId || me?._id;

  useEffect(() => {
    if (!targetUserId) return;
    (async () => {
      try {
        const response = await UserService.fetchDonations(targetUserId);
        setDonations(response.data.donations || []);
      } catch (err) {
        console.error(err);
        setDonations([]);
      }
    })();
  }, [targetUserId]);

  const isLoading = donations === undefined;
  const isMine = !location.state?.userId || location.state.userId === me?._id;

  return (
    <>
      <Header />
      <div className="container bookList">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="page-header__text">
            <h2 className="page-title">{isMine ? "My donations" : "Donations"}</h2>
            <p className="page-subtitle">
              {isMine
                ? "Books you've shared with the community."
                : "Books donated to the library."}
            </p>
          </div>
        </div>

        <div className="booksTable">
          <table>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Price</th>
                <th scope="col">Created at</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: 32, color: "#6b7384" }}>Loading donations…</td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: "48px 16px" }}>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4, color: "#20242f" }}>
                      {isMine ? "You haven't donated any books yet" : "No donations yet"}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7384" }}>
                      {isMine
                        ? "Share a book with the community to see it here."
                        : "Donations from this user will appear here."}
                    </div>
                  </td>
                </tr>
              ) : (
                donations.map((item) => <Donation donation={item} key={item._id} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Donations;
