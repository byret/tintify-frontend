import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import AccountSettings from './components/AccountSettings';
import UserProfile from './components/UserProfile';
import CreatePalette from './components/CreatePalette';
import CreateArt from './components/CreateArt';

function App() {
  return (
    <Router>
      <div>
        <h1>PixApp</h1>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/users/:username" element={<UserProfile />} />
          <Route path="/create-palette" element={<CreatePalette />} />
          <Route path="/create-art" element={<CreateArt />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
