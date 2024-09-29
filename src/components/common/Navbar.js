import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Navbar = ({
  showSaveButton,
  onSaveClick,
  username,
  isAuthenticated,
  handleLogout,
  onHomePage,
  openModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  let dropdownTimer;

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimer);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimer = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const navigate = useNavigate();

  return (
    <nav className="bg-[#a38c9a] p-2 shadow-lg fixed w-full top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-16" />
          </Link>
          <Link to="/">
            <span className="text-white text-2xl font-semibold font-sans">Tintify</span>
          </Link>
        </div>

        {showSaveButton && (
          <button
            onClick={onSaveClick}
            className="bg-primary text-secondary py-2 px-4 rounded transition-transform duration-200 hover:-translate-y-1"
          >
            Save
          </button>
        )}

        {isAuthenticated && onHomePage ? (
          <>
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="text-white cursor-pointer">
                Welcome, {username}!
              </span>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-20">
                  <Link
                    to={`/users/${username}`}
                    className="block px-4 py-2 text-secondary hover:bg-gray-200"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/account-settings"
                    className="block px-4 py-2 text-secondary hover:bg-gray-200"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-secondary hover:bg-gray-200"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={openModal}
              className="bg-primary text-secondary py-2 px-4 rounded transition-transform duration-200 hover:-translate-y-1"
            >
              Create
            </button>
          </>
        ) : !isAuthenticated && onHomePage ? (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/login")}
                className="bg-primary text-secondary py-2 px-4 rounded transition-transform duration-200 hover:-translate-y-1"
              >
                 Login
            </button>

                  <button
                    onClick={() => navigate("/register")}
                    className="bg-primary text-secondary py-2 px-4 rounded transition-transform duration-200 hover:-translate-y-1"
                  >
                    Register
                  </button>

                  <button
                    onClick={openModal}
                    className="bg-primary text-secondary py-2 px-4 rounded transition-transform duration-200 hover:-translate-y-1"
                  >
                    Create
                  </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
