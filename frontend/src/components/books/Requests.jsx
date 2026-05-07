import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/style.scss";
import Header from "../common/Header";
import BookLoader from "../common/BookLoader";
import BookService from "../../services/book.service";

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return "—"; }
};

const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState();
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await BookService.getRequests("pending");
        setRequests(res.data.requests || []);
      } catch (err) {
        console.error(err);
        setRequests([]);
      }
    })();
  }, []);

  const fulfill = (req) => {
    navigate("/addBook", {
      state: {
        prefill: {
          title: req.bookName,
          author: req.author || "",
        },
        requestId: req._id,
      },
    });
  };

  const filtered = (requests || []).filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.bookName || "").toLowerCase().includes(q) ||
      (r.author || "").toLowerCase().includes(q) ||
      (r.userName || "").toLowerCase().includes(q)
    );
  });

  const isLoading = requests === undefined;

  return (
    <>
      <Header />
      <div className="container bookList">
        <div className="page-header">
          <div className="page-header__text">
            <h2 className="page-title">Book requests</h2>
            <p className="page-subtitle">
              Books members are looking for. Anyone can fulfill a request by donating the title.
            </p>
          </div>
        </div>

        <div className="components">
          <input
            className="searchBar"
            placeholder="Search by title, author, or requester…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="booksTable">
          <table>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Requested by</th>
                <th scope="col">Date</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ padding: 0 }}>
                    <BookLoader label="Loading requests…" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: "48px 16px" }}>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4, color: "#20242f" }}>
                      {search ? "No matching requests" : "No pending requests"}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7384" }}>
                      {search
                        ? "Try a different search term."
                        : "When members request a book, it will appear here for the community to fulfill."}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id}>
                    <td>{r.bookName}</td>
                    <td>{r.author || "—"}</td>
                    <td>{r.userName || "—"}</td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: "0 12px", height: 30, fontSize: 13 }}
                        onClick={() => fulfill(r)}
                      >
                        Fulfill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Requests;
