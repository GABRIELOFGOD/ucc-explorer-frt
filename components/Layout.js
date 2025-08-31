import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getNetworkInfo } from '../utils/api';
import { IoIosHome } from "react-icons/io";
import { IoCube } from "react-icons/io5";
import { FaExchangeAlt, FaWallet, FaCoins, FaShieldAlt, FaFileContract, FaBook, FaChartLine, FaCopy, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  const router = useRouter();
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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
    
    // Refresh network info every 10 seconds
    const interval = setInterval(fetchNetworkInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/', icon: IoIosHome, label: 'Dashboard' },
    { href: '/blocks', icon: IoCube, label: 'Blocks' },
    { href: '/transactions', icon: FaExchangeAlt, label: 'Transactions' },
    { href: '/addresses', icon: FaWallet, label: 'Addresses' },
    { href: '/tokens', icon: FaCoins, label: 'Tokens' },
    // { href: '/validators', icon: FaShieldAlt, label: 'Validators' },
    { href: '/verify-contract', icon: FaFileContract, label: 'Verify Contract' },
    { href: '/api-docs', icon: FaBook, label: 'API Docs' },
    { href: '/charts', icon: FaChartLine, label: 'Charts' },
    { href: '/login', icon: FaSignInAlt, label: 'Login' },
    { href: '/register', icon: FaUserPlus, label: 'Register' }
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
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
      {children}
      <Toaster position='top-right' />
      
      <style jsx global>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }
        
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: var(--sidebar-width);
          height: 100vh;
          padding: 24px;
          background: var(--main-glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-right: 1px solid rgba(148, 163, 184, 0.3);
          z-index: 40;
          display: flex;
          flex-direction: column;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          margin-bottom: 32px;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--electric-blue), var(--cyber-cyan));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
        }
        
        .logo-text {
          margin-left: 12px;
        }
        
        .logo-text .main {
          font-weight: 600;
          font-size: 16px;
          line-height: 1.2;
        }
        
        .logo-text .sub {
          font-weight: 400;
          font-size: 12px;
          color: var(--gray-400);
          line-height: 1.2;
        }
        
        .network-status {
          background: var(--light-glass);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 24px;
          position: relative;
        }
        
        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10B981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        
        .network-info {
          font-size: 14px;
        }
        
        .network-info .chain-id {
          color: var(--gray-400);
          margin-bottom: 4px;
        }
        
        .network-info .block-height {
          font-weight: 600;
        }
        
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 32px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: white;
          gap: 10px;
        }
        
        .nav-item:hover {
          background: var(--light-glass);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        
        .nav-item.active {
          background: rgba(14, 165, 233, 0.2);
          border: 1px solid var(--electric-blue);
        }
        
        .nav-item i {
          width: 20px;
          height: 20px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .nav-item span {
          font-weight: 500;
          font-size: 14px;
        }
        
        .network-details {
          margin-top: auto;
          position: relative;
        }
        
        .network-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .network-header h3 {
          font-size: 14px;
          font-weight: 600;
        }
        
        .copy-btn {
          background: none;
          border: none;
          color: var(--electric-blue);
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .rpc-url {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--gray-400);
          word-break: break-all;
          background: var(--dark-glass);
          padding: 8px 12px;
          border-radius: 8px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
          }
        }
      `}</style>
    </div>
  );
}