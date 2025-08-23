import { useState, useEffect } from "react";
import { getLatestBlocks, search, timeAgo } from "../utils/api";
import Link from "next/link";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";
import { useRouter } from "next/router";

export default function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await getLatestBlocks(currentPage, 10);
        setBlocks(response.data.blocks);
        setTotalPages(response.data.totalPages >= 10 ? 10 : response.data.totalPages);
      } catch (error) {
        console.error("Error fetching blocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setLoading(true);
    }
  };

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
        <h1 className="page-title">Blocks</h1>
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`pagination-btn ${
                currentPage === i + 1 ? "active" : ""
              }`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Block List</div>
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
            <table className="blocks-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Age</th>
                  <th>Txn</th>
                  <th>Gas Used</th>
                  <th>Gas Limit</th>
                  <th>Miner</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block) => (
                  <tr key={block.number}>
                    <td>
                      <Link
                        href={`/block/${block.number}`}
                        className="hash-text"
                      >
                        #{block.number.toLocaleString()}
                      </Link>
                    </td>
                    <td>{timeAgo(block.timestamp)}</td>
                    <td>{block.transactions}</td>
                    <td>{block.gasUsed?.toLocaleString() || "N/A"}</td>
                    <td>{block.gasLimit?.toLocaleString() || "N/A"}</td>
                    <td>
                      <div className="hash-row">
                        <Link
                          href={`/address/${block.miner}`}
                          className="hash-text"
                        >
                          {block.miner.substring(0, 6)}...
                          {block.miner.substring(block.miner.length - 4)}
                        </Link>
                      </div>
                    </td>
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
