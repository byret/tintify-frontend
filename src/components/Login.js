import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './common/Navbar';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    const { username: loggedInUser } = response.data;

    if (loggedInUser) {
      sessionStorage.setItem('authToken', 'true');
      sessionStorage.setItem('username', loggedInUser);
      window.location.href = '/#/home';
    } else {
      setMessage('Login failed');
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      setMessage('Invalid username or password');
    } else {
      setMessage('An error occurred during login');
    }
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-pixelBg">
      <Navbar />
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-secondary mb-6 text-center">Login</h1>

        {message && (
          <p className="text-red-500 text-center mb-4">{message}</p>
        )}

        <form onSubmit={handleLogin}>
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-secondary py-2 px-4 rounded hover:bg-secondary hover:text-primary transition-all"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-activeBg hover:text-primary transition-all">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
