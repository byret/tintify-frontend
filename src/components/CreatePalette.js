import React, { useState, useEffect, useRef } from 'react';
import { ChromePicker } from 'react-color';
import Navbar from './common/Navbar';
import axios from 'axios';
import { generatePalette } from './colorUtils';

const CreatePalette = () => {
  const [colors, setColors] = useState(Array(4).fill('#ffffff'));
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [squareCount, setSquareCount] = useState(4);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState('custom');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  const pickerRef = useRef(null);
  const saveModalRef = useRef(null); // Ref для модального окна

  const isAuthenticated = sessionStorage.getItem('authToken') ? true : false;

  useEffect(() => {
    if (!isAuthenticated) {
      setIsPublic(true);
      setIsCheckboxDisabled(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Закрытие цветового пикера при клике вне его
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setPickerVisible(false);
      }
      // Закрытие модального окна при клике вне его
      if (isSaveModalOpen && saveModalRef.current && !saveModalRef.current.contains(event.target)) {
        setIsSaveModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSaveModalOpen]);

  const handleColorChange = (color) => {
    const newColors = [...colors];
    newColors[selectedSquare] = color.hex;
    setColors(newColors);
    setCurrentColor(color.hex);
  };

  const handleSquareCountChange = (e) => {
    if (selectedScheme === 'custom') {
      const count = Math.min(32, Math.max(2, Number(e.target.value)));
      setSquareCount(count);
      setColors(Array(count).fill('#ffffff'));
    }
  };

  const handleSquareClick = (index, event) => {
    setSelectedSquare(index);
    setCurrentColor(colors[index]);
    setPickerVisible(true);
    const rect = event.target.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY + rect.height,
      left: rect.left + window.scrollX,
    });
  };

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  const closeModal = () => {
    setIsSaveModalOpen(false);
  };

  const handleSavePalette = async () => {
    try {
      const paletteData = {
        name: paletteName,
        colors: colors,
        isPublic: isPublic
      };

      await axios.post(`${API_BASE_URL}/palettes/create`, paletteData, {
        withCredentials: true
      });

      closeModal();
    } catch (error) {
      console.error('Error saving palette:', error);
    }
  };

  const handleSchemeChange = (e) => {
    setSelectedScheme(e.target.value);
    const newPalette = generatePalette(e.target.value, currentColor, squareCount);
    setColors(newPalette);

    if (e.target.value !== 'custom') {
      setSquareCount(newPalette.length);
    }
  };

  return (
    <div className="min-h-screen bg-primary pt-16">
      <Navbar showSaveButton={true} onSaveClick={handleSaveClick} isHomepage={false}/>
      <div className="container mx-auto py-8">
        <h1 className="text-center text-secondary text-3xl font-bold mb-6">Create your palette</h1>

        <div className="flex justify-center mb-6">
          <label className="text-secondary mr-4">Choose a colour scheme:</label>
          <select
            value={selectedScheme}
            onChange={handleSchemeChange}
            className="px-2 py-1 rounded text-black"
          >
            <option value="custom">Custom</option>
            <option value="monochromatic">Monochromatic</option>
            <option value="analogous">Analogous</option>
            <option value="complementary">Complementary</option>
            <option value="split_complementary">Split Complementary</option>
            <option value="triadic">Triadic</option>
            <option value="square">Square</option>
            <option value="rectangle">Rectangle (Tetradic)</option>
          </select>
        </div>

        <div className="flex justify-center mb-6">
          <label className="text-secondary mr-4">Number of colours:</label>
          <input
            type="number"
            value={squareCount}
            onChange={handleSquareCountChange}
            min="2"
            max="32"
            className="px-2 py-1 rounded text-black"
            disabled={selectedScheme !== 'custom'}
          />
        </div>

        <div className="flex flex-wrap justify-center">
          {colors.map((color, index) => (
            <div
              key={index}
              className="w-40 h-40 md:w-32 md:h-32 lg:w-40 lg:h-40 cursor-pointer transition-transform transform hover:scale-105"
              style={{ backgroundColor: color }}
              onClick={(e) => handleSquareClick(index, e)}
            />
          ))}
        </div>

        {pickerVisible && (
          <div
            ref={pickerRef}
            style={{
              position: 'absolute',
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 1000,
            }}
          >
            <ChromePicker color={currentColor} onChangeComplete={handleColorChange} />
          </div>
        )}
      </div>

      {isSaveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div ref={saveModalRef} className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl text-secondary font-bold mb-4">Save palette</h2>

            <div className="mb-4">
              <label className="block text-secondary mb-2">Palette name:</label>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center  text-secondary">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  className="mr-2"
                  disabled={isCheckboxDisabled}
                />
                Make this palette public
              </label>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSavePalette}
                className="px-4 py-2 bg-primary text-secondary rounded hover:bg-secondary"
              >
                Save palette
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePalette;
