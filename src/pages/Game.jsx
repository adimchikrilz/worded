import React, { useEffect, useState, useRef } from 'react';

const Game = () => {
  const [foundWords, setFoundWords] = useState(new Set());
  const [timer, setTimer] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [multiplier, setMultiplier] = useState(5);
  const [popupWord, setPopupWord] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timerIntervalRef = useRef(null);

  const words = ['KNIFE', 'SPOON', 'FORK', 'PAN', 'POT', 'OVEN', 'STOVE', 'PLATE', 'BOWL', 'CUP'];

  const [grid, setGrid] = useState([]);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [foundWordCells, setFoundWordCells] = useState(new Set());
  const [wordPositions, setWordPositions] = useState({});

  useEffect(() => {
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);

    const interFontLink = document.createElement('link');
    interFontLink.rel = 'stylesheet';
    interFontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(interFontLink);

    return () => {
      document.head.removeChild(fontAwesomeLink);
      document.head.removeChild(interFontLink);
    };
  }, []);

  useEffect(() => {
    initializeGrid();

    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setTimer(elapsedSeconds);

      if (elapsedSeconds <= 30) setMultiplier(5);
      else if (elapsedSeconds <= 120) setMultiplier(4);
      else if (elapsedSeconds <= 300) setMultiplier(3);
      else if (elapsedSeconds <= 600) setMultiplier(2);
      else setMultiplier(1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const initializeGrid = () => {
    const newGrid = Array(20).fill().map(() => Array(20).fill(''));
    const positions = {};
    placeWordsInGrid(newGrid, positions);
    fillRemainingCells(newGrid);
    setGrid(newGrid);
    setWordPositions(positions);
  };

  const placeWordsInGrid = (grid, positions) => {
    const directions = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
    words.forEach((word) => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 200) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * 20);
        const startCol = Math.floor(Math.random() * 20);
        if (canPlaceWord(grid, startRow, startCol, dir, word)) {
          const wordCells = [];
          for (let i = 0; i < word.length; i++) {
            const row = startRow + i * dir[0];
            const col = startCol + i * dir[1];
            grid[row][col] = word[i];
            wordCells.push([row, col]);
          }
          positions[word] = wordCells;
          placed = true;
        }
      }
    });
  };

  const canPlaceWord = (grid, row, col, dir, word) => {
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dir[0];
      const newCol = col + i * dir[1];
      if (newRow < 0 || newRow >= 20 || newCol < 0 || newCol >= 20 || (grid[newRow][newCol] && grid[newRow][newCol] !== word[i])) return false;
    }
    return true;
  };

  const fillRemainingCells = (grid) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) if (!grid[i][j]) grid[i][j] = letters.charAt(Math.floor(Math.random() * 26));
  };

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = rect.width / 20;
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    if (row >= 0 && row < 20 && col >= 0 && col < 20) {
      setDragStart([row, col]);
      setDragEnd([row, col]);
      setHighlightedCells([[row, col]]);
    }
  };

  const handleMouseMove = (e) => {
    if (!dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = rect.width / 20;
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    if (row >= 0 && row < 20 && col >= 0 && col < 20) {
      const startRow = dragStart[0], startCol = dragStart[1];
      const rowDiff = row - startRow, colDiff = col - startCol;
      let rowDir = 0, colDir = 0;
      if (Math.abs(rowDiff) >= Math.abs(colDiff)) {
        rowDir = rowDiff > 0 ? 1 : (rowDiff < 0 ? -1 : 0);
        if (rowDiff !== 0) colDir = Math.round(colDiff / Math.abs(rowDiff));
      } else {
        colDir = colDiff > 0 ? 1 : (colDiff < 0 ? -1 : 0);
        if (colDiff !== 0) rowDir = Math.round(rowDiff / Math.abs(colDiff));
      }
      if (Math.abs(rowDir) <= 1 && Math.abs(colDir) <= 1) {
        const newHighlighted = [];
        const distance = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
        for (let i = 0; i <= distance; i++) {
          const highlightRow = startRow + i * rowDir;
          const highlightCol = startCol + i * colDir;
          if (highlightRow >= 0 && highlightRow < 20 && highlightCol >= 0 && highlightCol < 20) newHighlighted.push([highlightRow, highlightCol]);
        }
        setHighlightedCells(newHighlighted);
        setDragEnd([row, col]);
      }
    }
  };

  const handleMouseUp = () => {
    if (dragStart && dragEnd) checkWord();
    setDragStart(null);
    setDragEnd(null);
    setHighlightedCells([]);
  };

  const checkWord = () => {
    if (!dragStart || !dragEnd || highlightedCells.length === 0) return;
    let word = '';
    highlightedCells.forEach(([row, col]) => (word += grid[row][col]));
    const reverseWord = word.split('').reverse().join('');
    const foundWord = words.find(w => w === word || w === reverseWord);
    if (foundWord && !foundWords.has(foundWord)) {
      const newFoundWords = new Set(foundWords);
      newFoundWords.add(foundWord);
      setFoundWords(newFoundWords);
      setTotalWords(newFoundWords.size);
      const newFoundCells = new Set(foundWordCells);
      highlightedCells.forEach(([row, col]) => newFoundCells.add(`${row}-${col}`));
      setFoundWordCells(newFoundCells);
      setPopupWord(foundWord);
      setTimeout(() => setPopupWord(null), 2000);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCellStyle = (rowIndex, colIndex) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    const isHighlighted = highlightedCells.some(([r, c]) => r === rowIndex && c === colIndex);
    const isFound = foundWordCells.has(cellKey);
    let backgroundColor = '#dfffd6', color = '#333', border = '1px solid #e0e0e0';
    if (isHighlighted) { backgroundColor = '#00CED1'; color = 'white'; border = '2px solid #008B8B'; }
    else if (isFound) { backgroundColor = '#87CEEB'; color = '#2E7D32'; border = '1px solid #5F9EA0'; }
    return {
      backgroundColor,
      color,
      border,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: isMobile || isExtraSmall ? (isExtraSmall ? '0.6rem' : '0.7rem') : '0.8rem',
      transition: 'all 0.2s',
      cursor: 'pointer',
      userSelect: 'none',
      fontFamily: 'Inter, sans-serif', // Apply Inter to grid cells
    };
  };

  const isMobile = window.innerWidth <= 768;
  const isExtraSmall = window.innerWidth <= 480;

  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleShowStats = () => {
    setShowStats(true);
    setShowLeaderboard(false);
    setIsDropdownOpen(false);
  };

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
    setShowStats(false);
    setIsDropdownOpen(false);
  };

  const closePopups = () => {
    setShowStats(false);
    setShowLeaderboard(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isMobile ? '#fff8f0' : '#fff8f0',
      fontFamily: 'Inter, sans-serif', // Set Inter as the default font
      padding: isMobile ? 0 : '20px',
      position: 'relative',
      margin: 0,
    }}>
      {/* Mobile Header */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#fff8f0',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '60px',
            background: '#fff8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="/worded-logo.png"
                alt="Worded Logo"
                style={{
                  height: '30px',
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
              <i 
                className="fas fa-chevron-down"
                onClick={toggleDropdown}
                style={{
                  color: '#333',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              />
            </div>
            <div style={{
              position: 'relative',
              background: '#b91c1c',
              color: 'white',
              padding: '8px 106px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'left',
              justifyContent: 'left',
              textAlign: 'left',
            }}>
              Badges
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                width: '100%',
                background: '#dfffd6',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                padding: '0 0 20px 20px',
                zIndex: 1001,
                borderRadius: '0 0 6px 6px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '14px' }}>Next badge:</span>
                  <i className="fas fa-medal" style={{ fontSize: '16px', color: '#cd7f32' }}></i>
                  <span style={{ fontWeight: 'bold' }}>Bronze Explorer</span>
                  <span style={{ color: '#666' }}>- 50 words remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {isMobile && isDropdownOpen && (
        <div style={{
          position: 'fixed',
          top: '110px',
          left: 0,
          right: 0,
          background: '#333',
          zIndex: 999,
          padding: '10px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          borderBottom: '1px solid #444',
        }}>
          <button
            onClick={handleShowStats}
            style={{
              background: 'transparent',
              color: 'white',
              padding: '12px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-chart-bar" style={{ width: '20px' }}></i>
            Your Stats
          </button>
          <button
            onClick={handleShowLeaderboard}
            style={{
              background: 'transparent',
              color: 'white',
              padding: '12px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-trophy" style={{ width: '20px' }}></i>
            Leaderboard
          </button>
        </div>
      )}

      {/* Trophy, Theme, Timer, and Streak Section */}
      {isMobile && (
        <div style={{
          position: 'relative',
          top: isDropdownOpen ? '170px' : '110px',
          left: 0,
          right: 0,
          height: '70px',
          background: '#fff8f0',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          padding: '0 15px',
          zIndex: 998,
          gap: '10px',
          marginTop: '20px',
        }}>
          <div style={{
            background: '#333',
            color: 'white',
            padding: '20px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minWidth: '60px',
          }}>
            <i className="fas fa-trophy" style={{ fontSize: '14px' }}></i>
            0/7
          </div>
          <div style={{
            flex: 1,
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
          }}>
            <div style={{ marginBottom: '2px' }}>Today's Theme: Kitchen</div>
            <div style={{
              fontSize: '11px',
              color: '#666',
              fontWeight: 'normal',
            }}>
              Find 10 words related to this theme
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '80px',
          }}>
            <div style={{
              background: '#333',
              color: 'white',
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <i className="fas fa-clock" style={{ fontSize: '12px' }}></i>
              {formatTime(timer)}(×{multiplier})
            </div>
            <div style={{
              background: '#333',
              color: 'white',
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <i className="fas fa-fire" style={{ fontSize: '12px' }}></i>
              0 days
            </div>
          </div>
        </div>
      )}

      {/* Word Popup */}
      {popupWord && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#FF6B35',
          color: 'white',
          padding: isMobile ? '15px 25px' : '20px 40px',
          borderRadius: isMobile ? '8px' : '12px',
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'popupFade 2s ease-in-out forwards',
        }}>
          {popupWord}
        </div>
      )}

      {/* Main Game Area */}
      <div style={{
        display: 'flex',
        gap: isMobile ? '16px' : '20px',
        height: isMobile ? 'auto' : 'calc(100vh - 40px)',
        flexDirection: isMobile ? 'column' : 'row',
        marginTop: isMobile ? (isDropdownOpen ? '240px' : '130px') : '0',
        padding: isMobile ? '20px' : '0',
      }}>
        <div style={{
          flex: isMobile ? 'none' : 1,
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '20px' : '20px',
          order: isMobile ? 1 : 0,
        }}>
          <div style={{
            display: isMobile ? 'none' : 'flex',
            justifyContent: 'left',
          }}>
            <img
              src="/worded-logo.png"
              alt="Worded Logo"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
                marginLeft: '50px',
              }}
            />
          </div>
          {!isMobile && (
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'left',
              marginLeft: '50px',
            }}>
              <div style={{ marginBottom: '4px' }}>Today's Theme: Kitchen</div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: 'normal',
              }}>
                Find 10 words related to this theme
              </div>
            </div>
          )}
          <div style={{
            flex: isMobile ? 'none' : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: isMobile ? '20px' : '0',
          }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(20, 1fr)',
                gridTemplateRows: 'repeat(20, 1fr)',
                width: '100%',
                maxWidth: isMobile ? (isExtraSmall ? '300px' : '350px') : '600px',
                height: isMobile ? (isExtraSmall ? '300px' : '350px') : '600px',
                backgroundColor: '#f0f8f0',
                gap: '1px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #e8f5e8',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`} style={getCellStyle(rowIndex, colIndex)}>
                    {letter}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div style={{
          flex: isMobile ? 'none' : 1,
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0' : '12px',
          order: isMobile ? 2 : 0,
          width: isMobile ? '100%' : 'auto',
        }}>
          <div style={{
            display: isMobile ? 'none' : 'flex',
            gap: '0px',
          }}>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0px' }}>
              <div style={{
                backgroundColor: '#00ffff',
                color: 'black',
                padding: '20px 16px',
                borderRadius: '8px 0 0px 0px',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <i className="fas fa-clock" style={{ fontSize: '14px' }}></i>
                {formatTime(timer)} (×{multiplier})
              </div>
              <div style={{
                backgroundColor: '#b00020',
                color: 'white',
                padding: '20px 16px',
                borderRadius: '0 0 0px 8px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <i className="fas fa-fire" style={{ fontSize: '14px' }}></i>
                0 days
              </div>
            </div>
            <div style={{
              flex: 1,
              backgroundColor: '#2f7b2f',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '0px 8px 8px 0px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginLeft: '0px',
            }}>
              <i className="fas fa-trophy" style={{ fontSize: '14px' }}></i>
              0/7
            </div>
            <div style={{
              flex: 2,
              backgroundColor: '#b91c1c',
              color: 'white',
              padding: '12px',
              borderRadius: '0 8px 8px 0',
              marginLeft: '10px',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: 'white' }}>Badges</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>Next badge:</span>
                <i className="fas fa-medal" style={{ fontSize: '16px', color: '#cd7f32' }}></i>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Bronze Explorer</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>50 words remaining</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: isMobile ? '#1e3a8a' : '#2f7b2f',
            color: 'white',
            padding: isMobile ? '20px' : '16px',
            borderRadius: isMobile ? '12px' : '8px',
            minHeight: isMobile ? 'auto' : '150px',
            marginBottom: isMobile ? '20px' : '0',
          }}>
            <div style={{
              fontWeight: 600,
              marginBottom: isMobile ? '20px' : '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: isMobile ? '18px' : '34px',
              color: isMobile ? 'white' : 'inherit',
            }}>
              <i className="fas fa-comments" style={{ fontSize: '16px' }}></i>
              Found Words
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
              gridTemplateRows: isMobile ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
              gap: isMobile ? '12px' : '8px',
            }}>
              {words.slice(0, 6).map((word, index) => (
                <div key={index} style={{
                  backgroundColor: foundWords.has(word) ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                  padding: isMobile ? (isExtraSmall ? '10px 6px' : '12px 8px') : '6px 8px',
                  borderRadius: isMobile ? '8px' : '4px',
                  fontSize: isMobile ? (isExtraSmall ? '11px' : '12px') : '11px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  border: foundWords.has(word) ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  minHeight: isMobile ? (isExtraSmall ? '36px' : '40px') : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {foundWords.has(word) ? word : '?????'}
                </div>
              ))}
              {words.slice(6, 10).map((word, index) => (
                <div key={index + 6} style={{
                  backgroundColor: foundWords.has(word) ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                  padding: isMobile ? (isExtraSmall ? '10px 6px' : '12px 8px') : '6px 8px',
                  borderRadius: isMobile ? '8px' : '4px',
                  fontSize: isMobile ? (isExtraSmall ? '11px' : '12px') : '11px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  border: foundWords.has(word) ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  minHeight: isMobile ? (isExtraSmall ? '36px' : '40px') : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {foundWords.has(word) ? word : '?????'}
                </div>
              ))}
            </div>
          </div>
          {!isMobile && (
            <div style={{
              backgroundColor: '#dfffd6',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '0',
            }}>
              <div style={{
                fontWeight: 'bold',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '34px',
                color: '#1a1a40',
              }}>
                <i className="fas fa-chart-bar" style={{ fontSize: '16px', color: '#1a1a40' }}></i>
                Your Stats
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Words</div>
                  <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>{totalWords}</div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '4px' }}>Avg. Time</div>
                  <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>0:00</div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '4px' }}>Best Streak</div>
                  <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>0 days</div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                }}>
                  <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '4px' }}>Total Score</div>
                  <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>0</div>
                </div>
              </div>
            </div>
          )}
          {!isMobile && (
            <div style={{
              backgroundColor: '#dfffd6',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{
                fontWeight: 'bold',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                color: '#1f2937',
              }}>
                <i className="fas fa-chart-line" style={{ fontSize: '20px', color: '#1a1a40' }}></i>
                Daily Progress
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                textAlign: 'left',
                fontStyle: 'italic',
              }}>
                No games played yet. Start playing to see your progress!
              </div>
            </div>
          )}
          {!isMobile && (
            <div style={{
              backgroundColor: '#003366',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '0',
            }}>
              <div style={{
                fontWeight: 'bold',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '34px',
              }}>
                <i className="fas fa-trophy" style={{ fontSize: '26px' }}></i>
                Leaderboard
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { rank: 1, name: 'Lansa', country: 'Angola', points: 766 },
                  { rank: 2, name: 'Saheed19', country: 'Nigeria', points: 0 },
                  { rank: 3, name: 'Abdulkareem', country: 'Angola', points: 0 },
                ].map((player, index) => (
                  <div key={player.rank} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '16px', fontSize: '14px' }}>{player.rank}</span>
                      <span style={{ fontSize: '14px' }}>{player.name}</span>
                      <span style={{ fontSize: '12px', opacity: '0.8', color: 'rgba(255,255,255,0.8)' }}>{player.country}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{player.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Your Stats Popup (Mobile Only) */}
      {isMobile && showStats && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1001,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={closePopups}
        >
          <div
            style={{
              backgroundColor: '#c4c9c1',
              padding: '16px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePopups}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: '#333',
                cursor: 'pointer',
                marginRight: '-150px',
                marginTop: '-10px'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
            <div style={{
              fontWeight: 'bold',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              color: '#1a1a40',
            }}>
              <i className="fas fa-chart-bar" style={{ fontSize: '16px', color: '#1a1a40' }}></i>
              Your Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '20px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Words</div>
                <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>{totalWords}</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '4px' }}>Avg. Time</div>
                <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>0:00</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '4px' }}>Best Streak</div>
                <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>0 days</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '4px' }}>Total Score</div>
                <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>0</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Popup (Mobile Only) */}
      {isMobile && showLeaderboard && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1001,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={closePopups}
        >
          <div
            style={{
              backgroundColor: '#c4c9c1',
              color: 'black',
              padding: '16px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePopups}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: 'black',
                cursor: 'pointer',
                marginRight: '-150px',
                marginTop: '-10px'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
            <div style={{
              fontWeight: 'bold',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
            }}>
              <i className="fas fa-trophy" style={{ fontSize: '26px' }}></i>
              Leaderboard
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { rank: 1, name: 'Lansa', country: 'Angola', points: 766 },
                { rank: 2, name: 'Saheed19', country: 'Nigeria', points: 0 },
                { rank: 3, name: 'Abdulkareem', country: 'Angola', points: 0 },
              ].map((player, index) => (
                <div key={player.rank} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '16px', fontSize: '14px' }}>{player.rank}</span>
                    <span style={{ fontSize: '14px' }}>{player.name}</span>
                    <span style={{ fontSize: '12px', opacity: 0.8, color: 'black' }}>{player.country}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{player.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popupFade {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
      `}</style>
    </div>
  );
};

export default Game;