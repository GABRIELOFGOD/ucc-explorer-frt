import { useState, useEffect } from "react";
import { getValidators, search } from "../utils/api";
import Link from "next/link";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import SearchInput from "../components/search-input";

export default function Validators() {
  const [validators, setValidators] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchValidators = async () => {
      try {
        const response = await getValidators();
        setValidators(response.data);
      } catch (error) {
        console.error("Error fetching validators:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchValidators();
  }, []);

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
        <h1 className="page-title">Validators</h1>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Validator List</div>
        </div>

        {loading ? (
          <div className="detail-item">
            <div className="detail-icon">
              <FaSyncAlt className="load-icon-spin" />
            </div>
            <div className="detail-content">
              <div className="detail-label">Loading validators...</div>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Validator</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Stake</th>
                  <th>Blocks</th>
                  <th>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {validators.map((validator, index) => (
                  <tr key={index}>
                    <td>
                      <div className="hash-row">
                        <div className="validator-icon">V{index + 1}</div>
                        <div className="validator-details">
                          <div className="validator-name">{validator.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="hash-row">
                        <Link
                          href={`/address/${validator.address}`}
                          className="hash-text"
                        >
                          {validator.address.substring(0, 6)}...
                          {validator.address.substring(
                            validator.address.length - 4
                          )}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`status-badge ${
                          validator.status === "active"
                            ? "status-success"
                            : "status-failed"
                        }`}
                      >
                        {validator.status.charAt(0).toUpperCase() +
                          validator.status.slice(1)}
                      </div>
                    </td>
                    <td>
                      <div className="amount-value">{validator.stake}</div>
                    </td>
                    <td>
                      <div className="amount-value">
                        {validator.blocks?.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="amount-value">{validator.uptime}</div>
                      <div className="uptime-bar">
                        <div
                          className="uptime-fill"
                          style={{ width: validator.uptime }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .uptime-bar {
          height: 8px;
          background: var(--gray-700);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }

        .uptime-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--green), var(--teal));
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
