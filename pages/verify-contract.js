// import { useEffect, useState } from "react";
// import { verifyContract } from "../utils/api";
// import Link from "next/link";
// import {
//   FaArrowLeft,
//   FaCheckCircle,
//   FaExclamationCircle,
// } from "react-icons/fa";
// import SearchInput from "../components/search-input";
// import { toast } from "sonner";

// export default function VerifyContract() {
//   const [formData, setFormData] = useState({
//     address: "",
//     sourceCode: "",
//     license: "",
//     compilerVersion: "",
//     optimization: false,
//   });
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [fetchingVersion, setFetchingVersion] = useState(true);
//   const [solVersions, setSolVersions] = useState([]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const contractLicenses = [
//     "MIT",
//     "GPL-3.0",
//     "Apache-2.0",
//     "Unlicense",
//     "Custom"
//   ];

//   if (error) {
//     console.log("ERROR HERE", error);
//   }

//   async function getSolcReleases() {
//     try {
//       const req = await fetch(
//         "https://binaries.soliditylang.org/bin/list.json"
//       );
//       const data = await req.json();

//       if (!data.releases) throw new Error("Invalid releases format");

//       // Convert { "0.8.20": "soljson-v0.8.20+commit.a1b79de6.js", ... }
//       // → [ { version: "0.8.20", build: "v0.8.20+commit.a1b79de6" }, ... ]
//       const versions = Object.entries(data.releases).map(([short, file]) => {
//         const build = file
//           .replace("soljson-", "") // remove prefix
//           .replace(".js", ""); // remove suffix
//         return { version: short, build };
//       });

//       setSolVersions(versions); // Save structured versions list
//     } catch (error) {
//       console.error("Error fetching solc releases:", error);
//       toast.error("Failed fetching sol version");
//     } finally {
//       setFetchingVersion(false);
//     }
//   }

//   useEffect(() => {
//     getSolcReleases();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setResult(null);

//     try {
//       const response = await verifyContract(formData);
//       console.log("Response for verifiedContract", response.data);
//       setResult(response.data);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to verify contract");
//     } finally {
//       setLoading(false);
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
//         <Link href="/" className="back-button">
//           <FaArrowLeft />
//         </Link>
//         <div>
//           <h1 className="page-title">Verify Contract</h1>
//         </div>
//       </div>

//       <div className="table-container">
//         <div className="table-header">
//           <div className="table-title">Contract Verification</div>
//         </div>

