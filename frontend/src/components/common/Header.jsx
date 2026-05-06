import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import '../../styles/style.scss';
import CartService from '../../services/cart.service';
import { logout as authLogout } from '../../utils/auth';

import { Dropdown } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { metadata } from '../../metadata/metadata';

/**
 * Function that returns the navbar component
 * @returns {React.Component} Header component
 */
const Header = forwardRef((props,ref) => {

  const [cartCount, setCartCount] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    (async ()=>{
      const result =  await CartService.getCartCount();
      setCartCount(result);
    })();
  }, [cartCount]);

  // Expose changeCartCount to the parent component
  useImperativeHandle(ref, () => ({
    changeCartCount
  }));
  

  /**
   * Function to logout the user from current session
   */
  const logout = () => authLogout();

  /**
   * Function to change the count of cart
   */
  const changeCartCount = async ()=>{
    const result = await CartService.getCartCount();
    setCartCount(result);
  }

  
  /**
   * Function to navigate to carts section
   */
  const cart = ()=>{
    navigate('/books/cart');
  }

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
        
        <button id='cartIcon' onClick={cart} aria-label="Cart">
          <i className="fa-solid fa-cart-shopping cart-icon"></i>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
        
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
            <Dropdown.Item href="/books" className='dropdownItem'><i className="fa-solid fa-book"></i>&nbsp;&nbsp;Books</Dropdown.Item>
            <Dropdown.Item href="/books/cart" className='dropdownItem'><i className="fa-solid fa-cart-shopping"></i>&nbsp;&nbsp;Cart</Dropdown.Item>
            <Dropdown.Item className='dropdownItem' onClick={logout}><i className="fa-solid fa-right-from-bracket"></i>&nbsp;&nbsp;Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        
    </nav>
  )
});

export default Header