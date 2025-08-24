import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getBlockByNumber,
  getLatestTransactions,
  timeAgo,
  search,
} from "../../utils/api";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaCube,
  FaExclamationTriangle,
  FaGasPump,
  FaHashtag,
  FaLink,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaUser,
} from "react-icons/fa";
import SearchInput from "../../components/search-input";

export default function Block() {
  const router = useRouter();
  const { id } = router.query;
  const [block, setBlock] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchBlockData = async () => {
        try {
          const [blockRes, transactionsRes] = await Promise.all([
            getBlockByNumber(id),
            getLatestTransactions(1, 10), // In a real app, you'd fetch transactions for this specific block
          ]);

          setBlock(blockRes.data);
          // Filter transactions for this block
          const blockTransactions = transactionsRes.data.transactions.filter(
            (tx) => tx.blockNumber === parseInt(id)
          );
          setTransactions(blockTransactions);
        } catch (error) {
          console.error("Error fetching block data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchBlockData();
    }
  }, [id]);

  if (loading) {
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
            <h1 className="page-title">Block Details</h1>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaSyncAlt className="load-icon-spin" />
          </div>
          <div className="detail-content">
            <div className="detail-label">Loading block data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!block) {
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
            <h1 className="page-title">Block Details</h1>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaExclamationTriangle />
          </div>
          <div className="detail-content">
            <div className="detail-label">Block not found</div>
          </div>
        </div>
      </div>
    );
  }

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
        <Link href="/blocks" className="back-button">
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="page-title">Block Details</h1>
          <div className="hash-display">#{block.number?.toLocaleString()}</div>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaHashtag />
            </div>
            <div className="detail-content">
              <div className="detail-label">Block Height</div>
              <div className="detail-value">
                {block.number?.toLocaleString()}
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
                {new Date(block.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaUser />
            </div>
            <div className="detail-content">
              <div className="detail-label">Miner</div>
              <div className="detail-value">
                <Link href={`/address/${block.miner}`}>{block.miner}</Link>
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaGasPump />
            </div>
            <div className="detail-content">
              <div className="detail-label">Gas Used</div>
              <div className="detail-value">
                {block.gasUsed?.toLocaleString() || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaCube />
            </div>
            <div className="detail-content">
              <div className="detail-label">Gas Limit</div>
              <div className="detail-value">
                {block.gasLimit?.toLocaleString() || "N/A"}
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaLink />
            </div>
            <div className="detail-content">
              <div className="detail-label">Parent Hash</div>
              <div className="detail-row">
                <div className="detail-value">
                  <Link href={`/block/${block.number - 1}`}>
                    {block.hash?.substring(0, 10)}...
                    {block.hash?.substring(block.hash.length - 10)}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaShieldAlt />
            </div>
            <div className="detail-content">
              <div className="detail-label">Nonce</div>
              <div className="detail-value">0x1234567890abcdef</div>
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
          <div className="table-title">Transactions</div>
        </div>

        <div className="table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Txn Hash</th>
                <th>Method</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.hash}>
                  <td>
                    <div className="hash-row">
                      <Link href={`/tx/${tx.hash}`} className="hash-text">
                        {tx.hash.substring(0, 6)}...
                        {tx.hash.substring(tx.hash.length - 4)}
                      </Link>
                    </div>
                  </td>
                  <td>
                    <div className="method-badge method-transfer">Transfer</div>
                  </td>
                  <td>
                    <div className="hash-row">
                      <Link href={`/address/${tx.from}`} className="hash-text">
                        {tx.from.substring(0, 6)}...
                        {tx.from.substring(tx.from.length - 4)}
                      </Link>
                    </div>
                  </td>
                  <td>
                    {tx.to ? (
                      <div className="hash-row">
                        <Link href={`/address/${tx.to}`} className="hash-text">
                          {tx.to.substring(0, 6)}...
                          {tx.to.substring(tx.to.length - 4)}
                        </Link>
                      </div>
                    ) : (
                      <div className="hash-text">Contract Creation</div>
                    )}
                  </td>
                  <td>
                    <div className="amount-value amount-in">+{tx.value}</div>
                  </td>
                  <td>
                    <div className="status-badge status-success">Success</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
