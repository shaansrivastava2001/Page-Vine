import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CartService from "../../services/cart.service";
import BookCover from "../common/BookCover";

import "../../styles/style.scss";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Cookies from "js-cookie";

/**
 *
 * @param {Object} props
 * @returns Single Cart Item
 */
const CartItem = (props) => {

  // State variable for handling quantity of item
  const [quantity, setQuantity] = useState(props.item.quantity);

  // Disabling the increment and decrement buttons on boundary cases
  const [incrementDisabled, setIncrementDisabled] = useState(false);
  const [decrementDisabled, setDecrementDisabled] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Disable the decrement button for quantity if the quantity is already zero
    quantity===1?setDecrementDisabled(true):setDecrementDisabled(false);

    if(props.item.status==="Sold out"){
      setDecrementDisabled(true);
      setIncrementDisabled(true);
    }
    

    // Disable the increment button for quantity if the quantity is maximum
    const checkMaximum = async()=>{
      const data = await CartService.getQuantities(props.item._id,props.item.bookId);
        if(data.data.cartQuantity === data.data.bookQuantity){
          setIncrementDisabled(true);
        }
    }

    checkMaximum();
  }, []);

  const userId = JSON.parse(Cookies.get('userToken'))._id;

  /**
   * Function to remove an item from the cart
   */
  const removeItem = () => {
    CartService.removeItem(props.item._id, userId);
    props.handleCallChildFunction();
  };

  /**
   * Function to check if the quantity of the item in cart is maximum or not
   * And Disable the increment button if it is so
   */
  const maxQuantity = async () => {
    try {
      const data = await CartService.getQuantities(props.item._id,props.item.bookId);
      if(data.data.cartQuantity+1 === data.data.bookQuantity){
        setIncrementDisabled(true);
        return false;
      }
      return true;
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Increments the quantity of item in the cart
   */
  const increment = async () => {
    // If the quantity of item is 0 then if the user clicks plus button, then minus button should be enabled
    setDecrementDisabled(false);
    if (maxQuantity()) {
      let result = await CartService.increment(props.item._id);
      setQuantity(result.data.quantity);
      props.onUpdateQuantity(result.data.sale_price);
    }
  };

  /**
   * Decrements the quantity of item in the cart
   */
  const decrement = async () => {
    // If the quantity of item is max then if the user clicks minus button, then plus button should be enabled
    setIncrementDisabled(false);

    let result = await CartService.decrement(props.item._id);
    if(result.data.quantity<=1){
      setDecrementDisabled(true);
      setQuantity(result.data.quantity);
      props.onUpdateQuantity(-result.data.sale_price);
    } else {
      setQuantity(result.data.quantity);
      props.onUpdateQuantity(-result.data.sale_price);
      setDecrementDisabled(false);
    }
  };

  /**
   * Tooltip for quantity of book
   * @param {Object} props
   * @returns jsx element for the tooltip of quantity
   */
  const deleteTooltip = (p) => (
    <Tooltip id="button-tooltip" {...p}>
      Remove Book
    </Tooltip>
  );

  const getBookDetails = ()=>{
    navigate(`/book/${props.item.title}`,{
      state: {
        bookId: props.item.bookId
      }
    });
  };

  return (
    <>
      <tr>
        <td onClick={() => {getBookDetails()}}>
          <div className="title-cell">
            <BookCover title={props.item.title} author={props.item.author} size="xs" />
            <span className="title-cell__text">{props.item.title}</span>
          </div>
        </td>
        <td onClick={() => {getBookDetails()}}>{props.item.author}</td>
        <td onClick={() => {getBookDetails()}}>Rs. {props.item.price}</td>
        <td onClick={() => {getBookDetails()}}>Rs. {props.item.sale_price}</td>
        <td>
          <button
            onClick={decrement}
            disabled={decrementDisabled}
            className="btnQuantityControl mx-3"
          >
            -
          </button>
          {quantity}
          <button
            onClick={increment}
            disabled={incrementDisabled}
            className="btnQuantityControl mx-3"
          >
            +
          </button>
        </td>
        <td onClick={() => {getBookDetails()}}>
          {
            props.item.status=="Available"?
              <span className="statusAvailable">{props.item.status}</span>
              :
              <span className="statusSold">{props.item.status}</span>
          }
        </td>
        <td>
          <OverlayTrigger
            placement="top"
            delay={{ show: 150, hide: 10 }}
            overlay={deleteTooltip}
          >
            <button
              className="btn btnAction"
              id={props.item._id}
              onClick={removeItem}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </OverlayTrigger>
        </td>
      </tr>
    </>
  );
};

export default CartItem;
