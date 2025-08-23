// import Web3 from "web3";

// const wsProvider = new Web3.providers.WebsocketProvider("ws://168.231.122.245:8546");
// const web3 = new Web3(wsProvider);

// export const RPC_ADDRESS = "http://168.231.122.245:8545";

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

// // =============== CHAIN ID =============== //
// export const getChainId = async () => {
//   const response = await fetch(RPC_ADDRESS, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       jsonrpc: "2.0",
//       method: "eth_chainId",
//       params: [],
//       id: 1,
//     }),
//   });
//   const data = await response.json();
//   return parseInt(data.result, 16); // hex → number
// };

// // =============== TRANSACTIONS ============= //
// export const subscribePendingTxs = () => {
//   web3.eth.subscribe("pendingTransactions", (err, txHash) => {
//     if (!err) {
//       console.log("Pending TX:", txHash);
//     }
//   });
// };

// // ============== NEW BLOCKS ===================== //
// export const subscribeNewBlocks = () => {
//   web3.eth.subscribe("newBlockHeaders", (err, blockHeader) => {
//     if (!err) {
//       console.log("New Block:", blockHeader);
//     }
//   });
// };

// // ============= FULL BLOCK ===================== //
// const block = await web3.eth.getBlock(blockHeader.number, true);


