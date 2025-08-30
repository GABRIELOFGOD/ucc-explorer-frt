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
  getContractDetails,
  getContractABI,
  timeAgo,
  search,
} from "../../utils/api";
import SearchInput from "../../components/search-input";

// Web3 integration - you'll need to install ethers.js
// npm install ethers
import { ethers } from "ethers";

export default function Address() {
  const router = useRouter();
  const { id } = router.query;
  const [address, setAddress] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokenTransactions, setTokenTransactions] = useState([]);
  const [tokenHolders, setTokenHolders] = useState([]);
  const [contractDetails, setContractDetails] = useState(null);
  const [contractABI, setContractABI] = useState(null);
  const [readFunctions, setReadFunctions] = useState([]);
  const [writeFunctions, setWriteFunctions] = useState([]);
  const [selectedReadFunction, setSelectedReadFunction] = useState(null);
  const [selectedWriteFunction, setSelectedWriteFunction] = useState(null);
  const [readParams, setReadParams] = useState({});
  const [writeParams, setWriteParams] = useState({});
  const [readResult, setReadResult] = useState(null);
  const [readLoading, setReadLoading] = useState(false);
  const [writeLoading, setWriteLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("transactions");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  // Initialize Web3 provider
  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Check ethers version and use appropriate provider
          let web3Provider;
          if (ethers.providers) {
            // Ethers v5
            web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          } else {
            // Ethers v6
            web3Provider = new ethers.BrowserProvider(window.ethereum);
          }
          
          setProvider(web3Provider);
          
          // Check if already connected
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            setWalletConnected(true);
            const signerInstance = await web3Provider.getSigner();
            setSigner(signerInstance);
          }
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      } else {
        // Fallback to a read-only provider (like Infura or Alchemy)
        try {
          const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://168.231.122.245:8545";
          let readOnlyProvider;
          
          if (ethers.providers) {
            // Ethers v5
            readOnlyProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
          } else {
            // Ethers v6
            readOnlyProvider = new ethers.JsonRpcProvider(rpcUrl);
          }
          
          setProvider(readOnlyProvider);
        } catch (error) {
          console.error("Error setting up read-only provider:", error);
        }
      }
    };

    initializeWeb3();
  }, []);

  // Create contract instance when ABI and address are available
  useEffect(() => {
    if (contractABI && address?.address && provider) {
      try {
        const contractInstance = new ethers.Contract(
          address.address,
          contractABI.abi || contractABI,
          signer || provider
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("Error creating contract instance:", error);
      }
    }
  }, [contractABI, address, provider, signer]);

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        
        let web3Provider;
        if (ethers.providers) {
          // Ethers v5
          web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        } else {
          // Ethers v6
          web3Provider = new ethers.BrowserProvider(window.ethereum);
        }
        
        setProvider(web3Provider);
        const signerInstance = await web3Provider.getSigner();
        setSigner(signerInstance);
        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet to interact with contracts.");
    }
  };

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

            // Fetch contract details if it's a contract
            try {
              const contractResponse = await getContractDetails(id);
              setContractDetails(contractResponse.data.contract);

              // Fetch ABI if contract is verified
              if (contractResponse.data.contract.isVerified) {
                const abiResponse = await getContractABI(id);
                setContractABI(abiResponse.data);

                // Separate read and write functions from ABI
                if (abiResponse.data.abi || abiResponse.data.functions) {
                  const abi = abiResponse.data.abi || abiResponse.data.functions;
                  
                  // Filter functions from ABI
                  const functions = abi.filter(item => item.type === 'function');
                  
                  const readFns = functions.filter((fn) =>
                    fn.stateMutability === "view" || fn.stateMutability === "pure"
                  );
                  const writeFns = functions.filter((fn) =>
                    fn.stateMutability === "nonpayable" || fn.stateMutability === "payable"
                  );

                  setReadFunctions(readFns);
                  setWriteFunctions(writeFns);

                  if (readFns.length > 0) setSelectedReadFunction(readFns[0]);
                  if (writeFns.length > 0) setSelectedWriteFunction(writeFns[0]);
                }
              }
            } catch (error) {
              console.error("Error fetching contract data:", error);
            }
          }

          const personalTransactions = await getLatestTransactionsForAddress(id);
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

  const handleReadFunctionChange = (e) => {
    const funcName = e.target.value;
    const func = readFunctions.find((f) => f.name === funcName);
    setSelectedReadFunction(func);
    setReadParams({});
    setReadResult(null);
  };

  const handleWriteFunctionChange = (e) => {
    const funcName = e.target.value;
    const func = writeFunctions.find((f) => f.name === funcName);
    setSelectedWriteFunction(func);
    setWriteParams({});
  };

  const handleReadParamChange = (paramName, value) => {
    setReadParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleWriteParamChange = (paramName, value) => {
    setWriteParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  // Parse parameter value based on type
  const parseParameterValue = (value, type) => {
    try {
      if (type.includes('uint') || type.includes('int')) {
        // Handle both ethers v5 and v6
        if (ethers.BigNumber) {
          return ethers.BigNumber.from(value);
        } else {
          return BigInt(value);
        }
      }
      if (type === 'bool') {
        return value.toLowerCase() === 'true';
      }
      if (type.includes('bytes')) {
        // Handle both ethers v5 and v6
        if (ethers.utils) {
          return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(value));
        } else {
          return ethers.hexlify(ethers.toUtf8Bytes(value));
        }
      }
      if (type === 'address') {
        // Handle both ethers v5 and v6
        if (ethers.utils) {
          return ethers.utils.getAddress(value);
        } else {
          return ethers.getAddress(value);
        }
      }
      // For arrays, parse as JSON
      if (type.includes('[]')) {
        return JSON.parse(value);
      }
      return value;
    } catch (error) {
      throw new Error(`Invalid parameter format for ${type}: ${error.message}`);
    }
  };

  const handleReadFunctionCall = async () => {
    if (!selectedReadFunction || !contract) return;

    setReadLoading(true);
    setReadResult(null);

    try {
      // Prepare parameters
      const params = [];
      if (selectedReadFunction.inputs && selectedReadFunction.inputs.length > 0) {
        for (const input of selectedReadFunction.inputs) {
          const paramValue = readParams[input.name];
          if (paramValue === undefined || paramValue === '') {
            throw new Error(`Parameter ${input.name} is required`);
          }
          const parsedValue = parseParameterValue(paramValue, input.type);
          params.push(parsedValue);
        }
      }

      // Call the contract function
      const result = await contract[selectedReadFunction.name](...params);
      
      // Format the result based on return type
      let formattedResult;
      if (ethers.BigNumber && ethers.BigNumber.isBigNumber(result)) {
        // Ethers v5
        formattedResult = result.toString();
      } else if (typeof result === 'bigint') {
        // Ethers v6 or native BigInt
        formattedResult = result.toString();
      } else if (Array.isArray(result)) {
        formattedResult = JSON.stringify(result, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value, 2);
      } else if (typeof result === 'object' && result !== null) {
        formattedResult = JSON.stringify(result, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value, 2);
      } else {
        formattedResult = result.toString();
      }

      setReadResult(formattedResult);
    } catch (error) {
      console.error("Error calling read function:", error);
      setReadResult(`Error: ${error.message}`);
    } finally {
      setReadLoading(false);
    }
  };

  const handleWriteFunctionCall = async () => {
    if (!selectedWriteFunction || !contract || !walletConnected) {
      if (!walletConnected) {
        alert("Please connect your wallet first to write to the contract.");
        return;
      }
      return;
    }

    setWriteLoading(true);

    try {
      // Prepare parameters
      const params = [];
      let payableValue = ethers.BigNumber.from(0);

      if (selectedWriteFunction.inputs && selectedWriteFunction.inputs.length > 0) {
        for (const input of selectedWriteFunction.inputs) {
          const paramValue = writeParams[input.name];
          if (paramValue === undefined || paramValue === '') {
            throw new Error(`Parameter ${input.name} is required`);
          }
          const parsedValue = parseParameterValue(paramValue, input.type);
          params.push(parsedValue);
        }
      }

      // Handle payable functions
      const options = {};
      if (selectedWriteFunction.stateMutability === 'payable') {
        const ethValue = writeParams['_value'] || '0';
        if (ethers.utils) {
          // Ethers v5
          options.value = ethers.utils.parseEther(ethValue);
        } else {
          // Ethers v6
          options.value = ethers.parseEther(ethValue);
        }
      }

      // Estimate gas
      try {
        const gasEstimate = await contract.estimateGas[selectedWriteFunction.name](...params, options);
        if (ethers.BigNumber && ethers.BigNumber.isBigNumber(gasEstimate)) {
          // Ethers v5
          options.gasLimit = gasEstimate.mul(120).div(100);
        } else {
          // Ethers v6
          options.gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);
        }
      } catch (gasError) {
        console.warn("Gas estimation failed, using default gas limit");
        options.gasLimit = 300000; // Default gas limit
      }

      // Call the contract function
      const tx = await contract[selectedWriteFunction.name](...params, options);
      
      alert(`Transaction sent! Hash: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      alert(`Transaction confirmed in block ${receipt.blockNumber}`);
      
    } catch (error) {
      console.error("Error calling write function:", error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setWriteLoading(false);
    }
  };

  // Function signature generator for display
  const getFunctionSignature = (func) => {
    const inputs = func.inputs || [];
    const inputTypes = inputs.map(input => input.type).join(', ');
    return `${func.name}(${inputTypes})`;
  };

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
          address.tokenBalances.filter((token) => token.balance > 0).length >
            0 ? (
            <div className="detail-item">
              <div className="detail-icon come-center">
                <FaCoins />
              </div>
              <div className="detail-content">
                <div className="detail-label">Token Holdings</div>
                <select className="select-options">
                  {address.tokenBalances
                    .filter((token) => token.balance > 0)
                    .map((token, index) => (
                      <option key={index} value={token.symbol}>
                        {token.symbol}: {token.balance}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="detail-item">
              <div className="detail-icon come-center">
                <FaCoins />
              </div>
              <div className="detail-content">
                <div className="detail-label">Token Holdings</div>
                <div className="detail-value">Not holding any coin</div>
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
                      {contractDetails?.sourceCode ||
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
                  <div className="wallet-status">
                    {provider ? (
                      <span className="connected">✓ Provider Connected</span>
                    ) : (
                      <span className="disconnected">✗ No Provider</span>
                    )}
                  </div>
                </div>

                <div className="read-contract">
                  <div className="form-group">
                    <label htmlFor="readFunction">Select Function</label>
                    <select
                      id="readFunction"
                      className="function-select"
                      onChange={handleReadFunctionChange}
                      value={selectedReadFunction?.name || ""}
                    >
                      <option value="">Select a function</option>
                      {readFunctions.map((func, index) => (
                        <option key={index} value={func.name}>
                          {getFunctionSignature(func)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedReadFunction &&
                    selectedReadFunction.inputs &&
                    selectedReadFunction.inputs.length > 0 && (
                      <div className="form-group">
                        <label>Parameters</label>
                        {selectedReadFunction.inputs.map((input, index) => (
                          <div key={index} className="param-input-group">
                            <label className="param-label">
                              {input.name} ({input.type})
                            </label>
                            <input
                              type="text"
                              placeholder={`Enter ${input.type} value`}
                              className="function-param"
                              value={readParams[input.name] || ""}
                              onChange={(e) =>
                                handleReadParamChange(input.name, e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                  <button
                    className="submit-button"
                    onClick={handleReadFunctionCall}
                    disabled={!selectedReadFunction || readLoading || !contract}
                  >
                    {readLoading ? "Querying..." : "Query"}
                  </button>

                  {readResult && (
                    <div className="result-section">
                      <div className="result-label">Result:</div>
                      <div className="result-value">
                        <pre>{readResult}</pre>
                      </div>
                    </div>
                  )}

                  {selectedReadFunction && (
                    <div className="function-info">
                      <h4>Function Details:</h4>
                      <p><strong>Name:</strong> {selectedReadFunction.name}</p>
                      <p><strong>Type:</strong> {selectedReadFunction.stateMutability}</p>
                      {selectedReadFunction.outputs && selectedReadFunction.outputs.length > 0 && (
                        <p><strong>Returns:</strong> {selectedReadFunction.outputs.map(o => o.type).join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "write" && address?.isVerified && (
              <div className="table-container">
                <div className="table-header">
                  <div className="table-title">Write Contract</div>
                  <div className="wallet-status">
                    {walletConnected ? (
                      <span className="connected">✓ Wallet Connected</span>
                    ) : (
                      <button className="connect-button" onClick={connectWallet}>
                        Connect Wallet
                      </button>
                    )}
                  </div>
                </div>

                <div className="write-contract">
                  <div className="form-group">
                    <label htmlFor="writeFunction">Select Function</label>
                    <select
                      id="writeFunction"
                      className="function-select"
                      onChange={handleWriteFunctionChange}
                      value={selectedWriteFunction?.name || ""}
                    >
                      <option value="">Select a function</option>
                      {writeFunctions.map((func, index) => (
                        <option key={index} value={func.name}>
                          {getFunctionSignature(func)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedWriteFunction &&
                    selectedWriteFunction.inputs &&
                    selectedWriteFunction.inputs.length > 0 && (
                      <div className="form-group">
                        <label>Parameters</label>
                        {selectedWriteFunction.inputs.map((input, index) => (
                          <div key={index} className="param-input-group">
                            <label className="param-label">
                              {input.name} ({input.type})
                            </label>
                            <input
                              type="text"
                              placeholder={`Enter ${input.type} value`}
                              className="function-param"
                              value={writeParams[input.name] || ""}
                              onChange={(e) =>
                                handleWriteParamChange(input.name, e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                  {selectedWriteFunction?.stateMutability === 'payable' && (
                    <div className="form-group">
                      <label className="param-label">Value (ETH)</label>
                      <input
                        type="text"
                        placeholder="Enter ETH amount to send"
                        className="function-param"
                        value={writeParams['_value'] || ""}
                        onChange={(e) =>
                          handleWriteParamChange('_value', e.target.value)
                        }
                      />
                    </div>
                  )}

                  <button
                    className="submit-button"
                    onClick={handleWriteFunctionCall}
                    disabled={!selectedWriteFunction || writeLoading || !walletConnected || !contract}
                  >
                    {writeLoading ? "Processing..." : "Write"}
                  </button>

                  {selectedWriteFunction && (
                    <div className="function-info">
                      <h4>Function Details:</h4>
                      <p><strong>Name:</strong> {selectedWriteFunction.name}</p>
                      <p><strong>Type:</strong> {selectedWriteFunction.stateMutability}</p>
                      {selectedWriteFunction.stateMutability === 'payable' && (
                        <p className="payable-warning">⚠️ This function can receive ETH</p>
                      )}
                    </div>
                  )}
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
          flex-wrap: wrap;
        }

        .tab {
          background: none;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          font-weight: 500;
          color: var(--gray-400);
          border-bottom: 2px solid transparent;
          white-space: nowrap;
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
          max-height: 500px;
          overflow-y: auto;
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
        .function-param {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--gray-600);
          background: var(--dark-glass);
          color: white;
          margin-bottom: 10px;
        }

        .param-input-group {
          margin-bottom: 15px;
        }

        .param-label {
          font-size: 14px;
          color: var(--gray-300);
          margin-bottom: 5px;
          display: block;
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

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .connect-button {
          background: linear-gradient(
            135deg,
            var(--electric-blue),
            var(--cyber-cyan)
          );
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .connect-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .wallet-status {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .connected {
          color: var(--green-400);
          font-size: 14px;
          font-weight: 500;
        }

        .disconnected {
          color: var(--red-400);
          font-size: 14px;
          font-weight: 500;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
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
          font-size: 14px;
          color: var(--electric-blue);
          word-break: break-all;
          max-height: 300px;
          overflow-y: auto;
        }

        .result-value pre {
          margin: 0;
          white-space: pre-wrap;
        }

        .function-info {
          margin-top: 20px;
          padding: 16px;
          background: var(--dark-glass);
          border-radius: 8px;
          border-left: 4px solid var(--electric-blue);
        }

        .function-info h4 {
          margin-top: 0;
          color: var(--electric-blue);
        }

        .function-info p {
          margin: 8px 0;
          color: var(--gray-300);
        }

        .payable-warning {
          color: var(--yellow-400);
          font-weight: 500;
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

        @media (max-width: 768px) {
          .tabs {
            overflow-x: auto;
            white-space: nowrap;
          }

          .tab {
            padding: 10px 16px;
            font-size: 14px;
          }

          .table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .wallet-status {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}