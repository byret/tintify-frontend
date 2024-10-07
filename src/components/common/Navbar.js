import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Проверка, нужно ли отображать гамбургер-меню (скрываем его на страницах логина и регистрации)
  const hideHamburger = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="bg-[#a38c9a] p-2 shadow-lg fixed w-full top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="h-8 md:h-12" />
          </Link>
          <Link to="/">
            <span className="text-white text-lg md:text-2xl font-semibold">Tintify</span>
          </Link>
        </div>

        {/* Показываем гамбургер-меню только на нужных страницах */}
        {!hideHamburger && (
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        )}

        <div className={`md:flex items-center space-x-2 md:space-x-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          {showSaveButton && (
            <button
              onClick={onSaveClick}
              className="bg-primary text-secondary py-1 px-3 md:py-2 md:px-4 rounded text-sm md:text-base transition-transform duration-200 hover:-translate-y-1"
            >
              Save
            </button>
          )}

          {isAuthenticated && onHomePage ? (
            <>
              <div onClick={toggleDropdown} className="relative">
                <span className="text-white cursor-pointer text-sm md:text-base">
                  Welcome, {username}!
                </span>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 md:w-48 bg-white shadow-md rounded-md z-20">
                    <Link
                      to={`/users/${username}`}
                      className="block px-4 py-2 text-secondary text-sm md:text-base hover:bg-gray-200"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/account-settings"
                      className="block px-4 py-2 text-secondary text-sm md:text-base hover:bg-gray-200"
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-secondary text-sm md:text-base hover:bg-gray-200"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={openModal}
                className="bg-primary text-secondary py-1 px-3 md:py-2 md:px-4 rounded text-sm md:text-base transition-transform duration-200 hover:-translate-y-1"
              >
                Create
              </button>
            </>
          ) : !isAuthenticated && onHomePage ? (
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-primary text-secondary py-1 px-3 md:py-2 md:px-4 rounded text-sm md:text-base transition-transform duration-200 hover:-translate-y-1"
              >
                Login
              </button>

              <button
                onClick={() => navigate('/register')}
                className="bg-primary text-secondary py-1 px-3 md:py-2 md:px-4 rounded text-sm md:text-base transition-transform duration-200 hover:-translate-y-1"
              >
                Register
              </button>

              <button
                onClick={openModal}
                className="bg-primary text-secondary py-1 px-3 md:py-2 md:px-4 rounded text-sm md:text-base transition-transform duration-200 hover:-translate-y-1"
              >
                Create
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
