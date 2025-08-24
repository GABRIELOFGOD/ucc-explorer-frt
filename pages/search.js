import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { search, timeAgo } from "../utils/api";
import Link from "next/link";
import {
  FaCube,
  FaExchangeAlt,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaQuestionCircle,
  FaSearch,
  FaSyncAlt,
  FaWallet,
} from "react-icons/fa";

export default function Search() {
  const router = useRouter();
  const { q } = router.query;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
  }, [q]);

  const performSearch = async (query) => {
    if (!query) return;

    setLoading(true);
    try {
      const response = await search(query);
      setResults(response.data);
    } catch (error) {
      console.error("Error performing search:", error);
      setResults({ type: "error", data: null });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="main-content">
      <div className="top-nav">
        <div className="search-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <form onSubmit={handleSearch} style={{ width: "100%" }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search by Address / Txn Hash / Block"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
        <div className="network-indicator">
          <div className="status-dot"></div>
          <div className="network-name">Testnet</div>
        </div>
      </div>

      <div className="page-header">
        <h1 className="page-title">Search Results</h1>
      </div>

      {loading ? (
        <div className="table-container">
          <div className="detail-item">
            <div className="detail-icon">
              <FaSyncAlt className="load-icon-spin" />
            </div>
            <div className="detail-content">
              <div className="detail-label">Searching...</div>
            </div>
          </div>
        </div>
      ) : results ? (
        <div className="table-container">
          {results.type === "block" && (
            <div>
              <div className="table-header">
                <div className="table-title">Block Found</div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <FaCube />
                </div>
                <div className="detail-content">
                  <div className="detail-label">
                    Block #{results.data.number?.toLocaleString()}
                  </div>
                  <div className="detail-value">
                    <Link href={`/block/${results.data.number}`}>
                      View Block Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {results.type === "transaction" && (
            <div>
              <div className="table-header">
                <div className="table-title">Transaction Found</div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <FaExchangeAlt />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Transaction Hash</div>
                  <div className="detail-value">
                    <Link href={`/tx/${results.data.hash}`}>
                      {results.data.hash}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {results.type === "address" && (
            <div>
              <div className="table-header">
                <div className="table-title">Address Found</div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <FaWallet />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Address</div>
                  <div className="detail-value">
                    <Link href={`/address/${results.data.address}`}>
                      {results.data.address}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {results.type === "not_found" && (
            <div>
              <div className="table-header">
                <div className="table-title">No Results Found</div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <FaExclamationTriangle />
                </div>
                <div className="detail-content">
                  <div className="detail-label">
                    No matches found for "{searchQuery}"
                  </div>
                  <div className="detail-value">
                    Try searching for a block number, transaction hash, or
                    address
                  </div>
                </div>
              </div>
            </div>
          )}

          {results.type === "error" && (
            <div>
              <div className="table-header">
                <div className="table-title">Search Error</div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <FaExclamationCircle />
                </div>
                <div className="detail-content">
                  <div className="detail-label">
                    An error occurred during search
                  </div>
                  <div className="detail-value">Please try again later</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Search Tips</div>
          </div>
          <div className="detail-item">
            <div className="detail-icon">
              <FaInfoCircle />
            </div>
            <div className="detail-content">
              <div className="detail-label">Search the Universe Chain</div>
              <div className="detail-value">
                Enter a block number, transaction hash, or address to search
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="details-grid">
        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaSearch />
            </div>
            <div className="detail-content">
              <div className="detail-label">Search Examples</div>
              <div className="detail-value">
                <ul>
                  <li>Block number: 1234567</li>
                  <li>Transaction hash: 0x1234...5678</li>
                  <li>Address: 0xabcd...ef12</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaQuestionCircle />
            </div>
            <div className="detail-content">
              <div className="detail-label">Need Help?</div>
              <div className="detail-value">
                <p>
                  If you're having trouble finding what you're looking for, try:
                </p>
                <ul>
                  <li>Checking your search term for typos</li>
                  <li>Using a different search term</li>
                  <li>Browsing the latest blocks and transactions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
