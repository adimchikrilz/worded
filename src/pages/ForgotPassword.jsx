import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword, error, setError } = useAuth();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setMessage("");
      setError("");
      setLoading(true);
      
      await resetPassword(email);
      
      setMessage("Check your email for password reset instructions");
    } catch (err) {
      console.error("Password reset error:", err);
      
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        default:
          setError("Failed to send reset email. Please try again.");
      }
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
            <Link to="/login">
              <button className="back-button">←</button>
            </Link>
          </div>
          <h2>Forgot Password</h2>
          <form onSubmit={handleResetPassword}>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="submit" disabled={loading} style={{ width: '50%' }}>
                {loading ? "Sending..." : "Reset Password"}
              </button>
            </div>
          </form>
          <p style={{ textAlign: 'center', color: '#1F2A44', marginTop: '16px' }}>
            Remember your password? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;