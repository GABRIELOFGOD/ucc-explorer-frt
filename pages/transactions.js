import { useState, useEffect } from 'react';
import { timeAgo, getLatestTransactions, initWebSocket, closeWebSocket } from "../utils/api";
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaSearch, FaSyncAlt } from 'react-icons/fa';
import SearchInput from '../components/search-input';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getLatestTransactions(currentPage, 10); // API wrapper
        setTransactions(response.data.transactions);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage]);

  // WebSocket for real-time updates
  useEffect(() => {
    const socket = initWebSocket((data) => {
      if (currentPage === 1) {
        setTransactions((prev) => {
          const newTxs = [...data.latestTransactions, ...prev];
          return newTxs.slice(0, 20); // keep only 10 per page
        });
      }
    });

    return () => {
      closeWebSocket();
    };
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
              className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
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
          <div className="table-title">Transaction List</div>
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
                  <th>Method</th>
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
                          {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div className="method-badge method-transfer">Transfer</div>
                    </td>
                    <td>
                      <Link href={`/block/${tx.blockNumber}`} className="hash-text">
                        #{tx.blockNumber?.toLocaleString()}
                      </Link>
                    </td>
                    <td>{tx.timestamp ? timeAgo(tx.timestamp) : "N/A"}</td>
                    <td>
                      <div className="hash-row">
                        <Link href={`/address/${tx.from}`} className="hash-text">
                          {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
                        </Link>
                      </div>
                    </td>
                    <td>
                      {tx.to ? (
                        <div className="hash-row">
                          <Link href={`/address/${tx.to}`} className="hash-text">
                            {tx.to.substring(0, 6)}...{tx.to.substring(tx.to.length - 4)}
                          </Link>
                        </div>
                      ) : (
                        <div className="hash-text">Contract Creation</div>
                      )}
                    </td>
                    <td>
                      <div className="amount-value amount-in">+{tx.value}</div>
                    </td>
                    <td>
                      <div className="status-badge status-success">Success</div>
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

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { FaChevronLeft, FaChevronRight, FaSyncAlt } from 'react-icons/fa';
// import SearchInput from "../components/search-input";
// import { timeAgo, getLatestTransactions, initWebSocket, closeWebSocket } from "../utils/api";

// export default function Transactions() {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loadingSearch, setLoadingSearch] = useState(false);

//   // Fetch paginated transactions
//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         const response = await getLatestTransactions(page, 10); // API wrapper
//         setTransactions(response.data.transactions);
//         setTotalPages(response.data.totalPages);
//       } catch (error) {
//         console.error("Error fetching transactions:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTransactions();
//   }, [page]);

//   // WebSocket for real-time updates
//   useEffect(() => {
//     const socket = initWebSocket((data) => {
//       if (page === 1) {
//         setTransactions((prev) => {
//           const newTxs = [...data.latestTransactions, ...prev];
//           return newTxs.slice(0, 20); // keep only 10 per page
//         });
//       }
//     });

//     return () => {
//       closeWebSocket();
//     };
//   }, [currentPage]);

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setPage((prev) => prev + 1);
//       setLoading(true);
//     }
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
//         <div className="pagination">
//           <button 
//             className="pagination-btn" 
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//           >
//             <FaChevronLeft />
//           </button>
//           {[...Array(totalPages)].map((_, i) => (
//             <button 
//               key={i + 1}
//               className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
//               onClick={() => handlePageChange(i + 1)}
//             >
//               {i + 1}
//             </button>
//           ))}
//           <button 
//             className="pagination-btn" 
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           >
//             <FaChevronRight />
//           </button>
//         </div>
//       </div>
      
//       <div className="table-container">
//         <div className="table-header">
//           <div className="table-title">Transaction List</div>
//         </div>
        
//         {loading ? (
//           <div className="detail-item">
//             <div className="detail-icon">
//               <FaSyncAlt />
//             </div>
//             <div className="detail-content">
//               <div className="detail-label">Loading transactions...</div>
//             </div>
//           </div>
//         ) : (
//           <div className="table-responsive">
//             <table className="transactions-table">
//               <thead>
//                 <tr>
//                   <th>Txn Hash</th>
//                   <th>Method</th>
//                   <th>Block</th>
//                   <th>Age</th>
//                   <th>From</th>
//                   <th>To</th>
//                   <th>Value</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {transactions.map((tx) => (
//                   <tr key={tx.hash}>
//                     <td>
//                       <div className="hash-row">
//                         <Link href={`/tx/${tx.hash}`} className="hash-text">
//                           {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
//                         </Link>
//                       </div>
//                     </td>
//                     <td>
//                       <div className="method-badge method-transfer">Transfer</div>
//                     </td>
//                     <td>
//                       <Link href={`/block/${tx.blockNumber}`} className="hash-text">
//                         #{tx.blockNumber?.toLocaleString()}
//                       </Link>
//                     </td>
//                     <td>{tx.timestamp ? timeAgo(tx.timestamp) : "N/A"}</td>
//                     <td>
//                       <div className="hash-row">
//                         <Link href={`/address/${tx.from}`} className="hash-text">
//                           {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
//                         </Link>
//                       </div>
//                     </td>
//                     <td>
//                       {tx.to ? (
//                         <div className="hash-row">
//                           <Link href={`/address/${tx.to}`} className="hash-text">
//                             {tx.to.substring(0, 6)}...{tx.to.substring(tx.to.length - 4)}
//                           </Link>
//                         </div>
//                       ) : (
//                         <div className="hash-text">Contract Creation</div>
//                       )}
//                     </td>
//                     <td>
//                       <div className="amount-value amount-in">+{tx.value}</div>
//                     </td>
//                     <td>
//                       <div className="status-badge status-success">Success</div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }