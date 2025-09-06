
// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { FaSyncAlt } from 'react-icons/fa';
// import SearchInput from '../components/search-input';
// import { timeAgo } from '../utils/api';

// export default function Transactions() {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [ws, setWs] = useState(null);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   useEffect(() => {
//     // Load initial transactions
//     const fetchHistory = async () => {
//       try {
//         const res = await fetch(`http://localhost:3500/transactions?page=${page}&pageSize=50`);
//         // const res = await fetch(`http://168.231.122.245:3500/transactions?page=${page}&pageSize=50`);
//         if (!res.ok) throw new Error("Failed to fetch transactions");
//         const data = await res.json();
//         console.log("Here", data);
//         setTransactions(data.transactions);
//         setTotal(data.total);
//       } catch (err) {
//         console.error("Error fetching history:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();

//     // WebSocket for live updates
//     const connectWebSocket = () => {
//       const socket = new WebSocket("ws://localhost:4000");
//       // const socket = new WebSocket("ws://168.231.122.245:4000");

//       socket.onopen = () => {
//         console.log("✅ WS connected");
//         setWs(socket);
//       };

//       socket.onmessage = (event) => {
//         try {
//           const tx = JSON.parse(event.data);
//           setTransactions((prev) => {
//             if (prev.some((existing) => existing.hash === tx.hash)) {
//               return prev;
//             }
//             return [tx, ...prev].slice(0, 50);
//           });
//         } catch (err) {
//           console.error("Error parsing WebSocket message:", err);
//         }
//       };

//       socket.onclose = () => {
//         console.log("❌ WS disconnected, attempting to reconnect...");
//         setTimeout(connectWebSocket, 5000);
//       };

//       socket.onerror = (err) => {
//         console.error("WebSocket error:", err);
//       };

//       setWs(socket);
//     };

//     connectWebSocket();

//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [page]); // Re-fetch when page changes

//   const handleNextPage = () => {
//     setPage((prev) => prev + 1);
//     setLoading(true);
//   };

//   const handlePrevPage = () => {
//     if (page > 1) {
//       setPage((prev) => prev - 1);
//       setLoading(true);
//     }
//   };

//   return (
//     <div className="main-content">
//       <div className="top-nav">
//         <SearchInput />
//         <div className="network-indicator">
//           <div className="status-dot"></div>
//           <div className="network-name">Testnet</div>
//         </div>
//       </div>

//       <div className="page-header">
//         <h1 className="page-title">Transactions</h1>
//       </div>

//       <div className="table-container">
//         {loading ? (
//           <div className="detail-item">
//             <FaSyncAlt className="load-icon-spin" />
//             <span>Loading transactions...</span>
//           </div>
//         ) : transactions.length === 0 ? (
//           <div className="detail-item">
//             <span>No transactions found</span>
//           </div>
//         ) : (
//           <>
//             <table className="transactions-table">
//               <thead>
//                 <tr>
//                   <th>Txn Hash</th>
//                   <th>Block</th>
//                   <th>Age</th>
//                   <th>From</th>
//                   <th>To</th>
//                   <th>Value</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {transactions.map((tx) => (
//                   <tr key={tx.hash}>
//                     <td>
//                       <Link href={`/tx/${tx.hash}`}>
//                         {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
//                       </Link>
//                     </td>
//                     <td>
//                       <Link href={`/block/${tx.blockNumber}`}>#{tx.blockNumber}</Link>
//                     </td>
//                     <td>{tx.timestamp ? timeAgo(tx.timestamp) : "N/A"}</td>
//                     <td>
//                       <Link href={`/address/${tx.from}`}>
//                         {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
//                       </Link>
//                     </td>
//                     <td>
//                       {tx.to ? (
//                         <Link href={`/address/${tx.to}`}>
//                           {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
//                         </Link>
//                       ) : (
//                         "Contract Creation"
//                       )}
//                     </td>
//                     <td>{tx.value} tUCC</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             <div className="pagination">
//               <button onClick={handlePrevPage} disabled={page === 1}>
//                 Previous
//               </button>
//               <span>Page {page}</span>
//               <button onClick={handleNextPage} disabled={transactions.length < 50}>
//                 Next
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaSyncAlt } from "react-icons/fa";
import SearchInput from "../components/search-input";
import { timeAgo, getLatestTransactions, initWebSocket, closeWebSocket } from "../utils/api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch paginated transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getLatestTransactions(page, 10); // API wrapper
        setTransactions(response.data.transactions);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);

  // WebSocket for real-time updates
  useEffect(() => {
    const socket = initWebSocket((data) => {
      if (page === 1) {
        setTransactions((prev) => {
          const newTxs = [...data.latestTransactions, ...prev];
          return newTxs.slice(0, 20); // keep only 10 per page
        });
      }
    });

    return () => {
      closeWebSocket();
    };
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
      setLoading(true);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      setLoading(true);
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
        <h1 className="page-title">Transactions</h1>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="detail-item">
            <FaSyncAlt className="load-icon-spin" />
            <span>Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="detail-item">
            <span>No transactions found</span>
          </div>
        ) : (
          <>
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
                {transactions.map((tx) => (
                  <tr key={tx.hash}>
                    <td>
                      <Link href={`/tx/${tx.hash}`}>
                        {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/block/${tx.blockNumber}`}>#{tx.blockNumber}</Link>
                    </td>
                    <td>{tx.timestamp ? timeAgo(tx.timestamp) : "N/A"}</td>
                    <td>
                      <Link href={`/address/${tx.from}`}>
                        {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                      </Link>
                    </td>
                    <td>
                      {tx.to ? (
                        <Link href={`/address/${tx.to}`}>
                          {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                        </Link>
                      ) : (
                        "Contract Creation"
                      )}
                    </td>
                    <td>{tx.value} tUCC</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button onClick={handlePrevPage} disabled={page === 1}>
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={page >= totalPages}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
