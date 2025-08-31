import { useState, useEffect } from "react";
import { getLatestTransactions } from "../utils/api"; // Using validators as sample address data
import { FaSyncAlt } from "react-icons/fa";
import Link from "next/link";
import SearchInput from "../components/search-input";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        //TODO: Adjust this to user friendly way later by fetching from the backend
        const response = await getLatestTransactions();
        const gotIt = response.data.transactions;
        const walletSet = new Set();
        gotIt.length &&
          gotIt.forEach((tx) => {
            if (tx.from) walletSet.add(tx.from);
            if (tx.to) walletSet.add(tx.to);
          });
        const uniqueAddresses = Array.from(walletSet).map((addr) => ({
          address: addr,
          name: addr,
        }));
        setAddresses(uniqueAddresses);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
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
        <h1 className="page-title">Addresses</h1>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Address List</div>
        </div>

        {loading ? (
          <div className="detail-item">
            <div className="detail-icon">
              <FaSyncAlt className="load-icon-spin" />
            </div>
            <div className="detail-content">
              <div className="detail-label">Loading addresses...</div>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Balance</th>
                  <th>Txn Count</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((address, index) => (
                  <tr key={index}>
                    <td>
                      <div className="hash-row">
                        <div className="address-icon">{index + 1}</div>
                        <div className="address-details">
                          <div className="address-label">{address.name}</div>
                          <Link
                            href={`/address/${address.address}`}
                            className="hash-text"
                          >
                            <div className="address-hash">
                              {address.address.substring(0, 6)}...
                              {address.address.substring(
                                address.address.length - 4
                              )}
                            </div>
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="amount-value">
                        {Math.floor(Math.random() * 10000).toLocaleString(
                          undefined,
                          { minimumFractionDigits: 4, maximumFractionDigits: 4 }
                        )}{" "}
                        tUCC
                      </div>
                    </td>
                    <td>
                      <div className="amount-value">
                        {Math.floor(Math.random() * 100)}
                      </div>
                    </td>
                    <td>
                      <div className="hash-text">
                        {Math.floor(Math.random() * 60)} seconds ago
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
