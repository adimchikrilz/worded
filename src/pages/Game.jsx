import React, { useEffect, useState, useRef } from 'react';

const Game = () => {
  const [foundWords, setFoundWords] = useState(new Set());
  const [timer, setTimer] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [multiplier, setMultiplier] = useState(5);
  const [popupWord, setPopupWord] = useState(null);
  const timerIntervalRef = useRef(null);

  // Fixed list of kitchen words
  const words = ['KNIFE', 'SPOON', 'FORK', 'PAN', 'POT', 'OVEN', 'STOVE', 'PLATE', 'BOWL', 'CUP'];
  
  // Grid state
  const [grid, setGrid] = useState([]);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [foundWordCells, setFoundWordCells] = useState(new Set());
  const [wordPositions, setWordPositions] = useState({});

  // Initialize grid
  useEffect(() => {
    initializeGrid();
    
    // Start timer
    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setTimer(elapsedSeconds);
      
      // Update multiplier based on elapsed time
      if (elapsedSeconds <= 30) {
        setMultiplier(5);
      } else if (elapsedSeconds <= 120) {
        setMultiplier(4);
      } else if (elapsedSeconds <= 300) {
        setMultiplier(3);
      } else if (elapsedSeconds <= 600) {
        setMultiplier(2);
      } else {
        setMultiplier(1);
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const initializeGrid = () => {
    // Create empty 20x20 grid for better word placement
    const newGrid = Array(20).fill().map(() => Array(20).fill(''));
    const positions = {};
    
    // Place words in the grid
    placeWordsInGrid(newGrid, positions);
    
    // Fill remaining cells with random letters
    fillRemainingCells(newGrid);
    
    setGrid(newGrid);
    setWordPositions(positions);
  };

  const placeWordsInGrid = (grid, positions) => {
    const directions = [
      [0, 1],   // right
      [1, 0],   // down
      [1, 1],   // diagonal down-right
      [-1, 1],  // diagonal up-right
      [0, -1],  // left
      [-1, 0],  // up
      [-1, -1], // diagonal up-left
      [1, -1]   // diagonal down-left
    ];

    words.forEach((word, wordIndex) => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 200) {
        attempts++;
        
        // Choose random direction
        const dir = directions[Math.floor(Math.random() * directions.length)];
        
        // Choose random starting position
        const startRow = Math.floor(Math.random() * 20);
        const startCol = Math.floor(Math.random() * 20);
        
        // Check if word can be placed here
        if (canPlaceWord(grid, startRow, startCol, dir, word)) {
          // Place the word
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
    // Check if word fits within grid boundaries
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dir[0];
      const newCol = col + i * dir[1];
      
      // Check if out of bounds
      if (newRow < 0 || newRow >= 20 || newCol < 0 || newCol >= 20) {
        return false;
      }
      
      // Check if cell is already occupied by a different letter
      if (grid[newRow][newCol] && grid[newRow][newCol] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  const fillRemainingCells = (grid) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if (!grid[i][j]) {
          grid[i][j] = letters.charAt(Math.floor(Math.random() * 26));
        }
      }
    }
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
      const startRow = dragStart[0];
      const startCol = dragStart[1];
      
      // Calculate direction vector
      const rowDiff = row - startRow;
      const colDiff = col - startCol;
      
      // Normalize to get direction (only allow straight lines and diagonals)
      let rowDir = 0;
      let colDir = 0;
      
      if (Math.abs(rowDiff) >= Math.abs(colDiff)) {
        rowDir = rowDiff > 0 ? 1 : (rowDiff < 0 ? -1 : 0);
        if (rowDiff !== 0) {
          colDir = Math.round(colDiff / Math.abs(rowDiff));
        }
      } else {
        colDir = colDiff > 0 ? 1 : (colDiff < 0 ? -1 : 0);
        if (colDiff !== 0) {
          rowDir = Math.round(rowDiff / Math.abs(colDiff));
        }
      }
      
      // Only allow valid directions (horizontal, vertical, diagonal)
      if (Math.abs(rowDir) <= 1 && Math.abs(colDir) <= 1) {
        const newHighlighted = [];
        
        // Calculate distance
        const distance = Math.max(
          Math.abs(rowDiff),
          Math.abs(colDiff)
        );
        
        // Add all cells along the line
        for (let i = 0; i <= distance; i++) {
          const highlightRow = startRow + i * rowDir;
          const highlightCol = startCol + i * colDir;
          
          if (highlightRow >= 0 && highlightRow < 20 && 
              highlightCol >= 0 && highlightCol < 20) {
            newHighlighted.push([highlightRow, highlightCol]);
          }
        }
        
        setHighlightedCells(newHighlighted);
        setDragEnd([row, col]);
      }
    }
  };

  const handleMouseUp = () => {
    if (dragStart && dragEnd) {
      checkWord();
    }
    
    setDragStart(null);
    setDragEnd(null);
    setHighlightedCells([]);
  };

  const checkWord = () => {
    if (!dragStart || !dragEnd || highlightedCells.length === 0) return;
    
    // Extract word from highlighted cells
    let word = '';
    highlightedCells.forEach(([row, col]) => {
      word += grid[row][col];
    });
    
    // Check reverse as well
    const reverseWord = word.split('').reverse().join('');
    
    // Check if word or its reverse is valid
    const foundWord = words.find(w => w === word || w === reverseWord);
    
    if (foundWord && !foundWords.has(foundWord)) {
      // Add to found words
      const newFoundWords = new Set(foundWords);
      newFoundWords.add(foundWord);
      setFoundWords(newFoundWords);
      setTotalWords(newFoundWords.size);
      
      // Mark cells as found
      const newFoundCells = new Set(foundWordCells);
      highlightedCells.forEach(([row, col]) => {
        newFoundCells.add(`${row}-${col}`);
      });
      setFoundWordCells(newFoundCells);
      
      // Show popup word for 2 seconds
      setPopupWord(foundWord);
      setTimeout(() => {
        setPopupWord(null);
      }, 2000);
    }
  };

  // Format timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCellStyle = (rowIndex, colIndex) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    const isHighlighted = highlightedCells.some(([r, c]) => r === rowIndex && c === colIndex);
    const isFound = foundWordCells.has(cellKey);
    
    let backgroundColor = '#dfffd6';
    let color = '#333';
    let border = '1px solid #e0e0e0';
    
    if (isHighlighted) {
      backgroundColor = '#00CED1';
      color = 'white';
      border = '2px solid #008B8B';
    } else if (isFound) {
      backgroundColor = '#87CEEB';
      color = '#2E7D32';
      border = '1px solid #5F9EA0';
    }
    
    return {
      backgroundColor,
      color,
      border,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '0.8rem',
      transition: 'all 0.2s',
      cursor: 'pointer',
      userSelect: 'none',
    };
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fff8f0', 
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Word Popup */}
      {popupWord && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#FF6B35',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '12px',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'popupFade 2s ease-in-out forwards'
        }}>
          {popupWord}
        </div>
      )}

      {/* Main Game Area */}
      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 40px)' }}>
        {/* Left Side - Game Grid with Logo and Theme */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Logo */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'left'
          }}>
            <img 
              src="/worded-logo.png" 
              alt="Worded Logo" 
              style={{ 
                height: '40px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Today's Theme */}
          <div style={{ 
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
              Today's Theme: Kitchen
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>
              Find {words.length} words related to this theme
            </div>
          </div>

          {/* Game Grid */}
          <div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(20, 1fr)',
                gridTemplateRows: 'repeat(20, 1fr)',
                width: '100%',
                maxWidth: '600px',
                height: '600px',
                backgroundColor: '#f0f8f0',
                gap: '1px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #e8f5e8'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {grid.map((row, rowIndex) => (
                row.map((letter, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    style={getCellStyle(rowIndex, colIndex)}
                  >
                    {letter}
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel - Equal width */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Timer and Days Streak together, Trophy and Badges beside them */}
          <div style={{ display: 'flex', gap: '0px' }}>
            {/* Timer and Days Streak - Vertical stack */}
            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '0px' }}>
              {/* Timer */}
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
                gap: '8px'
              }}>
                <i className="fas fa-clock" style={{ fontSize: '14px' }}></i>
                {formatTime(timer)} (×{multiplier})
              </div>

              {/* Days Streak */}
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
                gap: '8px'
              }}>
                <i className="fas fa-heart" style={{ fontSize: '14px' }}></i>
                0 days
              </div>
            </div>

            {/* Trophy */}
            <div style={{
              flex: '1',
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
              marginLeft: '0px'
            }}>
              <i className="fas fa-trophy" style={{ fontSize: '14px' }}></i>
              0/7
            </div>

            {/* Badges Section */}
            <div style={{
              flex: '2',
              backgroundColor: '#b91c1c',
              color: 'white',
              padding: '12px',
              borderRadius: '0 8px 8px 0',
              marginLeft: '10px'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '8px', 
                fontSize: '14px',
                color: 'white'
              }}>
                Badges
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '8px',
                borderRadius: '4px'
              }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>Next badge:</span>
                <i className="fas fa-medal" style={{ fontSize: '16px', color: '#cd7f32' }}></i>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Bronze Explorer</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>50 words remaining</div>
                </div>
              </div>
            </div>
          </div>

          {/* Found Words - 6x4 grid layout as in Figma */}
          <div style={{
            backgroundColor: '#2f7b2f',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            minHeight: '150px'
          }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '34px' 
            }}>
              <i className="fas fa-comments" style={{ fontSize: '16px' }}></i>
              Found Words
            </div>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {words.slice(0, 6).map((word, index) => (
                <div key={index} style={{
                  backgroundColor: foundWords.has(word) 
                    ? 'rgba(255,255,255,0.25)' 
                    : 'rgba(255,255,255,0.1)',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  border: foundWords.has(word) 
                    ? '1px solid rgba(255,255,255,0.4)' 
                    : '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  {foundWords.has(word) ? word : '?????'}
                </div>
              ))}
              {words.slice(6, 10).map((word, index) => (
                <div key={index + 6} style={{
                  backgroundColor: foundWords.has(word) 
                    ? 'rgba(255,255,255,0.25)' 
                    : 'rgba(255,255,255,0.1)',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  border: foundWords.has(word) 
                    ? '1px solid rgba(255,255,255,0.4)' 
                    : '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  {foundWords.has(word) ? word : '?????'}
                </div>
              ))}
            </div>
          </div>

          {/* Your Stats */}
          <div style={{
            backgroundColor: '#dfffd6',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '34px',
              color: '#1a1a40'
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
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '20px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Words</div>
                <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>{totalWords}</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '12px', 
                backgroundColor: 'white', 
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '4px' }}>Avg. Time</div>
                <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>0:00</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '12px', 
                backgroundColor: 'white', 
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '4px' }}>Best Streak</div>
                <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>0 days</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '12px', 
                backgroundColor: 'white', 
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '20px', color: '#6b7280', marginBottom: '4px' }}>Total Score</div>
                <div style={{ fontSize: '20px', fontWeight: '200', color: '#1f2937' }}>0</div>
              </div>
            </div>
          </div>

          {/* Daily Progress */}
          <div style={{
            backgroundColor: '#dfffd6',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '16px',
              color: '#1f2937'
            }}>
              <i className="fas fa-chart-line" style={{ fontSize: '20px', color: '#1a1a40' }}></i>
              Daily Progress
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              textAlign: 'left',
              fontStyle: 'italic'
            }}>
              No games played yet. Start playing to see your progress!
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{
            backgroundColor: '#003366',
            color: 'white',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '34px' 
            }}>
              <i className="fas fa-trophy" style={{ fontSize: '26px' }}></i>
              Leaderboard
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { rank: 1, name: 'Lansa', country: 'Angola', points: 766 },
                { rank: '2', name: 'Saheed19', country: 'Nigeria', points: 0 },
                { rank: 3, name: 'Abdulkareem', country: 'Angola', points: 0 }
              ].map((player, index) => (
                <div key={player.rank} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      minWidth: '16px',
                      fontSize: '14px'
                    }}>
                      {player.rank}
                    </span>
                    <span style={{ fontSize: '14px' }}>{player.name}</span>
                    <span style={{ 
                      fontSize: '12px', 
                      opacity: 0.8,
                      color: 'rgba(255,255,255,0.8)'
                    }}>
                      {player.country}
                    </span>
                  </div>
                  <span style={{ 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {player.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popupFade {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          80% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }

        /* Mobile Responsive Styles */
        @media screen and (max-width: 768px) {
          /* Reset main container for mobile */
          body > div:first-child {
            padding: 16px !important;
            min-height: 100vh !important;
          }

          /* Main game area - switch to single column layout */
          body > div:first-child > div:first-child {
            flex-direction: column !important;
            gap: 16px !important;
            height: auto !important;
          }

          /* Left side - game section */
          body > div:first-child > div:first-child > div:first-child {
            flex: none !important;
            order: 1;
          }

          /* Logo section - center on mobile */
          body > div:first-child > div:first-child > div:first-child > div:first-child {
            justify-content: center !important;
            margin-bottom: 8px !important;
          }

          /* Logo image - smaller on mobile */
          body > div:first-child > div:first-child > div:first-child > div:first-child img {
            height: 32px !important;
          }

          /* Theme section - center align */
          body > div:first-child > div:first-child > div:first-child > div:nth-child(2) {
            text-align: center !important;
            margin-bottom: 16px !important;
          }

          /* Theme title */
          body > div:first-child > div:first-child > div:first-child > div:nth-child(2) > div:first-child {
            font-size: 18px !important;
            margin-bottom: 4px !important;
          }

          /* Theme subtitle */
          body > div:first-child > div:first-child > div:first-child > div:nth-child(2) > div:last-child {
            font-size: 14px !important;
          }

          /* Game grid container */
          body > div:first-child > div:first-child > div:first-child > div:nth-child(3) {
            flex: none !important;
            margin-bottom: 20px !important;
          }

          /* Game grid - make it smaller and square for mobile */
          body > div:first-child > div:first-child > div:first-child > div:nth-child(3) > div {
            width: 100% !important;
            max-width: 320px !important;
            height: 320px !important;
            margin: 0 auto !important;
          }

          /* Grid cells - smaller font for mobile */
          body > div:first-child > div:first-child > div:first-child > div:nth-child(3) > div > div {
            font-size: 0.7rem !important;
          }

          /* Right sidebar - reorder and show only specific sections */
          body > div:first-child > div:first-child > div:last-child {
            flex: none !important;
            order: 2;
            width: 100% !important;
          }

          /* Hide desktop-only sections on mobile */
          /* Hide timer/days streak section */
          body > div:first-child > div:first-child > div:last-child > div:first-child {
            display: none !important;
          }

          /* Hide Your Stats section */
          body > div:first-child > div:first-child > div:last-child > div:nth-child(3) {
            display: none !important;
          }

          /* Hide Daily Progress section */
          body > div:first-child > div:first-child > div:last-child > div:nth-child(4) {
            display: none !important;
          }

          /* Hide Leaderboard section */
          body > div:first-child > div:first-child > div:last-child > div:last-child {
            display: none !important;
          }

          /* Found Words section - make it prominent on mobile */
          body > div:first-child > div:first-child > div:last-child > div:nth-child(2) {
            background-color: #1e3a8a !important;
            margin-bottom: 0 !important;
            border-radius: 12px !important;
            padding: 20px !important;
          }

          /* Found Words title */
          body > div:first-child > div:first-child > div:last-child > div:nth-child(2) > div:first-child {
            font-size: 18px !important;
            margin-bottom: 20px !important;
            color: white !important;
          }

          /* Found Words grid - adjust for mobile */
          body > div:first-child > div:first-child > div:last-child > div:nth-child(2) > div:last-child {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            grid-template-rows: repeat(3, 1fr) !important;
            gap: 12px !important;
          }

          /* Individual word slots */
          body > div:first-child > div:first-child > div:last-child > div:nth-child(2) > div:last-child > div {
            padding: 12px 8px !important;
            font-size: 12px !important;
            min-height: 40px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 8px !important;
          }

          /* Add top status bar for mobile */
          body > div:first-child::before {
            content: '';
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          /* Add mobile header content */
          body > div:first-child::after {
            content: '🏆 0/7                    ${formatTime(timer)}(×${multiplier})                    💝 0 days';
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: transparent;
            color: white;
            font-weight: bold;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 1001;
            white-space: nowrap;
          }

          /* Add top margin to compensate for fixed header */
          body > div:first-child {
            margin-top: 70px !important;
          }

          /* Badges section - create floating badge at top right */
          body > div:first-child > div:first-child::before {
            content: 'Next badge: 🥉 Bronze Explorer - 50 words remaining';
            display: block;
            position: fixed;
            top: 70px;
            left: 16px;
            right: 16px;
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            z-index: 999;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            margin-bottom: 16px;
          }

          /* Adjust main content to account for badge */
          body > div:first-child > div:first-child {
            margin-top: 60px !important;
          }

          /* Popup word animation - adjust for mobile */
          body > div:first-child > div:first-child {
            position: relative;
          }

          /* Make popup smaller on mobile */
          body > div:first-child > div[style*="position: fixed"] {
            padding: 15px 25px !important;
            font-size: 20px !important;
            border-radius: 8px !important;
          }
        }

        /* Extra small screens */
        @media screen and (max-width: 480px) {
          /* Make grid even smaller on very small screens */
          body > div:first-child > div:first-child > div:first-child > div:nth-child(3) > div {
            max-width: 280px !important;
            height: 280px !important;
          }

          /* Smaller grid cells */
          body > div:first-child > div:first-child > div:first-child > div:nth-child(3) > div > div {
            font-size: 0.6rem !important;
          }

          /* Adjust found words grid for smaller screens */
          body > div:first-child > div:first-child > div:last-child > div:nth-child(2) > div:last-child {
            gap: 8px !important;
          }

          body > div:first-child > div:first-child > div:last-child > div:nth-child(2) > div:last-child > div {
            padding: 10px 6px !important;
            font-size: 11px !important;
            min-height: 36px !important;
          }

          /* Smaller header text */
          body > div:first-child::after {
            font-size: 12px !important;
            padding: 0 16px !important;
          }

          /* Smaller badge */
          body > div:first-child > div:first-child::before {
            font-size: 11px !important;
            padding: 10px 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Game;