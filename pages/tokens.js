import { useState, useEffect } from "react";
import { getTokens } from "../utils/api";
import Link from "next/link";
import { FaSyncAlt } from "react-icons/fa";
import SearchInput from "../components/search-input";
import { ethers } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

export default function Tokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await getTokens();
        const addresses = response.data; // must be an array of token contract addresses

        // connect to blockchain (RPC or injected wallet)
        const provider = new ethers.JsonRpcProvider("http://168.231.122.245:8545");

        const tokenData = await Promise.all(
          addresses.map(async (address) => {
            try {
              const contract = new ethers.Contract(address, ERC20_ABI, provider);
              const name = await contract.name();
              const symbol = await contract.symbol();

              // Temporary mock data for price/volume/cap
              return {
                address,
                name,
                symbol,
                price: "$0.00",
                change24h: "+0.00%",
                volume24h: "$0",
                marketCap: "$0"
              };
            } catch (err) {
              console.error(`Error fetching token data for ${address}`, err);
              return {
                address,
                name: "Unknown",
                symbol: "N/A",
                price: "$0.00",
                change24h: "0.00%",
                volume24h: "$0",
                marketCap: "$0"
              };
            }
          })
        );

        setTokens(tokenData);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
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
        <h1 className="page-title">Tokens</h1>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Token List</div>
        </div>

        {loading ? (
          <div className="detail-item">
            <div className="detail-icon">
              <FaSyncAlt className="load-icon-spin" />
            </div>
            <div className="detail-content">
              <div className="detail-label">Loading tokens...</div>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Contract Address</th>
                  <th>Price</th>
                  <th>Change (24H)</th>
                  <th>Volume (24H)</th>
                  <th>Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token, index) => (
                  <tr key={index}>
                    <td>
                      <div className="hash-row">
                        <div className="token-icon">
                          {token.symbol.substring(0, 2)}
                        </div>
                        <div className="token-details">
                          <div className="token-symbol">{token.symbol}</div>
                          <div className="token-name adj">{token.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="hash-row">
                        <Link
                          href={`/address/${token.address}`}
                          className="hash-text"
                        >
                          {token.address.substring(0, 6)}...
                          {token.address.substring(token.address.length - 4)}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div className="amount-value">{token.price}</div>
                    </td>
                    <td>
                      <div
                        className={`amount-value ${
                          token.change24h.startsWith("+")
                            ? "amount-in"
                            : "amount-out"
                        }`}
                      >
                        {token.change24h}
                      </div>
                    </td>
                    <td>
                      <div className="amount-value">{token.volume24h}</div>
                    </td>
                    <td>
                      <div className="amount-value">{token.marketCap}</div>
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
