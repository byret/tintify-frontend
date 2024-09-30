import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Navbar from './common/Navbar';
import likeIcon from '../assets/like-icon.png';
import likedIcon from '../assets/liked-icon.png';

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [palettes, setPalettes] = useState([]);
  const [likedPalettes, setLikedPalettes] = useState([]);
  const [arts, setArts] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('palettes');
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [likesUsers, setLikesUsers] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  const modalRef = useRef(null);

  useEffect(() => {
    const loggedInUser = sessionStorage.getItem('username');
    setCurrentUser(loggedInUser || '');

    axios.get(`${API_BASE_URL}/users/${username}`, { withCredentials: true })
      .then(response => {
        setUser(response.data);
        setAvatar(`${API_BASE_URL}${response.data.avatarPath}`);
      })
      .catch(error => console.error('Error fetching user data:', error));

    axios.get(`${API_BASE_URL}/palettes/user/${username}/public`, { withCredentials: true })
      .then(response => setPalettes(response.data))
      .catch(error => console.error('Error fetching public palettes:', error));

    if (loggedInUser) {
      axios.get(`${API_BASE_URL}/palettes/user/${loggedInUser}/likes`, { withCredentials: true })
        .then(response => setLikedPalettes(response.data))
        .catch(error => console.error('Error fetching liked palettes:', error));
    }

    axios.get(`${API_BASE_URL}/arts/user/${username}/public`, { withCredentials: true })
      .then(response => setArts(response.data))
      .catch(error => console.error('Error fetching public arts:', error));
  }, [username, API_BASE_URL]);

  // Проверка, лайкнута ли палитра текущим пользователем
  const isPaletteLiked = (paletteId) => {
    return likedPalettes.some(palette => palette.id === paletteId);
  };

  const handleShowLikes = (paletteId) => {
    axios.get(`${API_BASE_URL}/palettes/${paletteId}/likes/users`, { withCredentials: true })
      .then(response => {
        setLikesUsers(response.data);
        setLikesModalOpen(true);
      })
      .catch(error => console.error('Error fetching users who liked the palette:', error));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setLikesModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLike = (paletteId) => {
    const alreadyLiked = isPaletteLiked(paletteId);

    axios.post(`${API_BASE_URL}/palettes/${paletteId}/like`, {}, {
      withCredentials: true
    })
    .then(() => {
      if (alreadyLiked) {
        setPalettes(palettes.map(palette =>
          palette.id === paletteId ? { ...palette, likes: palette.likes - 1 } : palette
        ));
        setLikedPalettes(likedPalettes.filter(palette => palette.id !== paletteId));
      } else {
        setPalettes(palettes.map(palette =>
          palette.id === paletteId ? { ...palette, likes: palette.likes + 1 } : palette
        ));
        const likedPalette = palettes.find(palette => palette.id === paletteId);
        setLikedPalettes([...likedPalettes, likedPalette]);
      }
    })
    .catch((error) => console.error('Error liking/unliking palette:', error));
  };

  return (
    <div className="min-h-screen bg-primary pt-16">
      <Navbar />
      <div className="container mx-auto py-8 text-center">
        {avatar && avatar !== `${API_BASE_URL}` && (
          <img
            src={avatar ? avatar : "/default_avatar.png"}
            alt="User Avatar"
            className="rounded-full h-32 w-32 object-cover mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-secondary">{user?.username}</h1>

        <div className="mt-8 flex justify-center space-x-8">
          <button
            onClick={() => setActiveTab('palettes')}
            className={`px-4 py-2 ${activeTab === 'palettes' ? 'bg-activeBg text-areasBg' : 'bg-inactiveBg text-secondary'}`}
          >
            Palettes
          </button>
          <button
            onClick={() => setActiveTab('liked-palettes')}
            className={`px-4 py-2 ${activeTab === 'liked-palettes' ? 'bg-activeBg text-areasBg' : 'bg-inactiveBg text-secondary'}`}
          >
            Liked Palettes
          </button>
          <button
            onClick={() => setActiveTab('arts')}
            className={`px-4 py-2 ${activeTab === 'arts' ? 'bg-activeBg text-areasBg' : 'bg-inactiveBg text-secondary'}`}
          >
            Arts
          </button>
        </div>

        <div className="mt-8">
          {activeTab === 'palettes' && (
            <>
              <h2 className="text-2xl font-semibold text-secondary mb-4">Palettes</h2>
              {palettes.length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {palettes.map((palette, index) => (
                    <div key={index} className="p-4 rounded-lg shadow-md bg-areasBg">
                      <h3 className="text-lg font-bold mb-2 text-secondary">{palette.name}</h3>
                      <p className="text-sm text-secondary mb-4">by <Link to={`/users/${palette.user.username}`} className="underline">{palette.user.username}</Link></p>
                      <div className="grid grid-cols-4" style={{ gap: '0px' }}>
                        {palette.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleLike(palette.id)}
                            disabled={currentUser === username}
                            className={`flex items-center ${currentUser === username ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}
                          >
                            <img
                              src={isPaletteLiked(palette.id) ? likedIcon : likeIcon}
                              alt="Like"
                              className="h-6 w-6 mr-2"
                            />
                          </button>
                          <span
                            className="text-secondary text-xs"
                            onClick={() => {
                              if (currentUser === username) {
                                handleShowLikes(palette.id);
                              }
                            }}
                            style={{ cursor: currentUser === username ? 'pointer' : 'default' }}
                          >
                            {palette.likes} Likes
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary">This user has no public palettes yet.</p>
              )}
            </>
          )}

          {activeTab === 'liked-palettes' && (
            <>
              <h2 className="text-2xl font-semibold text-secondary mb-4">Liked Palettes</h2>
              {likedPalettes.length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {likedPalettes.map((palette, index) => (
                    <div key={index} className="p-4 rounded-lg shadow-md bg-areasBg">
                      <h3 className="text-lg font-bold mb-2 text-secondary">{palette.name}</h3>
                      <p className="text-sm text-secondary mb-4">by <Link to={`/users/${palette.user.username}`} className="underline">{palette.user.username}</Link></p>
                      <div className="grid grid-cols-4" style={{ gap: '0px' }}>
                        {palette.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary">This user has not liked any public palettes yet.</p>
              )}
            </>
          )}

          {activeTab === 'arts' && (
            <>
              <h2 className="text-2xl font-semibold text-secondary mb-4">Arts</h2>
              {arts.length > 0 ? (
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {arts.map((art, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <h3 className="text-lg font-bold mb-2 text-secondary">{art.name}</h3>
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: `repeat(${art.width}, 1fr)`,
                          gap: '0px',
                          width: `${art.width * 20}px`,
                          height: `${art.height * 20}px`,
                        }}
                      >
                        {art.pixels.map((color, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: color,
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary">This user has no public arts yet.</p>
              )}
            </>
          )}

          {likesModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                <h2 className="text-2xl font-bold mb-4 text-secondary">Users who liked this palette</h2>
                <div className="grid grid-cols-3 gap-4">
                  {likesUsers && Array.isArray(likesUsers) && likesUsers.length > 0 ? (
                    likesUsers.map((user, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {user.avatarPath && (
                          <img
                            src={avatar ? avatar : "/default_avatar.png"}
                            alt="User Avatar"
                            className="rounded-full h-32 w-32 object-cover mx-auto mb-4"
                          />
                        )}
                        <p className="text-secondary">{user.username}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-secondary">No likes yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
