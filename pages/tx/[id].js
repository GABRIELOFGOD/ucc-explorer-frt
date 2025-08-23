import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getTransactionByHash, search, timeAgo } from "../../utils/api";
import Link from "next/link";
import {
  FaArrowDown,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaCoins,
  FaCopy,
  FaCube,
  FaExclamationTriangle,
  FaGasPump,
  FaHashtag,
  FaSearch,
  FaSyncAlt,
  FaUser,
  FaReceipt,
} from "react-icons/fa";

export default function Transaction() {
  const router = useRouter();
  const { id } = router.query;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

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

  useEffect(() => {
    if (id) {
      const fetchTransactionData = async () => {
        try {
          const response = await getTransactionByHash(id);
          setTransaction(response.data);
        } catch (error) {
          console.error("Error fetching transaction data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchTransactionData();
    }
  }, [id]);

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
            <h1 className="page-title">Transaction Details</h1>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaSyncAlt />
          </div>
          <div className="detail-content">
            <div className="detail-label">Loading transaction data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
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
            <h1 className="page-title">Transaction Details</h1>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaExclamationTriangle />
          </div>
          <div className="detail-content">
            <div className="detail-label">Transaction not found</div>
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
        <Link href="/transactions" className="back-button">
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="page-title">Transaction Details</h1>
          <div className="hash-display">{transaction.hash}</div>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaHashtag />
            </div>
            <div className="detail-content">
              <div className="detail-label">Transaction Hash</div>
              <div className="detail-row">
                <div className="detail-value">{transaction.hash}</div>
                <button className="copy-button">
                  <FaCopy />
                </button>
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaCube />
            </div>
            <div className="detail-content">
              <div className="detail-label">Block</div>
              <div className="detail-value">
                <Link href={`/block/${transaction.blockNumber}`}>
                  #{transaction.blockNumber?.toLocaleString()}
                </Link>
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaClock />
            </div>
            <div className="detail-content">
              <div className="detail-label">Timestamp</div>
              <div className="detail-value">
                {new Date(transaction.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaUser />
            </div>
            <div className="detail-content">
              <div className="detail-label">From</div>
              <div className="detail-value">
                <Link href={`/address/${transaction.from}`}>
                  {transaction.from}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaArrowDown />
            </div>
            <div className="detail-content">
              <div className="detail-label">To</div>
              <div className="detail-value">
                {transaction.to ? (
                  <Link href={`/address/${transaction.to}`}>
                    {transaction.to}
                  </Link>
                ) : (
                  <div className="hash-text">Contract Creation</div>
                )}
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaCoins />
            </div>
            <div className="detail-content">
              <div className="detail-label">Value</div>
              <div className="amount-value amount-out">{transaction.value}</div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaGasPump />
            </div>
            <div className="detail-content">
              <div className="detail-label">Gas Limit</div>
              <div className="detail-value">
                {transaction.gasUsed?.toLocaleString() || "N/A"}
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaCheckCircle />
            </div>
            <div className="detail-content">
              <div className="detail-label">Status</div>
              <div className="status-badge status-success">Success</div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Event Logs</div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaReceipt />
          </div>
          <div className="detail-content">
            <div className="detail-label">
              No event logs found for this transaction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
