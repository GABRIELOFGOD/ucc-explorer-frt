import { useState } from "react";
import { search, verifyContract } from "../utils/api";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaSearch,
} from "react-icons/fa";
import { useRouter } from "next/router";
import SearchInput from "../components/search-input";

export default function VerifyContract() {
  const [formData, setFormData] = useState({
    address: "",
    sourceCode: "",
    compilerVersion: "0.8.0",
    optimization: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const router = useRouter();

  const sendSearchQuery = async (query) => {
    setLoadingSearch(true);
    try {
      const response = await search(query);
      const data = response.data;

      if (data.type === "address") {
        router.push(`/address/${data.data.address}`);
      }
      if (data.type === "transaction") {
        router.push(`/tx/${data.data.hash}`);
      }
      if (data.type === "block") {
        router.push(`/block/${data.data.number}`);
      }
      if (data.type === "not_found") {
        toast.error("No results found for your search query.");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await verifyContract(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to verify contract");
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
          <h1 className="page-title">Verify Contract</h1>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Contract Verification</div>
        </div>

        <form onSubmit={handleSubmit} className="verification-form">
          <div className="form-group">
            <label htmlFor="address">Contract Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="0x..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="compilerVersion">Compiler Version</label>
            <select
              id="compilerVersion"
              name="compilerVersion"
              value={formData.compilerVersion}
              onChange={handleChange}
              required
            >
              <option value="0.8.24">0.8.24</option>
              <option value="0.8.23">0.8.23</option>
              <option value="0.8.22">0.8.22</option>
              <option value="0.8.21">0.8.21</option>
              <option value="0.8.20">0.8.20</option>
              <option value="0.8.19">0.8.19</option>
              <option value="0.8.18">0.8.18</option>
              <option value="0.8.17">0.8.17</option>
              <option value="0.8.16">0.8.16</option>
              <option value="0.8.15">0.8.15</option>
              <option value="0.8.14">0.8.14</option>
              <option value="0.8.13">0.8.13</option>
              <option value="0.8.12">0.8.12</option>
              <option value="0.8.11">0.8.11</option>
              <option value="0.8.10">0.8.10</option>
              <option value="0.8.9">0.8.9</option>
              <option value="0.8.8">0.8.8</option>
              <option value="0.8.7">0.8.7</option>
              <option value="0.8.6">0.8.6</option>
              <option value="0.8.5">0.8.5</option>
              <option value="0.8.4">0.8.4</option>
              <option value="0.8.3">0.8.3</option>
              <option value="0.8.2">0.8.2</option>
              <option value="0.8.1">0.8.1</option>
              <option value="0.8.0">0.8.0</option>
              <option value="0.7.6">0.7.6</option>
              <option value="0.7.5">0.7.5</option>
              <option value="0.7.4">0.7.4</option>
              <option value="0.7.3">0.7.3</option>
              <option value="0.7.2">0.7.2</option>
              <option value="0.7.1">0.7.1</option>
              <option value="0.7.0">0.7.0</option>
              <option value="0.6.12">0.6.12</option>
              <option value="0.6.11">0.6.11</option>
              <option value="0.6.10">0.6.10</option>
              <option value="0.6.9">0.6.9</option>
              <option value="0.6.8">0.6.8</option>
              <option value="0.6.7">0.6.7</option>
              <option value="0.6.6">0.6.6</option>
              <option value="0.6.5">0.6.5</option>
              <option value="0.6.4">0.6.4</option>
              <option value="0.6.3">0.6.3</option>
              <option value="0.6.2">0.6.2</option>
              <option value="0.6.1">0.6.1</option>
              <option value="0.6.0">0.6.0</option>
              <option value="0.5.17">0.5.17</option>
              <option value="0.5.16">0.5.16</option>
              <option value="0.5.15">0.5.15</option>
              <option value="0.5.14">0.5.14</option>
              <option value="0.5.13">0.5.13</option>
              <option value="0.5.12">0.5.12</option>
              <option value="0.5.11">0.5.11</option>
              <option value="0.5.10">0.5.10</option>
              <option value="0.5.9">0.5.9</option>
              <option value="0.5.8">0.5.8</option>
              <option value="0.5.7">0.5.7</option>
              <option value="0.5.6">0.5.6</option>
              <option value="0.5.5">0.5.5</option>
              <option value="0.5.4">0.5.4</option>
              <option value="0.5.3">0.5.3</option>
              <option value="0.5.2">0.5.2</option>
              <option value="0.5.1">0.5.1</option>
              <option value="0.5.0">0.5.0</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="optimization">
              <input
                type="checkbox"
                id="optimization"
                name="optimization"
                checked={formData.optimization}
                onChange={handleChange}
              />
              Optimization Enabled
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="sourceCode">Source Code</label>
            <textarea
              id="sourceCode"
              name="sourceCode"
              value={formData.sourceCode}
              onChange={handleChange}
              placeholder="Paste your contract source code here..."
              rows={10}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Verifying..." : "Verify Contract"}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <FaExclamationCircle /> {error}
          </div>
        )}

        {result && (
          <div className="success-message">
            <FaCheckCircle /> {result.message}
          </div>
        )}
      </div>

      <style jsx>{`
        .verification-form {
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

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--gray-600);
          background: var(--dark-glass);
          color: white;
          font-family: "JetBrains Mono", monospace;
        }

        .form-group input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
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

        .success-message {
          padding: 12px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--green);
          color: var(--green);
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
