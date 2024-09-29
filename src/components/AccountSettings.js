import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './common/Navbar';

const AccountSettings = () => {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    const savedUsername = sessionStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      setNewUsername(savedUsername);

      axios.get(`http://localhost:8080/users/edit/${savedUsername}`, {
        withCredentials: true,
      })
        .then(response => {
          if (response.data.avatarPath) {
            const avatarUrl = `http://localhost:8080${response.data.avatarPath}`;
            setAvatar(avatarUrl);
          }
        })
        .catch(error => console.error('Error fetching user details:', error));
    }
  }, []);

  const handleAvatarChange = (e) => {
    setNewAvatar(e.target.files[0]);
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (e.target.value === '' || confirmNewPassword === '') {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(e.target.value === confirmNewPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);
    if (newPassword === '' || e.target.value === '') {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(newPassword === e.target.value);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword && !passwordsMatch) {
      setMessage('New passwords do not match');
      return;
    }

    const formData = new FormData();
    formData.append('currentUsername', username);
    formData.append('newUsername', newUsername);
    if (newAvatar) {
      formData.append('avatar', newAvatar);
    }
    if (oldPassword && newPassword) {
      formData.append('oldPassword', oldPassword);
      formData.append('newPassword', newPassword);
    }

    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.put('http://localhost:8080/users/update-user-details', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        sessionStorage.setItem('username', newUsername);
        setMessage('User details updated successfully');
        const updatedAvatar = response.data.avatarPath;
        if (updatedAvatar) {
          const avatarUrl = `http://localhost:8080${updatedAvatar}?t=${new Date().getTime()}`;
          setAvatar(avatarUrl);
        }
      } else {
        setMessage('Failed to update user details');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data);
      } else {
        setMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pixelBg">
      <Navbar />
      <div className="bg-areasBg shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-secondary mb-6 text-center">Account Settings</h1>

        {avatar && (
          <div className="flex justify-center mb-4">
            <img src={avatar} alt="User Avatar" className="rounded-full h-32 w-32 object-cover" />
          </div>
        )}

        {message && (
          <p className="text-center mb-4 text-green-500">{message}</p>
        )}

        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Change Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${passwordsMatch ? 'focus:ring-primary' : 'focus:ring-red-500'} focus:border-transparent`}
            />
          </div>

          {newPassword && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${passwordsMatch ? 'focus:ring-primary' : 'focus:ring-red-500'} focus:border-transparent`}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </>
          )}

          {!passwordsMatch && (
            <p className="text-red-500 text-sm">New passwords do not match</p>
          )}

          <button
            type="submit"
            className="w-full bg-secondary text-primary py-2 px-4 rounded transition-transform duration-200 hover:-translate-y-1"
          >
            Update User Details
          </button>

        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
