import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiHash, FiUsers, FiEye, FiEyeOff } from 'react-icons/fi';
import '../styles/auth.css';
import { signup } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: 0,
    gender: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'age') {
      const parsed = parseInt(value, 10);
      finalValue = isNaN(parsed) ? '' : parsed;
    }
    setFormData({
      ...formData,
      [name]: finalValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setSuccess(false);
    try {
      await signup(formData.email, formData.password, formData.name, formData.age, formData.gender);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Your Account</h2>
        <p className="subtitle">Join us to discover more.</p>

        <div className="form-row">
          <div className="form-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <FiHash className="input-icon" />
                <input
                    type="number"
                    id="age"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <FiUsers className="input-icon" />
                <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                >
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
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <span onClick={togglePasswordVisibility} className="password-toggle-icon">
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
        </div>
        
        <div className="form-group password-group">
            <FiLock className="input-icon" />
            <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
            />
             <span onClick={togglePasswordVisibility} className="password-toggle-icon">
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Account created successfully!</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <p className="auth-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
