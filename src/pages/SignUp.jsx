import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signup, signInWithGoogle, error, setError } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };
  
  const validatePassword = (password) => {
    return password.length >= 6; // Firebase requires at least 6 characters
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!username || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!validateEmail(username)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      await signup(username, password);
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already in use. Try logging in instead.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Use at least 6 characters.");
          break;
        default:
          setError("Failed to create an account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
      // Google sign-in automatically logs the user in, so we navigate to home
    } catch (err) {
      console.error("Google signup error:", err);
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
          <h2>Sign Up</h2>
          <form onSubmit={handleSignUp}>
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
            <InputField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
              placeholder="Confirm Password"
            />
            {error && <p className="error-text">{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="submit" disabled={loading} style={{ width: '30%' }}>
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </div>
          </form>
          <p style={{ textAlign: 'center', color: '#1F2A44', marginBottom: '16px' }}>Or</p>
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50%', margin: '0 auto 16px' }}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Sign up with Google
          </button>
          <p style={{ textAlign: 'center', color: '#1F2A44' }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;