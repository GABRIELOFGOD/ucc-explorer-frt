// import Web3 from "web3";

// export const RPC_ADDRESS = "http://168.231.122.245:8545";
// export const WS_ADDRESS  = "ws://168.231.122.245:8546";

// const web3 = new Web3(new Web3.providers.HttpProvider(RPC_ADDRESS));
// const web3ws = new Web3(new Web3.providers.WebsocketProvider(WS_ADDRESS));

// // ========= VALIDATORS =============== //
// export const getValidators = async () => {
//   try {
//     const response = await fetch(RPC_ADDRESS, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         jsonrpc: "2.0",
//         method: "clique_getSigners",
//         params: ["latest"],
//         id: 1,
//       }),
//     });

//     const data = await response.json();
//     return data.result; // this will be an array of validator addresses
//   } catch (error) {
//     console.error("Error fetching validators:", error);
//     return [];
//   }
// };

// // Chain ID
// export const getChainId = async () => {
//   const id = await web3.eth.getChainId();
//   return id;
// };

// // New Transactions
// export const subscribePendingTxs = (cb) => {
//   web3ws.eth.subscribe("pendingTransactions")
//     .on("data", (txHash) => cb(txHash))
//     .on("error", console.error);
// };

// // New Blocks
// export const subscribeNewBlocks = (cb) => {
//   web3ws.eth.subscribe("newBlockHeaders")
//     .on("data", (blockHeader) => cb(blockHeader))
//     .on("error", console.error);
// };

// // Block by number
// export const getBlock = async (blockNumber) => {
//   return await web3.eth.getBlock(blockNumber, true);
// };

import Web3 from "web3";

export const RPC_ADDRESS = "http://168.231.122.245:8545";
export const WS_ADDRESS = "ws://168.231.122.245:8546";

// Initialize Web3 instances with better error handling
let web3, web3ws;

const initializeWeb3 = () => {
  try {
    web3 = new Web3(new Web3.providers.HttpProvider(RPC_ADDRESS, {
      timeout: 10000,
      headers: [
        { name: 'Access-Control-Allow-Origin', value: '*' }
      ]
    }));

    web3ws = new Web3(new Web3.providers.WebsocketProvider(WS_ADDRESS, {
      timeout: 30000,
      reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 5,
        onTimeout: false,
      }
    }));

    // Handle WebSocket connection events
    web3ws.currentProvider.on('connect', () => {
      console.log('✅ WebSocket connected to Besu node');
    });

    web3ws.currentProvider.on('disconnect', () => {
      console.log('❌ WebSocket disconnected from Besu node');
    });

    web3ws.currentProvider.on('error', (error) => {
      console.error('🚨 WebSocket error:', error);
    });

  } catch (error) {
    console.error('Failed to initialize Web3:', error);
  }
};

// Initialize on module load
initializeWeb3();

// ========= CONNECTION STATUS =============== //
export const checkConnection = async () => {
  try {
    const isConnected = await web3.eth.net.isListening();
    const networkId = await web3.eth.net.getId();
    const blockNumber = await web3.eth.getBlockNumber();
    
    return {
      connected: isConnected,
      networkId,
      currentBlock: blockNumber,
      rpcUrl: RPC_ADDRESS,
      wsUrl: WS_ADDRESS
    };
  } catch (error) {
    console.error('Connection check failed:', error);
    return { connected: false, error: error.message };
  }
};

