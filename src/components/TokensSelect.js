import React from "react";

const TokensSelect = ({
  handleTokenSelectChange,
  tokens,
  tokenAddress,
  handleReset,
}) => (
  <div className="w-full flex flex-col lg:flex-row justify-center items-center p-4">
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
      className="p-2 bg-[#191B23] text-white rounded border border-[#6F5CE6] mr-2 focus:outline-none focus:ring-2 focus:ring-[#6F5CE6] w-full md:w-auto"
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
      className="lg:mt-0 mt-2 lg:ml-2 p-1.5 bg-[#6F5CE6] text-white rounded lg:rounded-r-none border border-[#6F5CE6] focus:outline-none lg:transform lg:hover:-translate-x-0.5"
    >
      Reset
    </button>
    <input
      type="text"
      value={tokenAddress}
      onChange={handleTokenSelectChange}
      placeholder="Enter a token address"
      className="rounded lg:rounded-r-lg bg-[#191B23] p-1.5 px-4 text-white border-[#6F5CE6] lg:rounded-l-none focus:outline-none focus:ring-1 focus:ring-[#6F5CE6] md:mt-0"
    />
  </div>
);

export default TokensSelect;
