
const ReadContract = ({ provider, handleReadFunctionChange, selectedReadFunction, readFunctions, getFunctionSignature, handleReadParamChange, readParams, handleReadFunctionCall, contract, readLoading, readResult }) => {
  return (
    <div className="table-container">
      <div className="table-header">
        <div className="table-title">Read Contract</div>
        <div className="wallet-status">
          {provider ? (
            <span className="connected">✓ Provider Connected</span>
          ) : (
            <span className="disconnected">✗ No Provider</span>
          )}
        </div>
      </div>

      <div className="read-contract">
        <div className="form-group">
          <label htmlFor="readFunction">Select Function</label>
          <select
            id="readFunction"
            className="function-select"
            onChange={handleReadFunctionChange}
            value={selectedReadFunction?.name || ""}
          >
            <option value="">Select a function</option>
            {readFunctions.map((func, index) => (
              <option key={index} value={func.name}>
                {getFunctionSignature(func)}
              </option>
            ))}
          </select>
        </div>

        {selectedReadFunction &&
          selectedReadFunction.inputs &&
          selectedReadFunction.inputs.length > 0 && (
            <div className="form-group">
              <label>Parameters</label>
              {selectedReadFunction.inputs.map((input, index) => (
                <div key={index} className="param-input-group">
                  <label className="param-label">
                    {input.name} ({input.type})
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${input.type} value`}
                    className="function-param"
                    value={readParams[input.name] || ""}
                    onChange={(e) =>
                      handleReadParamChange(input.name, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}

        <button
          className="submit-button"
          onClick={handleReadFunctionCall}
          disabled={!selectedReadFunction || readLoading || !contract}
        >
          {readLoading ? "Querying..." : "Query"}
        </button>

        {readResult && (
          <div className="result-section">
            <div className="result-label">Result:</div>
            <div className="result-value">
              <pre>{readResult}</pre>
            </div>
          </div>
        )}

        {selectedReadFunction && (
          <div className="function-info">
            <h4>Function Details:</h4>
            <p><strong>Name:</strong> {selectedReadFunction.name}</p>
            <p><strong>Type:</strong> {selectedReadFunction.stateMutability}</p>
            {selectedReadFunction.outputs && selectedReadFunction.outputs.length > 0 && (
              <p><strong>Returns:</strong> {selectedReadFunction.outputs.map(o => o.type).join(', ')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default ReadContract;