import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signin } from "../api/auth";
import "../styles/auth.css"; 
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // 🔒 Redirige si déjà connecté
  useEffect(() => {
    if (isAuthenticated) navigate("/feed");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ✅ Validation locale
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const data = await signin(email, password);
      console.log("✅ Backend response:", data);
      login(data); // Stocke user + token dans le contexte
      navigate("/feed");
    } catch (err) {
      console.error("❌ Login error:", err.response?.data);
      const backendError = err.response?.data?.error;
      if (backendError === "invalid_credentials") {
        setError("Invalid email or password.");
      } else {
        setError("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        <p className="subtitle">Access your account</p>

        <div className="form-group">
          <FiMail className="input-icon" />
          <input
            type="email"
            id="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group password-group">
          <FiLock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-icon"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-link">
          Don’t have an account yet? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
