import { useNavigate, useLocation } from "react-router-dom";
import { useState, React, useRef, useEffect } from "react";

import "./authenticationStyle.scss";

import UserService from "../../services/user.service";

import { toast } from "react-toastify";

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const navigate = useNavigate();
  
  const inputRefs = useRef([]);
  
  const location = useLocation();

  useEffect(() => {
    setBackground();
  }, []);
  

  const handleChange = (e, index) => {
    const { value } = e.target;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to the next input field
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus to the previous input field on backspace
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };


  // Sends otp to the backend for verification
  const postOtp = async ()=>{
    const code = Number(otp.join(''));
    const response = await UserService.verifyOtp(location.state.id,code);
    if(response.data.result==='Correct OTP'){
      navigate('/login');
      toast.success('Email verified. Login to continue');
    } else if(response.data.result==='Incorrect OTP'){
      toast.error('Incorrect OTP');
    } else {
      toast.error('Invalid user');
    }
  }

  // Resending the OTP
  const resend = async ()=>{
    const otpResponse = await UserService.sendOtp(location.state.id);
    if(otpResponse){
      navigate('/verifyEmail',{
        state:{
          id: location.state.id,
          email: location.state.email
        }
      });
    }

    toast.success("OTP sent to your email");
  }

  function setBackground() {
    let body = document.querySelector("body");
    body.style = `background-color: rgba(195, 207, 216, 0.873);background-size:cover;background-repeat:no-repeat;`;
  }

  return (
    <>
      <div className="otp-container">
        <h2>Verify Your Account</h2>

        {
          (location?.state?.email)?
          <>
            <p>Please enter the six digit verification OTP sent to <span className="email"> {location.state.email}</span></p>
    
            <div className="code-container">
            {otp.map((digit, index) => (
              <input key={index} type="number" value={digit} onChange={(e) => handleChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} 
                maxLength={1} className="code" ref={(ref) => (inputRefs.current[index] = ref)} />
            ))}
            </div>
            <div>
              <button className="verifyOtp my-4" disabled={false} onClick={postOtp}>
                Verify OTP
              </button>
            </div>
            <p>Didn't receive a code? <span className="resend" onClick={resend}>Resend</span></p>
          
          </>
          :
          <>
            <p>Please register first for verification. <span className="register" onClick={()=>navigate('/register')}>Register here</span></p>
          </>
        }

      </div>
    </>
  );
};

export default VerifyEmail;
