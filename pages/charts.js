import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaChartLine,
  FaCoins,
  FaGasPump,
  FaSearch,
  FaUsers,
  FaCube,
  FaBolt,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { search } from "../utils/api";

export default function Charts() {
  const [timeRange, setTimeRange] = useState("24h");
  const [chartData, setChartData] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const router = useRouter();

  // Generate mock chart data
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const now = Date.now();
      const points = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30;

      for (let i = points; i >= 0; i--) {
        const time = new Date(
          now -
            i *
              (timeRange === "24h"
                ? 3600000
                : timeRange === "7d"
                ? 86400000
                : 86400000)
        );
        const value = 1000 + Math.random() * 500;
        data.push({
          time: time.toISOString(),
          value: value,
        });
      }

      setChartData(data);
    };

    generateChartData();
  }, [timeRange]);

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

  // Simple line chart component
  const LineChart = ({ data }) => {
    if (!data.length) return null;

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue;

    return (
      <div className="chart-container">
        <svg width="100%" height="300" viewBox="0 0 800 300">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`grid-${i}`}
              x1="50"
              y1={50 + i * 50}
              x2="750"
              y2={50 + i * 50}
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth="1"
            />
          ))}

          {/* Chart line */}
          <polyline
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            points={data
              .map((point, i) => {
                const x = 50 + (i * 700) / (data.length - 1);
                const y = 250 - ((point.value - minValue) / range) * 200;
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Data points */}
          {data.map((point, i) => {
            const x = 50 + (i * 700) / (data.length - 1);
            const y = 250 - ((point.value - minValue) / range) * 200;
            return <circle key={i} cx={x} cy={y} r="4" fill="#0EA5E9" />;
          })}
        </svg>
      </div>
    );
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
        <h1 className="page-title">Charts & Statistics</h1>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaCube />
            </div>
            <div className="detail-content">
              <div className="detail-label">Block Height</div>
              <div className="detail-value">1,234,567</div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaGasPump />
            </div>
            <div className="detail-content">
              <div className="detail-label">Avg. Gas Price</div>
              <div className="detail-value">1 Gwei</div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaBolt />
            </div>
            <div className="detail-content">
              <div className="detail-label">Transactions (24h)</div>
              <div className="detail-value">12,345</div>
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
              <div className="detail-value">99,999,999,999 tUCC</div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaUsers />
            </div>
            <div className="detail-content">
              <div className="detail-label">Active Addresses (24h)</div>
              <div className="detail-value">1,234</div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaChartLine />
            </div>
            <div className="detail-content">
              <div className="detail-label">Network Utilization</div>
              <div className="detail-value">75%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Network Statistics</div>
          <div className="chart-controls">
            <button
              className={`chart-btn ${timeRange === "24h" ? "active" : ""}`}
              onClick={() => setTimeRange("24h")}
            >
              24H
            </button>
            <button
              className={`chart-btn ${timeRange === "7d" ? "active" : ""}`}
              onClick={() => setTimeRange("7d")}
            >
              7D
            </button>
            <button
              className={`chart-btn ${timeRange === "30d" ? "active" : ""}`}
              onClick={() => setTimeRange("30d")}
            >
              30D
            </button>
          </div>
        </div>

        <LineChart data={chartData} />

        <div className="chart-stats">
          <div className="stat-item">
            <div className="stat-label">Highest Value</div>
            <div className="stat-value">1,456.78 tUCC</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Lowest Value</div>
            <div className="stat-value">987.65 tUCC</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Average Value</div>
            <div className="stat-value">1,234.56 tUCC</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .chart-container {
          width: 100%;
          height: 300px;
          margin: 20px 0;
        }

        .chart-controls {
          display: flex;
          gap: 8px;
        }

        .chart-btn {
          background: var(--light-glass);
          border: none;
          border-radius: 4px;
          color: white;
          padding: 4px 12px;
          cursor: pointer;
          font-size: 12px;
        }

        .chart-btn.active {
          background: var(--electric-blue);
        }

        .chart-stats {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(148, 163, 184, 0.3);
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          font-size: 14px;
          color: var(--gray-400);
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
