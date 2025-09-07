// import { useState } from "react";
// import { ethers } from "ethers";

// const WriteContract = () => {
//   const [walletConnected, setWalletConnected] = useState(false);
//   const [writeLoading, setWriteLoading] = useState(false);
//   const [selectedWriteFunction, setSelectedWriteFunction] = useState(null);

//   // Connect wallet function
//   const connectWallet = async () => {
//     if (typeof window !== "undefined" && window.ethereum) {
//       try {
//         await window.ethereum.request({ method: "eth_requestAccounts" });
        
//         let web3Provider;
//         if (ethers.providers) {
//           // Ethers v5
//           web3Provider = new ethers.providers.Web3Provider(window.ethereum);
//         } else {
//           // Ethers v6
//           web3Provider = new ethers.BrowserProvider(window.ethereum);
//         }
        
//         setProvider(web3Provider);
//         const signerInstance = await web3Provider.getSigner();
//         setSigner(signerInstance);
//         // setWalletConnected(true);
//       } catch (error) {
//         console.error("Error connecting wallet:", error);
//         alert("Failed to connect wallet. Please try again.");
//       }
//     } else {
//       alert("Please install MetaMask or another Web3 wallet to interact with contracts.");
//     }
//   };
  
//   return (
//     <div className="table-container">
//       <div className="table-header">
//         <div className="table-title">Write Contract</div>
//         <div className="wallet-status">
//           {walletConnected ? (
//             <span className="connected">✓ Wallet Connected</span>
//           ) : (
//             <button className="connect-button" onClick={connectWallet}>
//               Connect Wallet
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="write-contract">
//         <div className="form-group">
//           <label htmlFor="writeFunction">Select Function</label>
//           <select
//             id="writeFunction"
//             className="function-select"
//             onChange={handleWriteFunctionChange}
//             value={selectedWriteFunction?.name || ""}
//           >
//             <option value="">Select a function</option>
//             {writeFunctions.map((func, index) => (
//               <option key={index} value={func.name}>
//                 {getFunctionSignature(func)}
//               </option>
//             ))}
//           </select>
//         </div>

//         {selectedWriteFunction &&
//           selectedWriteFunction.inputs &&
//           selectedWriteFunction.inputs.length > 0 && (
//             <div className="form-group">
//               <label>Parameters</label>
//               {selectedWriteFunction.inputs.map((input, index) => (
//                 <div key={index} className="param-input-group">
//                   <label className="param-label">
//                     {input.name} ({input.type})
//                   </label>
//                   <input
//                     type="text"
//                     placeholder={`Enter ${input.type} value`}
//                     className="function-param"
//                     value={writeParams[input.name] || ""}
//                     onChange={(e) =>
//                       handleWriteParamChange(input.name, e.target.value)
//                     }
//                   />
//                 </div>
//               ))}
//             </div>
//           )}

//         {selectedWriteFunction?.stateMutability === 'payable' && (
//           <div className="form-group">
//             <label className="param-label">Value (ETH)</label>
//             <input
//               type="text"
//               placeholder="Enter ETH amount to send"
//               className="function-param"
//               value={writeParams['_value'] || ""}
//               onChange={(e) =>
//                 handleWriteParamChange('_value', e.target.value)
//               }
//             />
//           </div>
//         )}

//         <button
//           className="submit-button"
//           onClick={handleWriteFunctionCall}
//           disabled={!selectedWriteFunction || writeLoading || !walletConnected || !contract}
//         >
//           {writeLoading ? "Processing..." : "Write"}
//         </button>

//         {selectedWriteFunction && (
//           <div className="function-info">
//             <h4>Function Details:</h4>
//             <p><strong>Name:</strong> {selectedWriteFunction.name}</p>
//             <p><strong>Type:</strong> {selectedWriteFunction.stateMutability}</p>
//             {selectedWriteFunction.stateMutability === 'payable' && (
//               <p className="payable-warning">⚠️ This function can receive ETH</p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
// export default WriteContract;

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

const WriteContract = ({ contractAddress, abi }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [writeLoading, setWriteLoading] = useState(false);
  const [selectedWriteFunction, setSelectedWriteFunction] = useState(null);
  const [writeParams, setWriteParams] = useState({});

  // connect wallet
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

        // create contract instance
        const contractInstance = new ethers.Contract(
          contractAddress,
          abi,
          signerInstance
        );
        setContract(contractInstance);

        setWalletConnected(true);
        console.log("✅ Wallet connected");
      } catch (error) {
        console.error("Error connecting wallet:", error);
        toast.error("Failed to connect wallet. Please try again.");
      }
    } else {
      toast.info("Please install MetaMask or another Web3 wallet.");
    }
  };

  // auto-trigger connectWallet on mount
  useEffect(() => {
    connectWallet();
  }, []);

  // handle function selection
  const handleWriteFunctionChange = (e) => {
    const funcName = e.target.value;
    const func = abi.find((f) => f.name === funcName && f.type === "function");
    setSelectedWriteFunction(func);
    setWriteParams({});
  };

  // handle params
  const handleWriteParamChange = (name, value) => {
    setWriteParams((prev) => ({ ...prev, [name]: value }));
  };

  // call write function
  const handleWriteFunctionCall = async () => {
    if (!contract || !selectedWriteFunction) return;
    try {
      setWriteLoading(true);

      let args = selectedWriteFunction.inputs.map(
        (input) => writeParams[input.name] || ""
      );

      let overrides = {};
      if (selectedWriteFunction.stateMutability === "payable") {
        overrides.value = ethers.utils.parseEther(
          writeParams["_value"] || "0"
        );
      }

      const tx = await contract[selectedWriteFunction.name](...args, overrides);
      console.log("⏳ Transaction sent:", tx.hash);
      await tx.wait();
      console.log("✅ Transaction confirmed:", tx.hash);
      toast.success("Transaction confirmed!");
    } catch (error) {
      console.error("❌ Error calling function:", error);
      toast.error("Transaction failed.");
    } finally {
      setWriteLoading(false);
    }
  };

  // helper: function signature
  const getFunctionSignature = (func) => {
    const inputs = func.inputs.map((i) => i.type).join(", ");
    return `${func.name}(${inputs})`;
  };

  const writeFunctions = abi.filter(
    (f) => f.type === "function" && f.stateMutability !== "view"
  );

  return (
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

        {selectedWriteFunction?.stateMutability === "payable" && (
          <div className="form-group">
            <label className="param-label">Value (ETH)</label>
            <input
              type="text"
              placeholder="Enter ETH amount to send"
              className="function-param"
              value={writeParams["_value"] || ""}
              onChange={(e) =>
                handleWriteParamChange("_value", e.target.value)
              }
            />
          </div>
        )}

        <button
          className="submit-button"
          onClick={handleWriteFunctionCall}
          disabled={
            !selectedWriteFunction || writeLoading || !walletConnected || !contract
          }
        >
          {writeLoading ? "Processing..." : "Write"}
        </button>

        {selectedWriteFunction && (
          <div className="function-info">
            <h4>Function Details:</h4>
            <p><strong>Name:</strong> {selectedWriteFunction.name}</p>
            <p><strong>Type:</strong> {selectedWriteFunction.stateMutability}</p>
            {selectedWriteFunction.stateMutability === "payable" && (
              <p className="payable-warning">⚠️ This function can receive ETH</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteContract;
