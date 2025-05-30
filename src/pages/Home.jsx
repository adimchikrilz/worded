import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayNow = () => {
    navigate('/game');
  };

  return (
    <div className="home-page">
      {/* Back button in top left */}
      <Link to="/login" className="back-button">
        ←
      </Link>

      {/* Main content centered */}
      <div className="home-content">
        {/* Worded Logo */}
        <div className="logo-container">
          <img 
            src={process.env.PUBLIC_URL + '/worded-logo.png'} 
            alt="Worded Logo" 
            className="worded-logo-img"
          />
        </div>

        {/* Play Game Button */}
        <button
          onClick={handlePlayNow}
          className="play-game-button"
        >
          Play Game
        </button>

        {/* Logout Button - smaller and below play button */}
        {currentUser && (
          <button
            onClick={handleLogout}
            disabled={loading}
            className="logout-button-small"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        )}
      </div>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background-image: url('/logoed.png');
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .back-button {
          position: absolute;
          top: 30px;
          left: 30px;
          background: #f0f0f0;
          border: none;
          font-size: 24px;
          color: #666;
          cursor: pointer;
          padding: 10px;
          border-radius: 50%;
          transition: all 0.2s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
        }

        .back-button:hover {
          background-color: rgba(0, 0, 0, 0.1);
          color: #333;
        }

        .home-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          text-align: center;
        }

        .logo-container {
          margin-bottom: 20px;
        }

        .worded-logo-img {
          max-width: 300px;
          height: auto;
          display: block;
        }

        .play-game-button {
          background: linear-gradient(135deg, #1a1a40 0%, #4343a6 100%);
          color: #ffd700;
          border: none;
          padding: 12px 24px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          text-transform: none;
          width: 20%;
          min-width: 170px;
          max-width: 170px;
        }

        .play-game-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }

        .play-game-button:active {
          transform: translateY(0);
        }

        .logout-button-small {
          background: none;
          border: 1px solid #ccc;
          color: #666;
          padding: 6px 12px;
          font-size: 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
          width: 15%;
          min-width: 80px;
          max-width: 120px;
        }

        .logout-button-small:hover {
          background-color: #f5f5f5;
          border-color: #999;
          color: #333;
        }

        .logout-button-small:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .worded-logo-img {
            max-width: 250px;
          }
          
          .back-button {
            top: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
          
          .play-game-button {
            width: 30%;
            min-width: 100px;
            padding: 10px 20px;
            font-size: 0.9rem;
          }

          .logout-button-small {
            width: 25%;
            min-width: 70px;
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .worded-logo-img {
            max-width: 200px;
          }
          
          .home-content {
            gap: 25px;
          }

          .play-game-button {
            width: 40%;
            min-width: 90px;
          }

          .logout-button-small {
            width: 30%;
            min-width: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;