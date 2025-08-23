import axios from 'axios';
import io from 'socket.io-client';

// Create axios instance
const api = axios.create({
  // baseURL: 'http://localhost:3001/api',
  baseURL: 'https://ucc.ccpay.space/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to get network info
export const getNetworkInfo = () => api.get('/network');

// Function to get latest blocks
export const getLatestBlocks = (page = 1, limit = 10) => api.get(`/blocks?page=${page}&limit=${limit}`);

// Function to get block by number
export const getBlockByNumber = (number) => api.get(`/blocks/${number}`);

// Function to get latest transactions
export const getLatestTransactions = (page = 1, limit = 10) => api.get(`/transactions?page=${page}&limit=${limit}`);

// Function to get latest transactions for an address
export const getLatestTransactionsForAddress = (address, page = 1, limit = 10) => api.get(`/transactions?page=${page}&limit=${limit}&address=${address}`);

export const getAllAddresses = (page = 1, limit = 10) => api.get(`/addresses?page=${page}&limit=${limit}`);

// Function to get transaction by hash
export const getTransactionByHash = (hash) => api.get(`/transactions/${hash}`);

// Function to get tokens
export const getTokens = () => api.get('/tokens');

// Function to get validators
export const getValidators = () => api.get('/validators');

// Function to search
export const search = (query) => api.get(`/search/${query}`);

// Function to get address info
export const getAddressInfo = (address) => api.get(`/address/${address}`);

// Function to verify contract
export const verifyContract = (data) => api.post('/verify-contract', data);

// Function to get API documentation
export const getApiDocs = () => api.get('/docs');

// export const getContracts = (address) => api.get(`/contracts?address=${address}`);

// Function to get token transactions
export const getTokenTransactions = (contractAddress) => api.get(`/token-transactions/${contractAddress}`);

// Function to get token holders
export const getTokenHolders = (contractAddress) => api.get(`/token-holders/${contractAddress}`);

// Function to register a new user
export const register = (data) => api.post('/register', data);

// Function to login
export const login = (data) => api.post('/login', data);

// Time ago function
export const timeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
};

// WebSocket connection
let socket;

export const initWebSocket = (onData) => {
  if (!socket) {
    // socket = io('http://localhost:3001');
    socket = io('https://ucc.ccpay.space');
    
    socket.on('latestData', (data) => {
      onData(data);
    });
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }
  
  return socket;
};

export const closeWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};