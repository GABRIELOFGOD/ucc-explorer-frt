// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import { getNetworkInfo } from '../utils/api';
// import { IoIosHome } from "react-icons/io";
// import { IoCube } from "react-icons/io5";
// import { FaExchangeAlt, FaWallet, FaCoins, FaShieldAlt, FaFileContract, FaBook, FaChartLine, FaCopy, FaSignInAlt, FaUserPlus } from "react-icons/fa";
// import { Toaster } from 'sonner';

// export default function Layout({ children }) {
//   const router = useRouter();
//   const [networkInfo, setNetworkInfo] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchNetworkInfo = async () => {
//       try {
//         const response = await getNetworkInfo();
//         setNetworkInfo(response.data);
//       } catch (error) {
//         console.error('Error fetching network info:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNetworkInfo();
    
//     // Refresh network info every 10 seconds
//     const interval = setInterval(fetchNetworkInfo, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const navItems = [
//     { href: '/', icon: IoIosHome, label: 'Dashboard' },
//     { href: '/blocks', icon: IoCube, label: 'Blocks' },
//     { href: '/transactions', icon: FaExchangeAlt, label: 'Transactions' },
//     { href: '/addresses', icon: FaWallet, label: 'Addresses' },
//     { href: '/tokens', icon: FaCoins, label: 'Tokens' },
//     // { href: '/validators', icon: FaShieldAlt, label: 'Validators' },
//     { href: '/verify-contract', icon: FaFileContract, label: 'Verify Contract' },
//     { href: '/api-docs', icon: FaBook, label: 'API Docs' },
//     { href: '/charts', icon: FaChartLine, label: 'Charts' },
//     { href: '/login', icon: FaSignInAlt, label: 'Login' },
//     { href: '/register', icon: FaUserPlus, label: 'Register' }
//   ];

//   return (
//     <div className="layout">
//       {/* Sidebar */}
//       <div className="sidebar">
//         <div className="logo-section">
//           <div className="logo-icon">UC</div>
//           <div className="logo-text">
//             <div className="main">Universe Chain</div>
//             <div className="sub">Testnet Explorer</div>
//           </div>
//         </div>
        
//         <div className="network-status">
//           <div className="status-header">
//             <div className="network-info">
//               <div className="chain-id">Chain ID: {loading ? 'Loading...' : networkInfo?.chainId || 'N/A'}</div>
//               <div className="block-height">Block: {loading ? 'Loading...' : networkInfo?.blockHeight?.toLocaleString() || 'N/A'}</div>
//             </div>
//             <div className="status-dot"></div>
//           </div>
//         </div>
        
//         <div className="nav-menu">
//           {navItems.map(({ href, label, icon: Icon }) => (
//             <Link 
//               key={href}
//               href={href}
//               className={`nav-item ${router.pathname === href ? 'active' : ''}`}
//             >
//               <Icon />
//               <span>{label}</span>
//             </Link>
//           ))}
//         </div>
        
//         <div className="network-details">
//           <div className="network-header">
//             <h3>Network</h3>
//             <button className="copy-btn">
//               <FaCopy />
//             </button>
//           </div>
//           <div className="rpc-url">https://rpc.ucscan.net</div>
//         </div>
//       </div>
      
//       {/* Main content */}
//       {children}
//       <Toaster position='top-right' />
      
      
//     </div>
//   );
// }

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getNetworkInfo } from '../utils/api';
import { IoIosHome } from "react-icons/io";
import { IoCube } from "react-icons/io5";
import { FaExchangeAlt, FaWallet, FaCoins, FaFileContract, FaBook, FaChartLine, FaCopy, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  const router = useRouter();
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const response = await getNetworkInfo();
        setNetworkInfo(response.data);
      } catch (error) {
        console.error('Error fetching network info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInfo();
    const interval = setInterval(fetchNetworkInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/', icon: IoIosHome, label: 'Dashboard' },
    { href: '/blocks', icon: IoCube, label: 'Blocks' },
    { href: '/transactions', icon: FaExchangeAlt, label: 'Transactions' },
    { href: '/addresses', icon: FaWallet, label: 'Addresses' },
    { href: '/tokens', icon: FaCoins, label: 'Tokens' },
    { href: '/verify-contract', icon: FaFileContract, label: 'Verify Contract' },
    { href: '/api-docs', icon: FaBook, label: 'API Docs' },
    { href: '/charts', icon: FaChartLine, label: 'Charts' },
    { href: '/login', icon: FaSignInAlt, label: 'Login' },
    { href: '/register', icon: FaUserPlus, label: 'Register' }
  ];

  return (
    <div className="layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className="mobile-logo">UC</div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo-section">
          <div className="logo-icon">UC</div>
          <div className="logo-text">
            <div className="main">Universe Chain</div>
            <div className="sub">Testnet Explorer</div>
          </div>
        </div>
        
        <div className="network-status">
          <div className="status-header">
            <div className="network-info">
              <div className="chain-id">Chain ID: {loading ? 'Loading...' : networkInfo?.chainId || 'N/A'}</div>
              <div className="block-height">Block: {loading ? 'Loading...' : networkInfo?.blockHeight?.toLocaleString() || 'N/A'}</div>
            </div>
            <div className="status-dot"></div>
          </div>
        </div>
        
        <div className="nav-menu">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link 
              key={href}
              href={href}
              className={`nav-item ${router.pathname === href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)} // close menu on navigation
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </div>
        
        <div className="network-details">
          <div className="network-header">
            <h3>Network</h3>
            <button className="copy-btn">
              <FaCopy />
            </button>
          </div>
          <div className="rpc-url">https://rpc.ucscan.net</div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="main-content">{children}</main>
      <Toaster position='top-right' />
    </div>
  );
}