// ========= NETWORK INFO =============== //
export const getNetworkInfo = async () => {
  try {
    const [chainId, networkId, blockNumber, gasPrice, peerCount] = await Promise.all([
      web3.eth.getChainId(),
      web3.eth.net.getId(),
      web3.eth.getBlockNumber(),
      web3.eth.getGasPrice(),
      web3.eth.net.getPeerCount()
    ]);

    return {
      chainId,
      networkId,
      currentBlock: blockNumber,
      gasPrice,
      peerCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching network info:', error);
    return null;
  }
};

// ========= VALIDATORS =============== //
export const getValidators = async () => {
  try {
    const response = await fetch(RPC_ADDRESS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "clique_getSigners",
        params: ["latest"],
        id: 1,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('RPC error:', data.error);
      return [];
    }
    
    return data.result || [];
  } catch (error) {
    console.error("Error fetching validators:", error);
    return [];
  }
};

// ========= BASIC GETTERS =============== //
export const getChainId = async () => {
  try {
    return await web3.eth.getChainId();
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

export const getBlock = async (blockNumber) => {
  try {
    return await web3.eth.getBlock(blockNumber, true);
  } catch (error) {
    console.error(`Error getting block ${blockNumber}:`, error);
    return null;
  }
};

export const getTransaction = async (txHash) => {
  try {
    return await web3.eth.getTransaction(txHash);
  } catch (error) {
    console.error(`Error getting transaction ${txHash}:`, error);
    return null;
  }
};

export const getTransactionReceipt = async (txHash) => {
  try {
    return await web3.eth.getTransactionReceipt(txHash);
  } catch (error) {
    console.error(`Error getting transaction receipt ${txHash}:`, error);
    return null;
  }
};

// ========= ENHANCED SUBSCRIPTIONS =============== //
export const subscribePendingTxs = (callback) => {
  if (!web3ws || !web3ws.currentProvider.connected) {
    console.error('WebSocket not connected');
    return null;
  }

  try {
    const subscription = web3ws.eth.subscribe("pendingTransactions")
      .on("connected", (subscriptionId) => {
        console.log(`📤 Subscribed to pending transactions: ${subscriptionId}`);
      })
      .on("data", async (txHash) => {
        try {
          // Get full transaction details
          const tx = await getTransaction(txHash);
          callback({ txHash, transaction: tx });
        } catch (error) {
          callback({ txHash, error: error.message });
        }
      })
      .on("error", (error) => {
        console.error("Pending transactions subscription error:", error);
        callback({ error: error.message });
      });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to pending transactions:', error);
    return null;
  }
};

export const subscribeNewBlocks = (callback) => {
  if (!web3ws || !web3ws.currentProvider.connected) {
    console.error('WebSocket not connected');
    return null;
  }

  try {
    const subscription = web3ws.eth.subscribe("newBlockHeaders")
      .on("connected", (subscriptionId) => {
        console.log(`🟢 Subscribed to new blocks: ${subscriptionId}`);
      })
      .on("data", async (blockHeader) => {
        try {
          // Get full block details with transactions
          const fullBlock = await getBlock(blockHeader.number);
          callback({ 
            blockHeader, 
            fullBlock,
            blockNumber: blockHeader.number,
            txCount: fullBlock?.transactions?.length || 0
          });
        } catch (error) {
          callback({ blockHeader, error: error.message });
        }
      })
      .on("error", (error) => {
        console.error("New blocks subscription error:", error);
        callback({ error: error.message });
      });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to new blocks:', error);
    return null;
  }
};

// ========= CONTINUOUS MONITORING =============== //
export class BesuMonitor {
  constructor() {
    this.blockSubscription = null;
    this.txSubscription = null;
    this.isRunning = false;
    this.callbacks = {
      onNewBlock: [],
      onPendingTx: [],
      onError: []
    };
  }

  // Add event listeners
  onNewBlock(callback) {
    this.callbacks.onNewBlock.push(callback);
  }

  onPendingTransaction(callback) {
    this.callbacks.onPendingTx.push(callback);
  }

  onError(callback) {
    this.callbacks.onError.push(callback);
  }

  // Start monitoring
  async start() {
    if (this.isRunning) {
      console.log('Monitor is already running');
      return;
    }

    try {
      const connectionInfo = await checkConnection();
      if (!connectionInfo.connected) {
        throw new Error(`Cannot connect to Besu node: ${connectionInfo.error}`);
      }

      console.log('🚀 Starting Besu Monitor...');
      console.log(`📊 Connected to network ${connectionInfo.networkId}, current block: ${connectionInfo.currentBlock}`);

      this.isRunning = true;

      // Subscribe to new blocks
      this.blockSubscription = subscribeNewBlocks((data) => {
        if (data.error) {
          this.callbacks.onError.forEach(cb => cb(data.error));
        } else {
          console.log(`\n🟢 NEW BLOCK #${data.blockNumber} with ${data.txCount} transactions`);
          this.callbacks.onNewBlock.forEach(cb => cb(data));
        }
      });

      // Subscribe to pending transactions
      this.txSubscription = subscribePendingTxs((data) => {
        if (data.error) {
          this.callbacks.onError.forEach(cb => cb(data.error));
        } else {
          console.log(`📤 Pending TX: ${data.txHash}`);
          this.callbacks.onPendingTx.forEach(cb => cb(data));
        }
      });

      console.log('✅ Monitor started successfully');

    } catch (error) {
      console.error('Failed to start monitor:', error);
      this.callbacks.onError.forEach(cb => cb(error.message));
    }
  }

  // Stop monitoring
  stop() {
    if (!this.isRunning) {
      console.log('Monitor is not running');
      return;
    }

    console.log('🛑 Stopping Besu Monitor...');

    try {
      if (this.blockSubscription) {
        this.blockSubscription.unsubscribe();
        this.blockSubscription = null;
      }

      if (this.txSubscription) {
        this.txSubscription.unsubscribe();
        this.txSubscription = null;
      }

      this.isRunning = false;
      console.log('✅ Monitor stopped successfully');

    } catch (error) {
      console.error('Error stopping monitor:', error);
    }
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasBlockSubscription: !!this.blockSubscription,
      hasTxSubscription: !!this.txSubscription,
      listenerCounts: {
        blocks: this.callbacks.onNewBlock.length,
        transactions: this.callbacks.onPendingTx.length,
        errors: this.callbacks.onError.length
      }
    };
  }
}

// Export a default monitor instance
export const monitor = new BesuMonitor();

// ========= UTILITY FUNCTIONS =============== //
export const formatBlock = (block) => {
  if (!block) return null;
  
  return {
    number: block.number,
    hash: block.hash,
    parentHash: block.parentHash,
    timestamp: new Date(block.timestamp * 1000).toISOString(),
    transactionCount: block.transactions?.length || 0,
    gasUsed: block.gasUsed,
    gasLimit: block.gasLimit,
    miner: block.miner,
    difficulty: block.difficulty,
    size: block.size
  };
};

export const formatTransaction = (tx) => {
  if (!tx) return null;
  
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: web3.utils.fromWei(tx.value || '0', 'ether'),
    gasPrice: tx.gasPrice,
    gas: tx.gas,
    nonce: tx.nonce,
    blockNumber: tx.blockNumber,
    transactionIndex: tx.transactionIndex
  };
};

// ========= CLEANUP =============== //
process.on('SIGINT', () => {
  console.log('\n🔄 Gracefully shutting down...');
  monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Gracefully shutting down...');
  monitor.stop();
  process.exit(0);
});