import React from "react";

const Header = () => (
  <div className="bg-[#121418] flex justify-center w-full p-1">
    <div className="w-[90%] flex flex-col md:flex-row justify-around items-center">
      <div>
        <a
          href="https://www.mimic.fi/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <img
            src="https://www.mimic.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-navbar.a5d9ffd0.svg&w=384&q=75"
            alt="Mimic Logo"
            className="h-12 md:mb-0"
          />
        </a>
      </div>
      <div>
        <h1 className="text-3xl font-semibold text-center md:text-left md:flex-1 md:mb-0 mb-2 tracking-wide">
          Workflow Visualizer
        </h1>
      </div>
    </div>
  </div>
);

export default Header;
