import React, { useEffect, useState } from 'react';

import UserService from '../../../services/user.service';

import Header from '../../common/Header';
import BookLoader from '../../common/BookLoader';
import Order from './Order';

const Orders_Dashboard = () => {
    const [orders, setOrders] = useState();

    const [ordersLength, setOrdersLength] = useState();
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const pageNumbers = [];

    useEffect(() => {
        (async ()=>{
            const filters = {page, rowsPerPage, search};
            const response = await getOrders(filters);
            setOrders(response.data.orders);
            setOrdersLength(response.data.ordersCount);
          })();
    }, [page, rowsPerPage, search]);

    const getOrders = async (filters) => {
      const response = await UserService.fetchAllOrders(filters);
      console.log(response.data.ordersCount);
      return response;
    };
    
    // Set page numbers for number of buttons
  for (let i = 1; i <= Math.ceil(ordersLength / rowsPerPage); i++) {
    pageNumbers.push(i);
  }

  /**
   * When previous button is clicked
   */
  const handlePrevious = () => {
    if (page !== 1) {
      setPage(page - 1);
    }
  };

  /**
   * When next button is clicked
   */
  const handleNext = () => {
    if (page !== Math.ceil(ordersLength / rowsPerPage)){
      setPage(page + 1);
    }
  };

  /**
   * Function to manage search box
   * @param {Event} e
   */
  const searchOrder = (e) => {
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
        <div className="page-header">
          <div className="page-header__text">
            <h2 className="page-title">Customer orders</h2>
            <p className="page-subtitle">All orders placed across the library.</p>
          </div>
        </div>
        <div className="components">
          <input
            className="searchBar"
            placeholder="Search order..."
            onChange={searchOrder}
          />
        </div>
        <div className="booksTable">
          <table>
            <thead>
              <tr>
                <th scope="col">Customer Name</th>
                <th scope="col">Customer Email</th>
                <th scope="col">Order Date</th>
                <th scope="col">Price</th>
                <th scope="col">Order Status</th>
              </tr>
            </thead>
            <tbody>
            {
              orders === undefined ? (
                <tr>
                  <td colSpan="5" style={{ padding: 0 }}>
                    <BookLoader label="Loading orders…" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: "48px 16px", color: "#6b7384" }}>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4, color: "#20242f" }}>No orders yet</div>
                    <div style={{ fontSize: 13 }}>Customer orders will appear here once placed.</div>
                  </td>
                </tr>
              ) : (
                orders.map((item) => <Order order={item} key={item._id}/>)
              )
            }
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
  )
}

export default Orders_Dashboard;