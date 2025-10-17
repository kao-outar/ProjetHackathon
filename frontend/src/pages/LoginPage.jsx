import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signin } from "../api/auth";
import "../styles/auth.css"; 
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login, isAuthenticated } = useAuth(); // Utiliser login et isAuthenticated

  // 🔒 Redirection automatique si déjà connecté
  useEffect(() => {
    if (isAuthenticated) navigate("/feed"); // Utiliser isAuthenticated
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.includes("@")) {
      setError("Invalid email");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password is too short");
      setLoading(false);
      return;
    }

    try {
      const data = await signin(email, password);
      console.log("✅ Réponse du backend :", data);
      login(data); // Utiliser la fonction login du contexte
      navigate("/feed");
    } catch (err) {
        console.log("Erreur API:", err.response?.data); // 👈 utile pour déboguer
        setError(err.response?.data?.error || "Erreur de connexion");
    } finally {
        setLoading(false);
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        <p className="subtitle">Access your account</p>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group password-group">
          <label htmlFor="password">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <span onClick={togglePasswordVisibility} className="password-toggle-icon">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-link">
          Don't have an account yet? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
}
