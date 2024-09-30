import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './common/Navbar';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Поле для подтверждения пароля
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);  // Для отслеживания успешности регистрации
  const [showTooltip, setShowTooltip] = useState(false); // Для управления всплывающим уведомлением

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
        setIsSuccess(true);  // Устанавливаем флаг успеха
      } else {
        setMessage('Registration failed. Please try again.');
        setIsSuccess(false);  // Устанавливаем флаг неудачи
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage('Username already exists');
      } else {
        setMessage('An error occurred during registration. Please try again.');
      }
      setIsSuccess(false);  // Устанавливаем флаг неудачи
    }
  };

  // Функция для проверки совпадения паролей
  const passwordsMatch = password === confirmPassword && password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-pixelBg">
      <Navbar />
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-secondary mb-6 text-center">Register</h1>

        {message && (
          <p
            className="text-center mb-4"
            style={{
              color: isSuccess ? '#9BCF8C' : '#913737',  // Цвет через HEX
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full text-secondary bg-primary py-2 px-4 rounded hover:bg-secondary hover:text-primary transition-all relative"
            disabled={!passwordsMatch} // Блокируем кнопку, если пароли не совпадают
            onMouseEnter={() => !passwordsMatch && setShowTooltip(true)} // Показываем подсказку, если пароли не совпадают
            onMouseLeave={() => setShowTooltip(false)} // Прячем подсказку
          >
            Register
            {!passwordsMatch && showTooltip && (
              <div className="absolute top-full left-0 bg-red-500 text-white p-2 rounded shadow-lg mt-1">
                Passwords must match!
              </div>
            )}
          </button>
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