//         <form onSubmit={handleSubmit} className="verification-form">
//           <div className="form-group">
//             <label htmlFor="address">Contract Address</label>
//             <input
//               type="text"
//               id="address"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               placeholder="0x..."
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="license">Contract License</label>
//             <select>
//               {contractLicenses.map((license, index) => (
//                 <option key={index} value={license}>
//                   {license}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label htmlFor="compilerVersion">Compiler Version</label>
//             <select
//               id="compilerVersion"
//               name="compilerVersion"
//               value={formData.compilerVersion}
//               onChange={handleChange}
//               required
//             >
//               {solVersions.map((itm, i) => (
//                 <option key={i} value={itm.build}>
//                   {itm.version}
//                 </option>
//               ))}
//               {/* <option value="0.8.24">0.8.24</option>
//               <option value="0.8.23">0.8.23</option>
//               <option value="0.8.22">0.8.22</option>
//               <option value="0.8.21">0.8.21</option>
//               <option value="0.8.20">0.8.20</option>
//               <option value="0.8.19">0.8.19</option>
//               <option value="0.8.18">0.8.18</option>
//               <option value="0.8.17">0.8.17</option>
//               <option value="0.8.16">0.8.16</option>
//               <option value="0.8.15">0.8.15</option>
//               <option value="0.8.14">0.8.14</option>
//               <option value="0.8.13">0.8.13</option>
//               <option value="0.8.12">0.8.12</option>
//               <option value="0.8.11">0.8.11</option>
//               <option value="0.8.10">0.8.10</option>
//               <option value="0.8.9">0.8.9</option>
//               <option value="0.8.8">0.8.8</option>
//               <option value="0.8.7">0.8.7</option>
//               <option value="0.8.6">0.8.6</option>
//               <option value="0.8.5">0.8.5</option>
//               <option value="0.8.4">0.8.4</option>
//               <option value="0.8.3">0.8.3</option>
//               <option value="0.8.2">0.8.2</option>
//               <option value="0.8.1">0.8.1</option>
//               <option value="0.8.0">0.8.0</option>
//               <option value="0.7.6">0.7.6</option>
//               <option value="0.7.5">0.7.5</option>
//               <option value="0.7.4">0.7.4</option>
//               <option value="0.7.3">0.7.3</option>
//               <option value="0.7.2">0.7.2</option>
//               <option value="0.7.1">0.7.1</option>
//               <option value="0.7.0">0.7.0</option>
//               <option value="0.6.12">0.6.12</option>
//               <option value="0.6.11">0.6.11</option>
//               <option value="0.6.10">0.6.10</option>
//               <option value="0.6.9">0.6.9</option>
//               <option value="0.6.8">0.6.8</option>
//               <option value="0.6.7">0.6.7</option>
//               <option value="0.6.6">0.6.6</option>
//               <option value="0.6.5">0.6.5</option>
//               <option value="0.6.4">0.6.4</option>
//               <option value="0.6.3">0.6.3</option>
//               <option value="0.6.2">0.6.2</option>
//               <option value="0.6.1">0.6.1</option>
//               <option value="0.6.0">0.6.0</option>
//               <option value="0.5.17">0.5.17</option>
//               <option value="0.5.16">0.5.16</option>
//               <option value="0.5.15">0.5.15</option>
//               <option value="0.5.14">0.5.14</option>
//               <option value="0.5.13">0.5.13</option>
//               <option value="0.5.12">0.5.12</option>
//               <option value="0.5.11">0.5.11</option>
//               <option value="0.5.10">0.5.10</option>
//               <option value="0.5.9">0.5.9</option>
//               <option value="0.5.8">0.5.8</option>
//               <option value="0.5.7">0.5.7</option>
//               <option value="0.5.6">0.5.6</option>
//               <option value="0.5.5">0.5.5</option>
//               <option value="0.5.4">0.5.4</option>
//               <option value="0.5.3">0.5.3</option>
//               <option value="0.5.2">0.5.2</option>
//               <option value="0.5.1">0.5.1</option>
//               <option value="0.5.0">0.5.0</option> */}
//             </select>
//           </div>

//           <div className="form-group">
//             <label htmlFor="optimization">
//               <input
//                 type="checkbox"
//                 id="optimization"
//                 name="optimization"
//                 checked={formData.optimization}
//                 onChange={handleChange}
//               />
//               Optimization Enabled
//             </label>
//           </div>

//           <div className="form-group">
//             <label htmlFor="sourceCode">Source Code</label>
//             <textarea
//               id="sourceCode"
//               name="sourceCode"
//               value={formData.sourceCode}
//               onChange={handleChange}
//               placeholder="Paste your contract source code here..."
//               rows={10}
//               required
//             ></textarea>
//           </div>

//           <button type="submit" className="submit-button" disabled={loading}>
//             {loading ? "Verifying..." : "Verify Contract"}
//           </button>
//         </form>

//         {error && (
//           <div className="error-message">
//             <FaExclamationCircle /> {error}
//           </div>
//         )}

