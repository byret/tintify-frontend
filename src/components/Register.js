import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './common/Navbar';
import eyeOpenIcon from '../assets/eye_open.png';
import eyeClosedIcon from '../assets/eye_closed.png';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/users/register`, {
        username,
        password,
      }, { withCredentials: true });

      if (response.status === 200) {
        setMessage('Registration successful! You can now login.');
        setIsSuccess(true);
      } else {
        setMessage('Registration failed. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage('Username already exists');
      } else {
        setMessage('An error occurred during registration. Please try again.');
      }
      setIsSuccess(false);
    }
  };

  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleOnMouseEnterButton= (e) => {
    if (!passwordsMatch) {
      e.preventDefault();
      validateForm();
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  };

    const validateForm = () => {
      if (!username) {
        setTooltipText('Username is required!');
        return false;
      }
      if (!password) {
        setTooltipText('Password is required!');
        return false;
      }
      if (password !== confirmPassword) {
        setTooltipText('Passwords must match!');
        return false;
      }
      return true;
    };

  const handleOnMouseLeaveButton= (e) => {
    setShowTooltip(false);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-pixelBg">
      <Navbar />
      <div className="bg-areasBg shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-secondary mb-6 text-center">Register</h1>

        {message && (
          <p
            className="text-center mb-4"
            style={{
              color: isSuccess ? '#9BCF8C' : '#913737',
            }}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>


         <div className="mb-4 relative">
           <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
           <div className="relative flex items-center">
             <input
               type={passwordVisible ? 'text' : 'password'}
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
               required
             />
             <span
               className="absolute right-3 flex items-center h-full cursor-pointer"
               onClick={togglePasswordVisibility}
             >
               <img
                 src={passwordVisible ? eyeClosedIcon : eyeOpenIcon}
                 alt="Toggle password visibility"
                 className="w-6 h-6 object-contain"
               />
             </span>
           </div>
         </div>

         <div className="mb-6 relative">
           <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
           <div className="relative flex items-center">
             <input
               type={confirmPasswordVisible ? 'text' : 'password'}
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
               required
             />
             <span
               className="absolute right-3 flex items-center h-full cursor-pointer"
               onClick={toggleConfirmPasswordVisibility}
             >
               <img
                 src={confirmPasswordVisible ? eyeClosedIcon : eyeOpenIcon}
                 alt="Toggle password visibility"
                 className="w-6 h-6 object-contain"
               />
             </span>
           </div>
         </div>

          <div className="relative">
           <div onMouseEnter={handleOnMouseEnterButton} onMouseLeave={handleOnMouseLeaveButton}>
                <button
                  type="submit"
                  className={`w-full text-secondary py-2 px-4 rounded transition-all
                    ${passwordsMatch ? 'bg-primary hover:bg-secondary hover:text-primary' : 'bg-blocked cursor-not-allowed'}`}
                  disabled={!passwordsMatch}
                >
                  Register
                </button>
            </div>

            {showTooltip && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-center p-2 rounded shadow-lg mt-1">
                {tooltipText}
              </div>
            )}
          </div>
        </form>

        <p className="mt-4 text-center text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-activeBg hover:text-primary transition-all">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
