import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaArrowLeft, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { login } from "../utils/api";
import SearchInput from "../components/search-input";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(formData);
      // Store token in localStorage
      localStorage.setItem("token", response.data.token);
      // Redirect to home page
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="top-nav">
        <SearchInput />
        <div className="network-indicator">
          <div className="status-dot"></div>
          <div className="network-name">Testnet</div>
        </div>
      </div>

      <div className="page-header">
        <Link href="/" className="back-button">
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="page-title">Login</h1>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Login to Your Account</div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          
          <div className="form-footer">
            <p>Don't have an account? <Link href="/register">Register</Link></p>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <FaExclamationCircle /> {error}
          </div>
        )}
      </div>

      <style jsx>{`
        .login-form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--gray-600);
          background: var(--dark-glass);
          color: white;
          font-family: "JetBrains Mono", monospace;
        }

        .submit-button {
          background: linear-gradient(
            135deg,
            var(--electric-blue),
            var(--cyber-cyan)
          );
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          padding: 12px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--red);
          color: var(--red);
          margin-top: 20px;
        }

        .form-footer {
          text-align: center;
          margin-top: 20px;
        }

        .form-footer a {
          color: var(--electric-blue);
          text-decoration: none;
        }

        .form-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}