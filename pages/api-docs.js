import { useState, useEffect } from "react";
import { getApiDocs, search } from "../utils/api";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCode,
  FaFileCode,
  FaInfoCircle,
  FaKey,
  FaSearch,
  FaServer,
  FaTachometerAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { useRouter } from "next/router";

export default function ApiDocs() {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await getApiDocs();
        setDocs(response.data);
      } catch (error) {
        console.error("Error fetching API docs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

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

  if (loading) {
    return (
      <div className="main-content">
        <div className="top-nav">
          <div className="search-container">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder={
                  loadingSearch
                    ? "Searching..."
                    : "Search by Address / Txn Hash / Block"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendSearchQuery(e.target.value);
                    // window.location.href = `/search?q=${encodeURIComponent(e.target.value)}`;
                  }
                }}
                disabled={loadingSearch}
              />
            </div>
          </div>
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
            <h1 className="page-title">API Documentation</h1>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaSyncAlt />
          </div>
          <div className="detail-content">
            <div className="detail-label">Loading API documentation...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="top-nav">
        <div className="search-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={
                loadingSearch
                  ? "Searching..."
                  : "Search by Address / Txn Hash / Block"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendSearchQuery(e.target.value);
                  // window.location.href = `/search?q=${encodeURIComponent(e.target.value)}`;
                }
              }}
              disabled={loadingSearch}
            />
          </div>
        </div>
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
          <h1 className="page-title">API Documentation</h1>
          <div className="page-subtitle">
            {docs?.name} v{docs?.version}
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaInfoCircle />
            </div>
            <div className="detail-content">
              <div className="detail-label">Description</div>
              <div className="detail-value">{docs?.description}</div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaServer />
            </div>
            <div className="detail-content">
              <div className="detail-label">Base URL</div>
              <div className="detail-value">http://localhost:3001/api</div>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaTachometerAlt />
            </div>
            <div className="detail-content">
              <div className="detail-label">Rate Limiting</div>
              <div className="detail-value">
                <p>{docs?.authentication}</p>
                <ul>
                  <li>Free Tier: {docs?.rate_limiting?.free_tier}</li>
                  <li>Authenticated Tier: {docs?.rate_limiting?.authenticated_tier}</li>
                  <li>Basic Tier: {docs?.rate_limiting?.basic_tier}</li>
                  <li>Premium Tier: {docs?.rate_limiting?.premium_tier}</li>
                </ul>
                <p>
                  Register for an account to get higher rate limits.
                  Authenticated users get 1000 requests per minute automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">API Endpoints</div>
        </div>

        <div className="table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Description</th>
                <th>Rate Limit</th>
              </tr>
            </thead>
            <tbody>
              {docs?.endpoints?.map((endpoint, index) => (
                <tr
                  key={index}
                  className="endpoint-row"
                  onClick={() =>
                    setSelectedEndpoint(
                      selectedEndpoint === index ? null : index
                    )
                  }
                >
                  <td>
                    <span
                      className={`method-badge method-${endpoint.method.toLowerCase()}`}
                    >
                      {endpoint.method}
                    </span>
                  </td>
                  <td>
                    <code className="endpoint-path">{endpoint.path}</code>
                  </td>
                  <td>{endpoint.description}</td>
                  <td>{endpoint.rate_limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEndpoint !== null && (
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Endpoint Details</div>
          </div>

          <div className="endpoint-details">
            <div className="detail-item">
              <div className="detail-icon">
                <FaCode />
              </div>
              <div className="detail-content">
                <div className="detail-label">Request</div>
                <div className="detail-value">
                  <pre className="code-block">
                    {`curl -X ${docs?.endpoints[selectedEndpoint]?.method} \\
  http://localhost:3001${docs?.endpoints[selectedEndpoint]?.path} \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaFileCode />
              </div>
              <div className="detail-content">
                <div className="detail-label">Response</div>
                <div className="detail-value">
                  <pre className="code-block">
                    {`{
  // Response data will be here
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Authentication</div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaKey />
          </div>
          <div className="detail-content">
            <div className="detail-label">API Key</div>
            <div className="detail-value">
              <p>
                To access higher rate limits, include an API key in your
                requests:
              </p>
              <pre className="code-block">-H "X-API-Key: YOUR_API_KEY"</pre>
              <p>Rate limits by tier:</p>
              <ul>
                <li>
                  <strong>Free Tier</strong>: 100 requests per minute
                </li>
                <li>
                  <strong>Basic Tier</strong>: 1,000 requests per minute
                </li>
                <li>
                  <strong>Premium Tier</strong>: 10,000 requests per minute
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-subtitle {
          font-size: 16px;
          color: var(--gray-400);
          margin-top: 8px;
        }

        .endpoint-row {
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .endpoint-row:hover {
          background: var(--light-glass);
        }

        .method-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .method-get {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .method-post {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .endpoint-path {
          font-family: "JetBrains Mono", monospace;
          font-size: 14px;
        }

        .endpoint-details {
          padding: 20px;
        }

        .code-block {
          background: var(--dark-glass);
          border-radius: 8px;
          padding: 16px;
          font-family: "JetBrains Mono", monospace;
          font-size: 14px;
          overflow-x: auto;
          margin: 10px 0;
        }

        ul {
          padding-left: 20px;
          margin: 10px 0;
        }

        li {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
}
