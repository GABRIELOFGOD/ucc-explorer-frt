import { useState, useEffect } from "react";
import { getTokens, search } from "../utils/api";
import Link from "next/link";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import SearchInput from "../components/search-input";

export default function Tokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await getTokens();
        console.log(response.data);
        setTokens(response.data.tokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
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
              <FaSyncAlt />
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
                          <div className="token-name">{token.name}</div>
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
