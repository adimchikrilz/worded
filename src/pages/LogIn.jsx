import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';

const LogIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, signInWithGoogle, error, setError } = useAuth();

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogIn = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      setError("");
      setLoading(true);
      
      await login(username, password);
      
      if (rememberMe) {
        localStorage.setItem("username", username);
      } else {
        localStorage.removeItem("username");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.code === "auth/invalid-credential" 
          ? "Invalid email or password" 
          : "Failed to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <img src={process.env.PUBLIC_URL + '/worded-logo.png'} alt="Worded Logo" className="logo" />
      <div className="main-container">
        <div className="auth-card">
          <div className="nav-container">
            <Link to="/">
              <button className="back-button">←</button>
            </Link>
          </div>
          <h2>Log In</h2>
          <form onSubmit={handleLogIn}>
            <InputField
              label="Email"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Email"
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
              placeholder="Password"
            />
            {error && <p className="error-text">{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', width: '50%', margin: '0 auto 16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: '#1F2A44' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  style={{ marginRight: '8px' }}
                />
                Remember me
              </label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="submit" disabled={loading} style={{ width: '30%' }}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
          <p style={{ textAlign: 'center', color: '#1F2A44', marginBottom: '16px' }}>Or</p>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50%', margin: '0 auto 16px' }}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Sign in with Google
          </button>
          <p style={{ textAlign: 'center', color: '#1F2A44' }}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn;