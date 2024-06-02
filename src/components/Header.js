import React from "react";

const Header = ({ tokenAddress, handleTokenAddressChange }) => (
  <div className="bg-[#121418] flex flex-col md:flex-row w-full h-fit p-4 items-center">
    <a href="https://www.mimic.fi/" target="_blank" rel="noopener noreferrer">
      <img
        src="https://www.mimic.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-navbar.a5d9ffd0.svg&w=384&q=75"
        alt="Mimic Logo"
        className="h-12 mb-4 md:mb-0"
      />
    </a>
    <h1 className="text-4xl font-semibold text-center md:flex-1 tracking-wide">
      Workflow Visualizer
    </h1>
    <input
      type="text"
      value={tokenAddress}
      onChange={handleTokenAddressChange}
      placeholder="Enter a token address"
      className="rounded-lg bg-[#191B23] p-2 px-4 text-white border border-[#191B23] focus:outline-none focus:ring-1 focus:ring-[#6F5CE6] mt-4 md:mt-0"
    />
  </div>
);

export default Header;
