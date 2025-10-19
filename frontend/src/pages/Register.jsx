import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiHash, FiUsers, FiEye, FiEyeOff } from 'react-icons/fi';
import '../styles/auth.css';
import { signup, signin } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = name === 'age' ? parseInt(value, 10) || '' : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation front
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Invalid email address.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.name, formData.age, formData.gender);
      const userData = await signin(formData.email, formData.password);
      setUser(userData.user);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      console.error('Signup error:', err);
      const backendError = err.response?.data?.error;
      if (backendError === "email_already_exists") setError("An account with this email already exists.");
      else setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Your Account</h2>
        <p className="subtitle">Join us to discover more.</p>

        <div className="form-row">
          <div className="form-group">
            <FiUser className="input-icon" />
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <FiMail className="input-icon" />
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <FiHash className="input-icon" />
            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <FiUsers className="input-icon" />
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="" disabled>Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group password-group">
          <FiLock className="input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        <div className="form-group password-group">
          <FiLock className="input-icon" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle-icon">
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Account created successfully!</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
