import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './common/Navbar';
import likeIcon from '../assets/like-icon.png';
import likedIcon from '../assets/liked-icon.png';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [publicPalettes, setPublicPalettes] = useState([]);
  const [publicArts, setPublicArts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('palettes');
  const [likedPalettes, setLikedPalettes] = useState([]);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [likesUsers, setLikesUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Модальное окно для выбора Create Art / Palette
  const [paletteModalOpen, setPaletteModalOpen] = useState(false); // Модальное окно для отображения палитры
  const [selectedPalette, setSelectedPalette] = useState(null); // Текущая выбранная палитра
  const [searchQuery, setSearchQuery] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  const createModalRef = useRef(null);
  const paletteModalRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const savedUsername = sessionStorage.getItem('username');

    if (token && savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }

    axios.get(`${API_BASE_URL}/palettes/public`, { withCredentials: true })
      .then(response => setPublicPalettes(response.data))
      .catch(error => console.error('Error fetching public palettes:', error));

    if (savedUsername) {
      axios.get(`${API_BASE_URL}/palettes/user/${savedUsername}/likes`, { withCredentials: true })
        .then(response => setLikedPalettes(response.data))
        .catch(error => console.error('Error fetching liked palettes:', error));
    }

    axios.get(`${API_BASE_URL}/arts/public`, { withCredentials: true })
      .then(response => setPublicArts(response.data))
      .catch(error => console.error('Error fetching public arts:', error));
  }, [API_BASE_URL]);

  const filterItemsByName = (items) => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleShowLikes = (itemId, type) => {
    const endpoint = type === 'palette' ? `palettes/${itemId}/likes/users` : `arts/${itemId}/likes/users`;
    axios.get(`${API_BASE_URL}/${endpoint}`, { withCredentials: true })
      .then(response => {
        setLikesUsers(response.data);
        setLikesModalOpen(true);
      })
      .catch(error => console.error('Error fetching users who liked the item:', error));
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createModalRef.current && !createModalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Добавляем обработчик для закрытия модального окна с палитрой
  useEffect(() => {
    const handleClickOutsidePalette = (event) => {
      if (paletteModalRef.current && !paletteModalRef.current.contains(event.target)) {
        setPaletteModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsidePalette);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsidePalette);
    };
  }, []);

  const handleLike = (paletteId) => {
    if (!isAuthenticated || publicPalettes.find(palette => palette.id === paletteId)?.user?.username === username) {
      return;
    }

    const alreadyLiked = likedPalettes.some(palette => palette.id === paletteId);

    axios.post(`${API_BASE_URL}/palettes/${paletteId}/like`, {}, { withCredentials: true })
      .then(() => {
        if (alreadyLiked) {
          setPublicPalettes(publicPalettes.map(palette =>
            palette.id === paletteId ? { ...palette, likes: palette.likes - 1 } : palette
          ));
          setLikedPalettes(likedPalettes.filter(palette => palette.id !== paletteId));
        } else {
          setPublicPalettes(publicPalettes.map(palette =>
            palette.id === paletteId ? { ...palette, likes: palette.likes + 1 } : palette
          ));
          const likedPalette = publicPalettes.find(palette => palette.id === paletteId);
          setLikedPalettes([...likedPalettes, likedPalette]);
        }
      })
      .catch((error) => console.error('Error liking/unliking palette:', error));
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateArt = () => {
    closeCreateModal();
    navigate(`/create-art?public=${!isAuthenticated}`);
  };

  const handleCreatePalette = () => {
    closeCreateModal();
    navigate(`/create-palette?public=${!isAuthenticated}`);
  };

  const handleOpenPaletteModal = (palette) => {
    setSelectedPalette(palette);
    setPaletteModalOpen(true);
  };

  const handleClosePaletteModal = () => {
    setPaletteModalOpen(false);
    setSelectedPalette(null);
  };

  return (
    <div className="min-h-screen bg-primary">
      <Navbar
        username={username}
        isAuthenticated={isAuthenticated}
        handleLogout={() => {
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('username');
          navigate('/login');
        }}
        onHomePage={true}
        openModal={openCreateModal}
      />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div ref={createModalRef}>
            <div className="bg-areasBg p-6 rounded-lg shadow-lg w-96 text-center">
              <h2 className="text-2xl text-secondary font-bold mb-4">Choose an option</h2>
              <button
                onClick={handleCreateArt}
                className="bg-primary text-secondary py-2 px-4 rounded mb-4 hover:text-primary hover:bg-secondary transition-all w-full"
              >
                Create Art
              </button>
              <button
                onClick={handleCreatePalette}
                className="bg-primary text-secondary py-2 px-4 rounded hover:text-primary hover:bg-secondary transition-all w-full"
              >
                Create Palette
              </button>
              <button onClick={closeCreateModal} className="mt-4 text-gray-500 hover:text-black">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16">
        <div className="container mx-auto py-8 px-16">
          <div className="text-center text-secondary mb-8">
            <button
              onClick={() => setActiveCategory('palettes')}
              className={`px-4 py-2 mx-2 ${activeCategory === 'palettes' ? 'bg-activeBg text-areasBg' : 'bg-inactiveBg'}`}
            >
              Palettes
            </button>
            <button
              onClick={() => setActiveCategory('arts')}
              className={`px-4 py-2 mx-2 ${activeCategory === 'arts' ? 'bg-activeBg text-areasBg' : 'bg-inactiveBg'}`}
            >
              Arts
            </button>
          </div>

          <div className="mb-4 text-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeCategory === 'palettes' ? 'palettes' : 'arts'} by name...`}
              className="px-4 py-2 border rounded w-full max-w-[410px]"
            />
          </div>

          {activeCategory === 'palettes' && (
            <>
              <h2 className="text-2xl font-bold text-secondary mb-4 text-center">Public Palettes</h2>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filterItemsByName(publicPalettes).length > 0 ? (
                    filterItemsByName(publicPalettes)
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((palette, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg shadow-md bg-areasBg"
                          style={{ width: 'fit-content', cursor: 'pointer' }}
                          onClick={() => handleOpenPaletteModal(palette)}
                        >
                          <h3 className="text-lg font-bold mb-2 text-secondary">{palette.name}</h3>
                          <p className="text-sm text-secondary mb-2">
                            by{' '}
                            {palette.user?.username ? (
                              <Link to={`/users/${palette.user.username}`} className="underline">
                                {palette.user.username}
                              </Link>
                            ) : (
                              'Unknown'
                            )}
                          </p>
                          <div className="grid grid-cols-4 gap-0 mb-4" style={{ width: 'fit-content' }}>
                            {palette.colors.map((color, idx) => (
                              <div key={idx} className="w-6 h-6" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-secondary">No public palettes available.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeCategory === 'arts' && (
            <>
              <h2 className="text-2xl font-bold text-secondary mb-4 text-center">Public Arts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterItemsByName(publicArts).length > 0 ? (
                  filterItemsByName(publicArts)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((art, index) => (
                      <div key={index} className="p-4 rounded-lg shadow-md bg-areasBg">
                        <h3 className="text-lg font-bold mb-2 text-secondary">{art.name}</h3>
                        <p className="text-sm text-secondary mb-2">
                          by{' '}
                          {art.user?.username ? (
                            <Link to={`/users/${art.user.username}`} className="underline">
                              {art.user.username}
                            </Link>
                          ) : (
                            'Unknown'
                          )}
                        </p>
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
                    ))
                ) : (
                  <p className="text-secondary">No public arts available.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {paletteModalOpen && selectedPalette && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div ref={paletteModalRef} className="bg-areasBg p-6 rounded-lg shadow-lg max-w-lg w-full text-center">
            <h2 className="text-2xl text-secondary font-bold mb-4">{selectedPalette.name}</h2>
            <div className="grid grid-cols-4 gap-0 mb-4" style={{ width: 'fit-content' }}>
              {selectedPalette.colors.map((color, idx) => (
                <div key={idx} className="w-32 h-32" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-0 mb-4 text-secondary">
              {selectedPalette.colors.map((color, idx) => (
                <p key={idx} className="text-sm">{color}</p>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleLike(selectedPalette.id)}
                className={`flex items-center ${!isAuthenticated || selectedPalette.user?.username === username ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}
                disabled={!isAuthenticated || selectedPalette.user?.username === username}
              >
                <img
                  src={likedPalettes.some(p => p.id === selectedPalette.id) ? likedIcon : likeIcon}
                  alt="Like"
                  className="h-6 w-6 mr-2"
                />
              </button>
              <span
                className="text-secondary text-xs cursor-pointer"
                onClick={() => handleShowLikes(selectedPalette.id, 'palette')}
              >
                {selectedPalette.likes === 1 ? `${selectedPalette.likes} like` : `${selectedPalette.likes} likes`}
              </span>
            </div>
          </div>
        </div>
      )}

      {likesModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div ref={modalRef} className="bg-areasBg p-6 rounded-lg shadow-lg max-w-3xl w-full">
            <h2 className="text-2xl text-secondary font-bold mb-4">
              Users who liked this palette
            </h2>
            <button
              onClick={() => setLikesModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              Close
            </button>
            <div className="grid grid-cols-3 gap-4">
              {likesUsers.length > 0 ? (
                likesUsers.map((user, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {user.avatarPath && (
                      <img
                        src={`${API_BASE_URL}${user.avatarPath}`}
                        alt={`${user.username}'s avatar`}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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
  );
};

export default Home;
