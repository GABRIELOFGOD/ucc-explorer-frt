import { useState, useEffect } from "react";
import {
  getNetworkInfo,
  getLatestBlocks,
  getLatestTransactions,
  initWebSocket,
  closeWebSocket,
  search,
  timeAgo,
} from "../utils/api";
import Link from "next/link";
import {
  FaCoins,
  FaCube,
  FaGasPump,
  FaHashtag,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { toast } from "sonner";

export default function Home() {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [latestTransactions, setLatestTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [networkRes, blocksRes, transactionsRes] = await Promise.all([
          getNetworkInfo(),
          getLatestBlocks(1, 5),
          getLatestTransactions(1, 5),
        ]);

        setNetworkInfo(networkRes.data);
        setLatestBlocks(blocksRes.data.blocks);
        setLatestTransactions(transactionsRes.data.transactions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Initialize WebSocket for real-time updates
    const socket = initWebSocket((data) => {
      setNetworkInfo((prev) => ({
        ...prev,
        blockHeight: data.latestBlock.number,
      }));
      setLatestBlocks((prev) => {
        const newBlocks = [data.latestBlock, ...prev.slice(0, 4)];
        return newBlocks;
      });
      setLatestTransactions((prev) => {
        const newTransactions = [
          ...data.latestTransactions,
          ...prev.slice(0, 5 - data.latestTransactions.length),
        ];
        return newTransactions;
      });
    });

    // Cleanup WebSocket on component unmount
    return () => {
      closeWebSocket();
    };
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
        <h1 className="page-title">Universe Chain Explorer</h1>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaCube />
            </div>
            <div className="detail-content">
              <div className="detail-label">Block Height</div>
              <div className="detail-value">
                {loading
                  ? "Loading..."
                  : networkInfo?.blockHeight?.toLocaleString() || "N/A"}
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaGasPump />
            </div>
            <div className="detail-content">
              <div className="detail-label">Gas Price</div>
              <div className="detail-value">
                {loading ? "Loading..." : networkInfo?.gasPrice || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaCoins />
            </div>
            <div className="detail-content">
              <div className="detail-label">Total Supply</div>
              <div className="detail-value">
                {loading ? "Loading..." : networkInfo?.totalSupply || "N/A"}
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaHashtag />
            </div>
            <div className="detail-content">
              <div className="detail-label">Chain ID</div>
              <div className="detail-value">
                {loading ? "Loading..." : networkInfo?.chainId || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Latest Transactions</div>
          <Link href="/transactions" className="view-all-link">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="detail-item">
            <div className="detail-icon">
              <FaSyncAlt />
            </div>
            <div className="detail-content">
              <div className="detail-label">Loading transactions...</div>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Txn Hash</th>
                  <th>Block</th>
                  <th>Age</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {latestTransactions.map((tx) => (
                  <tr key={tx.hash}>
                    <td>
                      <div className="hash-row">
                        <Link href={`/tx/${tx.hash}`} className="hash-text">
                          {tx.hash?.substring(0, 6)}...
                          {tx.hash?.substring(tx.hash.length - 4)}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/block/${tx.blockNumber}`}
                        className="hash-text"
                      >
                        #{tx.blockNumber?.toLocaleString()}
                      </Link>
                    </td>
                    {/* <td>
                      {Math.floor(
                        (Date.now() - new Date(tx.timestamp).getTime()) / 1000
                      )}{" "}
                      seconds ago
                    </td> */}
                    <td>
                      {timeAgo(tx.timestamp)}
                    </td>
                    <td>
                      <div className="hash-row">
                        <Link
                          href={`/address/${tx.from}`}
                          className="hash-text"
                        >
                          {tx.from?.substring(0, 6)}...
                          {tx.from?.substring(tx.from.length - 4)}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div className="hash-row">
                        <Link href={`/address/${tx.to}`} className="hash-text">
                          {tx.to?.substring(0, 6)}...
                          {tx.to?.substring(tx.to.length - 4)}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div className="amount-value">{tx.value}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Latest Blocks</div>
          <Link href="/blocks" className="view-all-link">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="detail-item">
            <div className="detail-icon">
              <FaSyncAlt />
            </div>
            <div className="detail-content">
              <div className="detail-label">Loading blocks...</div>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Age</th>
                  <th>Transactions</th>
                  <th>Gas Used</th>
                  <th>Gas Limit</th>
                </tr>
              </thead>
              <tbody>
                {latestBlocks.map((block) => (
                  <tr key={block.number}>
                    <td>
                      <div className="hash-row">
                        <Link
                          href={`/block/${block.number}`}
                          className="hash-text"
                        >
                          #{block.number?.toLocaleString()}
                        </Link>
                      </div>
                    </td>
                    <td>
                      {block.timestamp ? timeAgo(block.timestamp) : "N/A"}
                    </td>
                    <td>{block.transactions}</td>
                    <td>{block.gasUsed?.toLocaleString()}</td>
                    <td>{block.gasLimit?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  );
}
