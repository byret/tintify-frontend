import React, { useState, useRef, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import axios from 'axios';
import Navbar from './common/Navbar';

const CreateArt = () => {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [pixelSize, setPixelSize] = useState(45);
  const [pixels, setPixels] = useState(Array(width * height).fill('rgba(0, 0, 0, 0)'));

  const [palette, setPalette] = useState(Array(3 * 3).fill('#ffffff'));
  const [paletteWidth] = useState(3);
  const [paletteHeight, setPaletteHeight] = useState(3);
  const [maxPaletteHeight] = useState(10);

  const [currentColor, setCurrentColor] = useState('#000000');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState(null);
  const [activePaletteIndex, setActivePaletteIndex] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const [isDrawing, setIsDrawing] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userPalettes, setUserPalettes] = useState([]);
  const [likedPalettes, setLikedPalettes] = useState([]);
  const [allPalettes, setAllPalettes] = useState([]);
  const [activeTab, setActiveTab] = useState('my-palettes');
  const [searchQuery, setSearchQuery] = useState('');

  const [artName, setArtName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isDownloadable, setIsDownloadable] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  const pickerRef = useRef(null);
  const modalRef = useRef(null);
  const saveModalRef = useRef(null);
  const canvasRef = useRef(null);

  const isAuthenticated = sessionStorage.getItem('authToken') ? true : false;

  useEffect(() => {
    if (!isAuthenticated) {
      setIsPublic(true);
      setIsCheckboxDisabled(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setPickerVisible(false);
      }

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
      if (saveModalRef.current && !saveModalRef.current.contains(event.target)) {
        setIsSaveModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

   const handleDownloadImage = () => {
      const imagePixelSize = pixelSize * 5;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = width * imagePixelSize;
      canvas.height = height * imagePixelSize;

      pixels.forEach((color, index) => {
        const row = Math.floor(index / width);
        const col = index % width;
        context.fillStyle = color;
        context.fillRect(col * imagePixelSize, row * imagePixelSize, imagePixelSize, imagePixelSize);
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      const fileName = artName.trim() !== '' ? `${artName}.png` : 'pixel-art.png';
      link.download = fileName;
      link.click();
    };


  const saveStateForUndo = () => {
    setUndoStack([...undoStack, pixels]);
    setRedoStack([]);
  };

  const handleColorChange = (color) => {
    setCurrentColor(color.hex);
    if (selectedPixel !== null) {
      if (selectedPixel < palette.length) {
        const newPalette = [...palette];
        newPalette[selectedPixel] = color.hex;
        setPalette(newPalette);
      } else {
        const newPixels = [...pixels];
        newPixels[selectedPixel - palette.length] = color.hex;
        setPixels(newPixels);
      }
    }
  };

  const handleSquareClick = (index, event, isPalette) => {
    if (isErasing) {
      handleErase(index);
    } else if (isPicking) {
      setCurrentColor(pixels[index]);
      setIsPicking(false);
    } else {
      saveStateForUndo();
      if (isPalette) {
        if (activePaletteIndex === index) {
          setActivePaletteIndex(null);
          setCurrentColor('#000000');
        } else {
          setSelectedPixel(index);
          setActivePaletteIndex(index);
          setCurrentColor(palette[index]);
        }

        const rect = event.target.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY + rect.height,
          left: rect.left + window.scrollX,
        });
      } else {
        setSelectedPixel(index + palette.length);
        const rect = event.target.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY + rect.height,
          left: rect.left + window.scrollX,
        });
      }
    }
  };

  const handleMouseDown = (index, isPalette) => {
    saveStateForUndo();

    if (!isPalette) {
      if (isErasing) {
        const newPixels = [...pixels];
        newPixels[index] = 'rgba(0, 0, 0, 0)';
        setPixels(newPixels);
        setIsDrawing(true);
      } else if (!isFilling && !isPicking) {
        const newPixels = [...pixels];
        newPixels[index] = currentColor;
        setPixels(newPixels);
        setIsDrawing(true);
      }
    }
  };

  const handleMouseMove = (index) => {
    if (isDrawing) {
      const newPixels = [...pixels];
      if (isErasing) {
        newPixels[index] = 'rgba(0, 0, 0, 0)';
      } else {
        newPixels[index] = currentColor;
      }
      setPixels(newPixels);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack.pop();
      setRedoStack([...redoStack, pixels]);
      setPixels(previousState);
      setUndoStack([...undoStack]);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      setUndoStack([...undoStack, pixels]);
      setPixels(nextState);
      setRedoStack([...redoStack]);
    }
  };

  const handleWidthChange = (e) => {
    const newWidth = Math.max(2, Math.min(32, Number(e.target.value)));
    const newPixels = Array(newWidth * height).fill('rgba(0, 0, 0, 0)');

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < newWidth; j++) {
        const oldIndex = i * width + j;
        if (oldIndex < pixels.length) {
          newPixels[i * newWidth + j] = pixels[oldIndex];
        }
      }
    }

    setWidth(newWidth);
    setPixels(newPixels);
  };

  const handleHeightChange = (e) => {
    const newHeight = Math.max(2, Math.min(32, Number(e.target.value)));
    const newPixels = Array(width * newHeight).fill('rgba(0, 0, 0, 0)');

    for (let i = 0; i < newHeight; i++) {
      for (let j = 0; j < width; j++) {
        const oldIndex = i < height ? i * width + j : null;
        if (oldIndex !== null && oldIndex < pixels.length) {
          newPixels[i * width + j] = pixels[oldIndex];
        }
      }
    }

    setHeight(newHeight);
    setPixels(newPixels);
  };

  const addPaletteSquare = () => {
    const currentSquares = palette.length;
    const maxSquares = paletteWidth * maxPaletteHeight;

    if (currentSquares < maxSquares) {
      setPalette([...palette, '#ffffff']);
    } else {
      setPaletteHeight(paletteHeight + 1);
      setPalette([...palette, '#ffffff']);
    }
  };

  const removePaletteSquare = () => {
    if (palette.length > 0) {
      setPalette(palette.slice(0, palette.length - 1));
    }
  };

  const handlePixelSizeChange = (e) => {
    const newSize = Math.max(4, Math.min(64, Number(e.target.value)));
    setPixelSize(newSize);
  };

  const openModal = () => {
    const username = sessionStorage.getItem('username');

    axios
      .get(`${API_BASE_URL}/palettes/user/${username}`, { withCredentials: true })
      .then((response) => {
        setUserPalettes(response.data);
        setIsModalOpen(true);
      })
      .catch((error) => console.error('Error fetching user palettes:', error));

    axios
      .get(`${API_BASE_URL}/palettes/user/${username}/likes`, { withCredentials: true })
      .then((response) => {
        setLikedPalettes(response.data);
      })
      .catch((error) => console.error('Error fetching liked palettes:', error));

    axios
      .get(`${API_BASE_URL}/palettes/public`, { withCredentials: true })
      .then((response) => {
        setAllPalettes(response.data);
      })
      .catch((error) => console.error('Error fetching public palettes:', error));
  };

  const handlePaletteSelect = (selectedPalette) => {
    setPalette(selectedPalette.colors);
    setPaletteHeight(Math.ceil(selectedPalette.colors.length / paletteWidth));
    setIsModalOpen(false);
  };

  const filterPalettesByName = (palettes) => {
    return palettes.filter((palette) =>
      palette.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  const handleSaveArtAsFinal = () => {
     const canvas = canvasRef.current;
     const artBase64 = canvas.toDataURL('image/png');

     const artData = {
       name: artName,
       isPublic,
       isDownloadable,
       pixels,
       width,
       height,
       pixelSize,
       imageData: artBase64,
     };

     axios
       .post(`${API_BASE_URL}/arts/create`, artData, { withCredentials: true })
       .then((response) => {
         setIsSaveModalOpen(false);
         console.log('Art saved successfully');
       })
       .catch((error) => {
         console.error('Error saving art:', error);
       });
   };

   const toggleTool = (tool) => {
     if (tool === 'fill') {
       setIsFilling(!isFilling);
       setIsErasing(false);
       setIsPicking(false);
     } else if (tool === 'pick') {
       setIsPicking(!isPicking);
       setIsFilling(false);
       setIsErasing(false);
     } else if (tool === 'erase') {
       setIsErasing(!isErasing);
       setIsFilling(false);
       setIsPicking(false);
     }
   };

  const floodFill = (index) => {
    const targetColor = pixels[index];
    if (targetColor === currentColor) return;

    const newPixels = [...pixels];
    const stack = [index];

    while (stack.length > 0) {
      const currentIndex = stack.pop();

      if (newPixels[currentIndex] === targetColor) {
        newPixels[currentIndex] = currentColor;

        const neighbors = getNeighbors(currentIndex);
        neighbors.forEach((neighbor) => {
          if (newPixels[neighbor] === targetColor) {
            stack.push(neighbor);
          }
        });
      }
    }

    setPixels(newPixels);
  };

  const handleClearArt = () => {
    setPixels(Array(pixels.length).fill('rgba(0, 0, 0, 0)'));
  };

  const handleErase = (index) => {
      const newPixels = [...pixels];
      newPixels[index] = 'rgba(0, 0, 0, 0)';
      setPixels(newPixels);
   };

  const getNeighbors = (index) => {
    const neighbors = [];
    const row = Math.floor(index / width);
    const col = index % width;

    if (row > 0) neighbors.push(index - width);
    if (row < height - 1) neighbors.push(index + width);
    if (col > 0) neighbors.push(index - 1);
    if (col < width - 1) neighbors.push(index + 1);

    return neighbors;
  };

  return (
      <div className="min-h-screen bg-primary pt-16">
        <Navbar showSaveButton={true} onSaveClick={handleSaveClick} />

        <div className="container mx-auto py-8 flex justify-center items-start space-x-16">
          <div className="flex flex-col items-center" style={{ marginRight: '50px' }}>
            <h2 className="text-secondary text-xl mb-4">Palette</h2>
            <div className="flex mb-8 space-x-2">
              <button onClick={addPaletteSquare} className="bg-secondary text-primary w-10 h-10 border rounded transition-transform duration-200 hover:-translate-y-1">+</button>
              <button onClick={removePaletteSquare} className="bg-secondary text-primary w-10 h-10 border rounded transition-transform duration-200 hover:-translate-y-1">-</button>
              <button onClick={openModal} className="bg-secondary text-primary w-10 h-10 border rounded transition-transform duration-200 hover:-translate-y-1">...</button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${paletteWidth}, 1fr)` }}>
              {palette.map((color, index) => (
                <div
                  key={index}
                  className={`w-[46px] h-[46px] cursor-pointer border ${activePaletteIndex === index ? 'border-4 border-yellow-500' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={(e) => handleSquareClick(index, e, true)}
                  onDoubleClick={(e) => {
                    setPickerVisible(true);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-8 space-x-4">
              <div>
                <label className="text-secondary mr-2">Width:</label>
                <input type="number" value={width} onChange={handleWidthChange} min="2" max="32" className="px-2 py-1 rounded text-black" />
              </div>

              <div>
                <label className="text-secondary mr-2">Height:</label>
                <input type="number" value={height} onChange={handleHeightChange} min="2" max="32" className="px-2 py-1 rounded text-black" />
              </div>

              <div>
                <label className="text-secondary mr-2">Pixel Size:</label>
                <input type="number" value={pixelSize} onChange={handlePixelSizeChange} min="4" max="64" className="px-2 py-1 rounded text-black" />
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <div className="grid" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }} onMouseUp={handleMouseUp}>
                {pixels.map((color, index) => (
                  <div
                    key={index}
                    className="cursor-pointer border"
                    style={{
                        backgroundColor: color === 'rgba(0, 0, 0, 0)' ? 'transparent' : color,
                        backgroundImage: color === 'rgba(0, 0, 0, 0)' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                        backgroundSize: '10px 10px',
                        backgroundPosition: '0 0, 5px 5px',
                        width: `${pixelSize}px`,
                        height: `${pixelSize}px`,
                        boxSizing: 'border-box',
                      }}
                    onMouseDown={() => handleMouseDown(index, false)}
                    onMouseMove={() => handleMouseMove(index)}
                    onClick={(e) => {
                      if (isFilling) {
                        floodFill(index);
                        setIsFilling(false);
                      } else {
                        handleSquareClick(index, e, false);
                      }
                    }}
                    onDoubleClick={(e) => {
                      setPickerVisible(true);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center" style={{ marginLeft: '50px' }}>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-secondary">Active Colour:</h3>
              <div className="w-12 h-12 border" style={{ backgroundColor: currentColor }} />
            </div>

            <button
              onClick={() => toggleTool('fill')}
              className={`w-24 h-12 border rounded ${isFilling ? 'bg-activeBg text-white' : 'bg-secondary text-primary'} mb-2 transition-transform duration-200 hover:-translate-y-1`}
            >
              Fill
            </button>

            <button
              onClick={handleUndo}
              className="w-24 h-12 bg-secondary text-primary rounded hover:bg-secondaryDarker mb-2 transition-transform duration-200 hover:-translate-y-1"
            >
              Undo
            </button>

            <button
              onClick={handleRedo}
              className="w-24 h-12 bg-secondary text-primary rounded hover:bg-secondaryDarker mb-2 transition-transform duration-200 hover:-translate-y-1"
            >
              Redo
            </button>

            <button
              onClick={() => toggleTool('pick')}
              className={`w-24 h-12 border rounded ${isPicking ? 'bg-activeBg text-white' : 'bg-secondary text-primary transition-transform duration-200 hover:-translate-y-1'} mb-2`}
            >
              Pipette
            </button>

            <button
              onClick={() => toggleTool('erase')}
              className={`w-24 h-12 border rounded ${isErasing ? 'bg-activeBg text-white' : 'bg-secondary text-primary transition-transform duration-200 hover:-translate-y-1'} mb-2`}
            >
              Eraser
            </button>

            <button
              onClick={handleClearArt}
              className="w-24 h-12 bg-secondary text-primary rounded hover:bg-secondaryDarker mb-2 transition-transform duration-200 hover:-translate-y-1"
            >
              Clear
            </button>
          </div>
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
        )}5

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div ref={modalRef} className="bg-areasBg p-6 rounded-lg shadow-lg max-w-3xl w-full">
            <h2 className="text-2xl font-bold text-secondaryDarker mb-4">Palettes</h2>
            <div className="flex justify-center mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by palette name..."
                className="px-4 py-2 border rounded w-full"
              />
            </div>

            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('my-palettes')}
                className={`px-4 py-2 ${activeTab === 'my-palettes' ? 'bg-activeBg text-areasBg' : 'bg-inactiveBg text-secondaryDarker'}`}
              >
                My Palettes
              </button>
              <button
                onClick={() => setActiveTab('liked-palettes')}
                className={`px-4 py-2 ${activeTab === 'liked-palettes' ? 'bg-activeBg text-areasBg' : 'bg-inactiveBg text-secondaryDarker'}`}
              >
                Liked Palettes
              </button>
              <button
                onClick={() => setActiveTab('all-palettes')}
                className={`px-4 py-2 ${activeTab === 'all-palettes' ? 'bg-activeBg text-areasBg' : 'bg-inactiveBg text-secondaryDarker'}`}
              >
                All Palettes
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {activeTab === 'my-palettes' &&
                filterPalettesByName(userPalettes).map((palette, index) => (
                  <div key={index} className="p-4 border rounded-lg cursor-pointer hover:bg-secondaryAreasBg" onClick={() => handlePaletteSelect(palette)}>
                    <h3 className="font-bold mb-2">{palette.name}</h3>
                    <div className="grid grid-cols-4">
                      {palette.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-8 h-8 border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}

              {activeTab === 'liked-palettes' &&
                filterPalettesByName(likedPalettes).map((palette, index) => (
                  <div key={index} className="p-4 border rounded-lg cursor-pointer hover:bg-secondaryAreasBg" onClick={() => handlePaletteSelect(palette)}>
                    <h3 className="font-bold mb-2">{palette.name}</h3>
                    <div className="grid grid-cols-4">
                      {palette.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-8 h-8 border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}

              {activeTab === 'all-palettes' &&
                filterPalettesByName(allPalettes).map((palette, index) => (
                  <div key={index} className="p-4 border rounded-lg cursor-pointer hover:bg-secondaryAreasBg" onClick={() => handlePaletteSelect(palette)}>
                    <h3 className="font-bold mb-2">{palette.name}</h3>
                    <div className="grid grid-cols-4">
                      {palette.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-8 h-8 border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {isSaveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div ref={saveModalRef} className="bg-areasBg p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-secondaryDarker mb-4">Save art</h2>

            <div className="mb-4">
              <label className="block text-secondaryDarker mb-2">Art name:</label>
              <input
                type="text"
                value={artName}
                onChange={(e) => setArtName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center text-secondaryDarker ">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  className="mr-2"
                  disabled={isCheckboxDisabled}
                />
                Make this art public
              </label>
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center text-secondaryDarker">
                <input
                  type="checkbox"
                  checked={isDownloadable}
                  onChange={() => setIsDownloadable(!isDownloadable)}
                  className="mr-2"
                />
                Allow to download
              </label>
            </div>

            <div className="flex justify-center space-x-4">
              <button className="px-4 py-2 bg-primary text-secondary rounded hover:bg-secondary hover:text-primary" onClick={handleDownloadImage}>Download as PNG</button>
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              <button onClick={handleSaveArtAsFinal} className="px-4 py-2 bg-primary text-secondary rounded hover:bg-secondary hover:text-primary">
                Save art
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateArt;