//         {result && (
//           <div className="success-message">
//             <FaCheckCircle /> {result.message}
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .verification-form {
//           padding: 20px;
//         }

//         .form-group {
//           margin-bottom: 20px;
//         }

//         .form-group label {
//           display: block;
//           margin-bottom: 8px;
//           font-weight: 500;
//         }

//         .form-group input,
//         .form-group select,
//         .form-group textarea {
//           width: 100%;
//           padding: 12px;
//           border-radius: 8px;
//           border: 1px solid var(--gray-600);
//           background: var(--dark-glass);
//           color: white;
//           font-family: "JetBrains Mono", monospace;
//         }

//         .form-group input[type="checkbox"] {
//           width: auto;
//           margin-right: 8px;
//         }

//         .submit-button {
//           background: linear-gradient(
//             135deg,
//             var(--electric-blue),
//             var(--cyber-cyan)
//           );
//           color: white;
//           border: none;
//           padding: 12px 24px;
//           border-radius: 8px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }

//         .submit-button:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
//         }

//         .submit-button:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .error-message {
//           padding: 12px;
//           border-radius: 8px;
//           background: rgba(239, 68, 68, 0.1);
//           border: 1px solid var(--red);
//           color: var(--red);
//           margin-top: 20px;
//         }

//         .success-message {
//           padding: 12px;
//           border-radius: 8px;
//           background: rgba(16, 185, 129, 0.1);
//           border: 1px solid var(--green);
//           color: var(--green);
//           margin-top: 20px;
//         }
//       `}</style>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { verifyContract } from "../utils/api";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import SearchInput from "../components/search-input";
import { toast } from "sonner";

export default function VerifyContract() {
  const [formData, setFormData] = useState({
    address: "",
    sourceCode: "",
    license: "MIT", // Set default value
    compilerVersion: "",
    optimization: false,
    runs: 200, // Add runs field
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fetchingVersion, setFetchingVersion] = useState(true);
  const [solVersions, setSolVersions] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const contractLicenses = [
    "No License (None)",
    "MIT",
    "GPL-3.0",
    "GPL-2.0",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "Unlicense",
    "Custom"
  ];

  if (error) {
    console.log("ERROR HERE", error);
  }

  async function getSolcReleases() {
    try {
      const req = await fetch(
        "https://binaries.soliditylang.org/bin/list.json"
      );
      const data = await req.json();

      if (!data.releases) throw new Error("Invalid releases format");

      // Convert releases to proper format for backend
      const versions = Object.entries(data.releases)
        .map(([short, file]) => {
          const build = file
            .replace("soljson-", "") // remove prefix
            .replace(".js", ""); // remove suffix
          return { version: short, build };
        })
        .sort((a, b) => {
          // Sort versions in descending order (newest first)
          const aVersion = a.version.split('.').map(num => parseInt(num));
          const bVersion = b.version.split('.').map(num => parseInt(num));
          
          for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
            const aPart = aVersion[i] || 0;
            const bPart = bVersion[i] || 0;
            if (aPart !== bPart) {
              return bPart - aPart;
            }
          }
          return 0;
        });

      setSolVersions(versions);
      
      // Set default compiler version to the latest stable
      if (versions.length > 0) {
        setFormData(prev => ({
          ...prev,
          compilerVersion: versions[0].build
        }));
      }
    } catch (error) {
      console.error("Error fetching solc releases:", error);
      toast.error("Failed fetching sol version");
    } finally {
      setFetchingVersion(false);
    }
  }

  useEffect(() => {
    getSolcReleases();
  }, []);

  const validateForm = () => {
    if (!formData.address) {
      setError("Contract address is required");
      return false;
    }
    
    if (!formData.address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Invalid Ethereum address format");
      return false;
    }
    
    if (!formData.compilerVersion) {
      setError("Compiler version is required");
      return false;
    }
    
    if (!formData.sourceCode.trim()) {
      setError("Source code is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prepare the data for the backend
      const requestData = {
        address: formData.address.trim(),
        compilerVersion: formData.compilerVersion,
        optimization: formData.optimization,
        runs: formData.optimization ? (formData.runs || 200) : 200,
        sourceCode: formData.sourceCode.trim(),
        // Add license if your backend expects it
        license: formData.license
      };

      console.log("Sending request:", requestData);
      
      const response = await verifyContract(requestData);
      console.log("Response for verifiedContract", response.data);
      
      if (response.data.success) {
        setResult(response.data);
        toast.success("Contract verified successfully!");
      } else {
        setError(response.data.message || "Verification failed");
        toast.error("Verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          "Failed to verify contract";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="top-nav">
        <SearchInput />
        <div className="network-indicator">
          <div className="status-dot"></div>
          <div className="network-name">Mainnet</div>
        </div>
      </div>

      <div className="page-header">
        <Link href="/" className="back-button">
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="page-title">Verify Contract</h1>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Contract Verification</div>
        </div>

        <form onSubmit={handleSubmit} className="verification-form">
          <div className="form-group">
            <label htmlFor="address">Contract Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="0x..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="license">Contract License</label>
            <select
              id="license"
              name="license"
              value={formData.license}
              onChange={handleChange}
            >
              {contractLicenses.map((license, index) => (
                <option key={index} value={license}>
                  {license}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="compilerVersion">Compiler Version *</label>
            {fetchingVersion ? (
              <div className="loading-message">Loading compiler versions...</div>
            ) : (
              <select
                id="compilerVersion"
                name="compilerVersion"
                value={formData.compilerVersion}
                onChange={handleChange}
                required
              >
                <option value="">Select compiler version</option>
                {solVersions.map((itm, i) => (
                  <option key={i} value={itm.build}>
                    {itm.version}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group optimization-group">
            <label htmlFor="optimization" className="checkbox-label">
              <input
                type="checkbox"
                id="optimization"
                name="optimization"
                checked={formData.optimization}
                onChange={handleChange}
              />
              Optimization Enabled
            </label>
            
            {formData.optimization && (
              <div className="runs-input">
                <label htmlFor="runs">Runs</label>
                <input
                  type="number"
                  id="runs"
                  name="runs"
                  value={formData.runs}
                  onChange={handleChange}
                  min="1"
                  max="999999"
                  placeholder="200"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="sourceCode">Source Code *</label>
            <textarea
              id="sourceCode"
              name="sourceCode"
              value={formData.sourceCode}
              onChange={handleChange}
              placeholder="Paste your contract source code here..."
              rows={15}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Verifying..." : "Verify Contract"}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <FaExclamationCircle /> 
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {result && (
          <div className="result-container">
            <div className={result.success ? "success-message" : "error-message"}>
              {result.success ? <FaCheckCircle /> : <FaExclamationCircle />}
              <div>
                <strong>{result.success ? "Success:" : "Failed:"}</strong> {result.message}
                {result.matchScore && (
                  <div className="match-score">Match Score: {result.matchScore}%</div>
                )}
                {result.contractName && (
                  <div className="contract-name">Contract: {result.contractName}</div>
                )}
              </div>
            </div>
            
            {result.success && result.abi && (
              <div className="abi-section">
                <h3>Contract ABI</h3>
                <pre className="abi-code">
                  {JSON.stringify(result.abi, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .verification-form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--gray-600);
          background: var(--dark-glass);
          color: white;
          font-family: "JetBrains Mono", monospace;
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          cursor: pointer;
        }

        .form-group input[type="checkbox"] {
          width: auto !important;
          margin-right: 8px;
        }

        .optimization-group {
          border: 1px solid var(--gray-600);
          border-radius: 8px;
          padding: 15px;
          background: var(--dark-glass);
        }

        .runs-input {
          margin-top: 10px;
          margin-left: 24px;
        }

        .runs-input input {
          max-width: 150px;
        }

        .loading-message {
          padding: 12px;
          color: var(--gray-400);
          font-style: italic;
        }

        .submit-button {
          background: linear-gradient(
            135deg,
            var(--electric-blue),
            var(--cyber-cyan)
          );
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          font-size: 16px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 15px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--red);
          color: var(--red);
          margin-top: 20px;
        }

        .success-message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 15px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--green);
          color: var(--green);
          margin-top: 20px;
        }

        .result-container {
          margin-top: 20px;
        }

        .match-score,
        .contract-name {
          font-size: 14px;
          margin-top: 5px;
          opacity: 0.8;
        }

        .abi-section {
          margin-top: 20px;
          padding: 15px;
          border-radius: 8px;
          background: var(--dark-glass);
          border: 1px solid var(--gray-600);
        }

        .abi-section h3 {
          margin: 0 0 10px 0;
          color: var(--electric-blue);
        }

        .abi-code {
          background: rgba(0, 0, 0, 0.5);
          padding: 15px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          color: var(--gray-300);
          max-height: 400px;
          overflow-y: auto;
        }

        textarea {
          min-height: 200px;
          font-size: 13px;
          line-height: 1.4;
        }

        /* Responsive improvements */
        @media (max-width: 768px) {
          .verification-form {
            padding: 15px;
          }
          
          .runs-input {
            margin-left: 0;
            margin-top: 15px;
          }
        }
      `}</style>
    </div>
  );
}
