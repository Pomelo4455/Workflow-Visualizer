import React from "react";

const TokensSelect = ({
  handleTokenSelectChange,
  tokens,
  tokenAddress,
  handleReset,
}) => (
  <div className="w-full flex flex-col sm:flex-row justify-center items-center p-4">
    <label
      htmlFor="token-select"
      className="block mr-2 mb-2 sm:mb-0 text-white"
    >
      Select Token:
    </label>
    <select
      id="token-select"
      value={tokenAddress}
      onChange={handleTokenSelectChange}
      className="p-2 bg-[#191B23] text-white rounded border border-[#6F5CE6] focus:outline-none focus:ring-2 focus:ring-[#6F5CE6] w-full md:w-auto"
    >
      <option value="">Select a token</option>
      {tokens.map((token) => (
        <option key={token.id} value={token.id}>
          {token.symbol} - {token.name}
        </option>
      ))}
    </select>
    <button
      onClick={handleReset}
      className="mt-2 sm:mt-0 sm:ml-4 p-2 bg-[#6F5CE6] text-white rounded border border-[#6F5CE6] focus:outline-none focus:ring-2 focus:ring-[#6F5CE6]"
    >
      Reset
    </button>
  </div>
);

export default TokensSelect;
