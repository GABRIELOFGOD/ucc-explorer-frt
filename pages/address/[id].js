import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaCoins,
  FaExchangeAlt,
  FaExclamationCircle,
  FaFileContract,
  FaSearch,
  FaSyncAlt,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import {
  getAddressInfo,
  getLatestTransactionsForAddress,
  getTokenTransactions,
  getTokenHolders,
  timeAgo,
  search,
} from "../../utils/api";
import SearchInput from "../../components/search-input";

export default function Address() {
  const router = useRouter();
  const { id } = router.query;
  const [address, setAddress] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokenTransactions, setTokenTransactions] = useState([]);
  const [tokenHolders, setTokenHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("transactions");

  useEffect(() => {
    if (id) {
      const fetchAddressInfo = async () => {
        try {
          const response = await getAddressInfo(id);
          setAddress(response.data);

          // Fetch token transactions and holders if this is a contract address
          if (response.data.isContract) {
            try {
              const tokenTxResponse = await getTokenTransactions(id);
              setTokenTransactions(tokenTxResponse.data.transactions);

              const tokenHoldersResponse = await getTokenHolders(id);
              setTokenHolders(tokenHoldersResponse.data.holders);
            } catch (error) {
              console.error("Error fetching token data:", error);
            }
          }

          const personalTransactions = await getLatestTransactionsForAddress(
            id
          );
          setTransactions(personalTransactions.data.transactions);
        } catch (error) {
          console.error("Error fetching address info:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAddressInfo();
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
            <h1 className="page-title">Address Details</h1>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaSyncAlt className="load-icon-spin" />
          </div>
          <div className="detail-content">
            <div className="detail-label">Loading address data...</div>
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
        <Link href="/addresses" className="back-button">
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="page-title">Address Details</h1>
          {address?.isContract && tokenHolders.length > 0 && (
            <div className="hash-display">Symbol: {tokenHolders[0].symbol}</div>
          )}
          <div className="hash-display">Address: {address?.address}</div>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              <FaWallet />
            </div>
            <div className="detail-content">
              <div className="detail-label">Balance</div>
              <div className="detail-value">{address?.balance}</div>
              <div className="detail-value">
                {address?.usdBalance} (@ $1.00/tUCC)
              </div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaExchangeAlt />
            </div>
            <div className="detail-content">
              <div className="detail-label">Transactions</div>
              <div className="detail-value">{address?.txnCount}</div>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <FaClock />
            </div>
            <div className="detail-content">
              <div className="detail-label">Last Active</div>
              <div className="detail-value">10 seconds ago</div>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="detail-item">
            <div className="detail-icon">
              {address?.isContract ? <FaFileContract /> : <FaUser />}
            </div>
            <div className="detail-content">
              <div className="detail-label">Type</div>
              <div className="detail-value">
                {address?.isContract ? "Contract" : "Account"}
              </div>
            </div>
          </div>

          {address?.isContract && (
            <div>
              <div className="detail-item">
                <div className="detail-icon">
                  {address?.isVerified ? (
                    <FaCheckCircle />
                  ) : (
                    <FaExclamationCircle />
                  )}
                </div>
                <div className="detail-content">
                  <div className="detail-label">Verification</div>
                  <div className="detail-value">
                    {address?.isVerified ? "Verified" : "Not Verified"}
                  </div>
                  {!address?.isVerified && (
                    <div className="detail-value">
                      <Link href="/verify-contract" className="verify-button">
                        Verify Contract
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <FaUser />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Token Holder</div>
                  <div className="detail-value">
                    {tokenHolders.length > 0 ? (
                      <div>{tokenHolders.length} Holders</div>
                    ) : (
                      // tokenHolders.map((holder, index) => (
                      //   <div key={index} className="token-holder">
                      //     {holder.name} ({holder.symbol})
                      //   </div>
                      // ))
                      <div className="no-token-holders">No Token Holders</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display token balances for all addresses */}
          {!address.isContract &&
            address?.tokenBalances &&
            address.tokenBalances.length > 0 && (
              <div className="detail-item">
                <div className="detail-icon come-center">
                  <FaCoins />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Token Holdings</div>
                  {/* <div className="detail-value">
                    {address.tokenBalances.map((token, index) => (
                      <div key={index} className="token-balance">
                        {token.symbol}: {token.balance}
                      </div>
                    ))}
                  </div> */}
                  <select className="select-options">
                    {address?.tokenBalances.map((token, index) => (
                      <option key={index} value={token.symbol}>
                        {token.symbol}: {token.balance}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
        </div>
      </div>

      {address?.isContract && (
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "transactions" ? "active" : ""}`}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </button>
            <button
              className={`tab ${
                activeTab === "token-transactions" ? "active" : ""
              }`}
              onClick={() => setActiveTab("token-transactions")}
            >
              Token Transactions
            </button>
            <button
              className={`tab ${activeTab === "token-holders" ? "active" : ""}`}
              onClick={() => setActiveTab("token-holders")}
            >
              Token Holders
            </button>
            <button
              className={`tab ${activeTab === "contract" ? "active" : ""}`}
              onClick={() => setActiveTab("contract")}
            >
              Contract
            </button>
            {address?.isVerified && (
              <>
                <button
                  className={`tab ${activeTab === "read" ? "active" : ""}`}
                  onClick={() => setActiveTab("read")}
                >
                  Read
                </button>
                <button
                  className={`tab ${activeTab === "write" ? "active" : ""}`}
                  onClick={() => setActiveTab("write")}
                >
                  Write
                </button>
              </>
            )}
          </div>

          <div className="tab-content">
            {activeTab === "transactions" && (
              <div className="table-container">
                <div className="table-header">
                  <div className="table-title">Transactions</div>
                </div>

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
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.hash}>
                          <td>
                            <div className="hash-row">
                              <Link
                                href={`/tx/${tx.hash}`}
                                className="hash-text"
                              >
                                {tx.hash.substring(0, 6)}...
                                {tx.hash.substring(tx.hash.length - 4)}
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
                          <td>{timeAgo(tx.timestamp)}</td>
                          <td>
                            <div className="hash-row">
                              <Link
                                href={`/address/${tx.from}`}
                                className="hash-text"
                              >
                                {tx.from === address.address
                                  ? "You"
                                  : `${tx.from.substring(
                                      0,
                                      6
                                    )}...${tx.from.substring(
                                      tx.from.length - 4
                                    )}`}
                              </Link>
                            </div>
                          </td>
                          <td>
                            {tx.to ? (
                              <div className="hash-row">
                                <Link
                                  href={`/address/${tx.to}`}
                                  className="hash-text"
                                >
                                  {tx.to === address.address
                                    ? "You"
                                    : `${tx.to.substring(
                                        0,
                                        6
                                      )}...${tx.to.substring(
                                        tx.to.length - 4
                                      )}`}
                                </Link>
                              </div>
                            ) : (
                              <div className="hash-row">...</div>
                            )}
                          </td>
                          <td>
                            <div
                              className={`amount-value ${
                                tx.to === address.address
                                  ? "amount-in"
                                  : "amount-out"
                              }`}
                            >
                              {tx.to === address.address ? "+" : "-"}
                              {tx.value}
                            </div>
                          </td>
                          <td>
                            <div className="status-badge status-success">
                              Success
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "contract" && (
              <div className="table-container">
                <div className="table-header">
                  <div className="table-title">Contract Source Code</div>
                </div>

                {address?.isVerified ? (
                  <div className="contract-code">
                    <pre>
                      {address?.contractInfo?.sourceCode ||
                        "Source code not available"}
                    </pre>
                  </div>
                ) : (
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaExclamationCircle />
                    </div>
                    <div className="detail-content">
                      <div className="detail-label">Contract Not Verified</div>
                      <div className="detail-value">
                        Source code is not available because this contract has
                        not been verified.
                      </div>
                      <div className="detail-value">
                        <Link href="/verify-contract" className="verify-button">
                          Verify Contract
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "read" && address?.isVerified && (
              <div className="table-container">
                <div className="table-header">
                  <div className="table-title">Read Contract</div>
                </div>

                <div className="read-contract">
                  <div className="form-group">
                    <label htmlFor="function">Select Function</label>
                    <select id="function" className="function-select">
                      <option value="getValue">getValue()</option>
                      <option value="getName">getName()</option>
                    </select>
                  </div>

                  <button className="submit-button">Query</button>

                  <div className="result-section">
                    <div className="result-label">Result:</div>
                    <div className="result-value">12345</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "write" && address?.isVerified && (
              <div className="table-container">
                <div className="table-header">
                  <div className="table-title">Write Contract</div>
                </div>

                <div className="write-contract">
                  <div className="form-group">
                    <label htmlFor="writeFunction">Select Function</label>
                    <select id="writeFunction" className="function-select">
                      <option value="setValue">setValue(uint256)</option>
                      <option value="setName">setName(string)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="param1">Parameter 1</label>
                    <input type="text" id="param1" placeholder="Enter value" />
                  </div>

                  <button className="submit-button">Write</button>
                </div>
              </div>
            )}

            {activeTab === "token-transactions" && (
              <div className="table-container">
                <div className="table-header">
                  <div className="table-title">Token Transactions</div>
                </div>

                <div className="table-responsive">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Txn Hash</th>
                        <th>Block</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokenTransactions.map((tx, index) => (
                        <tr key={index}>
                          <td>
                            <div className="hash-row">
                              <Link
                                href={`/tx/${tx.transactionHash}`}
                                className="hash-text"
                              >
                                {tx.transactionHash.substring(0, 6)}...
                                {tx.transactionHash.substring(
                                  tx.transactionHash.length - 4
                                )}
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
                          <td>
                            <div className="hash-row">
                              <Link
                                href={`/address/${tx.from}`}
                                className="hash-text"
                              >
                                {tx.from.substring(0, 6)}...
                                {tx.from.substring(tx.from.length - 4)}
                              </Link>
                            </div>
                          </td>
                          <td>
                            <div className="hash-row">
                              <Link
                                href={`/address/${tx.to}`}
                                className="hash-text"
                              >
                                {tx.to.substring(0, 6)}...
                                {tx.to.substring(tx.to.length - 4)}
                              </Link>
                            </div>
                          </td>
                          <td>
                            <div className="amount-value">
                              {tx.value} {tx.symbol}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "token-holders" && (
              <div className="table-container">
                <div className="table-header">
                  <div className="table-title">Token Holders</div>
                </div>

                {tokenHolders.length > 0 ? (
                  <div className="table-responsive">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>Address</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokenHolders.map((holder, index) => (
                          <tr key={index}>
                            <td>
                              <div className="hash-row">
                                <Link
                                  href={`/address/${holder.address}`}
                                  className="hash-text"
                                >
                                  {holder.address.substring(0, 6)}...
                                  {holder.address.substring(
                                    holder.address.length - 4
                                  )}
                                </Link>
                              </div>
                            </td>
                            <td>
                              <div className="amount-value">
                                {holder.balance} {holder.symbol}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div>No token holders found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!address?.isContract && (
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Transactions</div>
          </div>

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
                      <Link
                        href={`/block/${tx.blockNumber}`}
                        className="hash-text"
                      >
                        #{tx.blockNumber?.toLocaleString()}
                      </Link>
                    </td>
                    <td>{timeAgo(tx.timestamp)}</td>
                    <td>
                      <div className="hash-row">
                        <Link
                          href={`/address/${tx.from}`}
                          className="hash-text"
                        >
                          {tx.from === address.address
                            ? "You"
                            : `${tx.from.substring(0, 6)}...${tx.from.substring(
                                tx.from.length - 4
                              )}`}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div className="hash-row">
                        {tx.to ? (
                          <Link
                            href={`/address/${tx.to}`}
                            className="hash-text"
                          >
                            {tx.to === address.address
                              ? "You"
                              : `${tx.to.substring(0, 6)}...${tx.to.substring(
                                  tx.to.length - 4
                                )}`}
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`amount-value ${
                          tx.to === address.address ? "amount-in" : "amount-out"
                        }`}
                      >
                        {tx.to === address.address ? "+" : "-"}
                        {tx.value}
                      </div>
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
      )}

      <style jsx>{`
        .tabs-container {
          margin: 20px 0;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid var(--gray-600);
          margin-bottom: 20px;
        }

        .tab {
          background: none;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          font-weight: 500;
          color: var(--gray-400);
          border-bottom: 2px solid transparent;
        }

        .tab.active {
          color: var(--electric-blue);
          border-bottom: 2px solid var(--electric-blue);
        }

        .tab-content {
          padding: 20px 0;
        }

        .contract-code {
          background: var(--dark-glass);
          border-radius: 8px;
          padding: 20px;
          font-family: "JetBrains Mono", monospace;
          font-size: 14px;
          overflow-x: auto;
        }

        .read-contract,
        .write-contract {
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

        .function-select,
        .form-group input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--gray-600);
          background: var(--dark-glass);
          color: white;
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

        .result-section {
          margin-top: 20px;
          padding: 16px;
          background: var(--light-glass);
          border-radius: 8px;
        }

        .result-label {
          font-weight: 500;
          margin-bottom: 8px;
        }

        .result-value {
          font-family: "JetBrains Mono", monospace;
          font-size: 18px;
          color: var(--electric-blue);
        }

        .verify-button {
          display: inline-block;
          background: linear-gradient(
            135deg,
            var(--electric-blue),
            var(--cyber-cyan)
          );
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .verify-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .token-balance {
          margin-bottom: 4px;
        }

        .token-balance:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
