import { useState, useEffect, React } from "react";
import { Link } from "react-router-dom";

import Header from "../common/Header";

import "../../styles/style.scss";
import UserService from "../../services/user.service";

import User from "./User";

/**
 *
 * @returns {React.Component} Users list component
 */
const Users = () => {
  // State variable for users list
  const [users, setUsers] = useState();

  const [usersLength, setUsersLength] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers(page, rowsPerPage, search);
  }, [page, rowsPerPage, search]);
  
  const pageNumbers = [];

  const getUsers = async (page, rowsPerPage, search) => {
    const response = await UserService.getUsers(page, rowsPerPage, search);
    setUsers(response.data.users);
    setUsersLength(response.data.usersCount);
  };

  // Set page numbers for number of buttons
  for (let i = 1; i <= Math.ceil(usersLength / rowsPerPage); i++) {
    pageNumbers.push(i);
  }

  /**
   * When previous button is clicked
   */
  const handlePrevious = () => {
    if (page !== 1) setPage(page - 1);
  };

  /**
   * When next button is clicked
   */
  const handleNext = () => {
    if (page !== Math.ceil(usersLength / rowsPerPage)) setPage(page + 1);
  };

  /**
   * Function to manage search box
   * @param {Event} e
   */
  const searchBook = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  /**
   * Sends API call at backend for number of rows per page
   * @param {Number} e
   */
  const handlePageSize = (e) => {
    setRowsPerPage(e.target.value);
    setPage(1);
  };

  /**
   * Sends API call at backend for page number of data
   * @param {Number} number
   */
  const paginate = (number) => {
    setPage(number);
  };

  return (
    <>
      <Header></Header>
      <div className="container bookList">
        <div className="page-header" style={{ justifyContent: "space-between" }}>
          <div className="page-header__text">
            <h2 className="page-title">Users</h2>
            <p className="page-subtitle">Manage accounts and assign roles.</p>
          </div>
          <Link to="/users/new">
            <button className="btn-primary" type="button">
              <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i>
              Create user
            </button>
          </Link>
        </div>
        <div className="components">
          <input
            className="searchBar"
            placeholder="Search user..."
            onChange={searchBook}
          />
        </div>
        <div className="booksTable">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Username</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Donations</th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map((user) => {
                  return <User user={user} key={user._id} />;
                })}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <div className="left-pagination">
            <span htmlFor="rowsPerPage">Rows per page:</span>
            <select
              className="form-select"
              onChange={(e) => handlePageSize(e)}
              id="rowsPerPage"
              style={{ display: "inline" }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
          <div className="right-pagination">
            <button
              className="btn btnPaginationControls previous"
              onClick={() => handlePrevious()}
            >
              {" "}
              Previous{" "}
            </button>
            <ul className="">
              {pageNumbers.map((number) => {
                let btnClass = " btn btnPaginationInactive mx-1";
                if (number === page) btnClass = "btn btnPaginationActive mx-1";
                return (
                  <button
                    className={btnClass}
                    onClick={() => paginate(number)}
                    key={number}
                  >
                    {number}
                  </button>
                );
              })}
            </ul>
            <button
              className="btn btnPaginationControls float-right"
              onClick={() => handleNext()}
            >
              {" "}
              Next{" "}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;
