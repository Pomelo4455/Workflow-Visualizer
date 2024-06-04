import React from "react";
import TokensSelect from "./TokensSelect";
import "../app/globals.css";

const TaskList = ({
  groups,
  handleTaskClick,
  setGroupRef,
  highlightedGroup,
  tokenAddress,
  balances,
  handleTokenSelectChange,
  tokens,
  handleReset,
  balanceIdToName,
}) => {
  const getUniqueKey = (group) => {
    const [type, value] = group.name.split(": ");
    return {
      fullKey: `${type.trim()}-${value.trim()}`,
      connectorKey: value.trim(),
    };
  };

  const formatTokenAmount = (amount, decimals) => {
    return (amount / Math.pow(10, decimals)).toLocaleString();
  };

  return (
    <div className="mx-10 px-4 py-8">
      <TokensSelect
        handleTokenSelectChange={handleTokenSelectChange}
        tokens={tokens}
        tokenAddress={tokenAddress}
        handleReset={handleReset}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group, groupIndex) => {
          const { fullKey, connectorKey } = getUniqueKey(group);
          const balanceConnector = balances.find(
            (balanceConnector) => balanceConnector.connector === connectorKey
          );

          // Filter balance connectors based on the tokenAddress
          const tokenBalances = balanceConnector
            ? balanceConnector.balances.filter(
                (bal) => bal.token.id === tokenAddress
              )
            : [];

          if (tokenAddress && tokenBalances.length === 0) {
            return null; // Skip this group if there are no matching token balances
          }

          return (
            <div
              key={groupIndex}
              className={`mb-8 p-4 border-2 border-[#6F5CE6] rounded-md group-box ${
                highlightedGroup === fullKey ? "highlighted" : ""
              }`}
              ref={(el) => setGroupRef(fullKey, el)}
            >
              <h2 className="text-md font-thin mb-6 break-words">
                {group.name}
              </h2>
              {balanceIdToName[connectorKey] && (
                <div className="text-left text-lg font-bold mb-2 rounded-full border-2 border-[#6F5CE6] w-fit px-2">
                  {balanceIdToName[connectorKey]}{" "}
                </div>
              )}
              <div className="flex items-center justify-center mb-6">
                {tokenBalances.map((tokenBalance, index) => (
                  <div
                    key={index}
                    className="bg-[#6F5CE6] p-3 rounded-md text-xl"
                  >
                    <span>
                      {formatTokenAmount(
                        tokenBalance.amount,
                        tokenBalance.token.decimals
                      )}{" "}
                      {tokenBalance.token.symbol}
                    </span>
                  </div>
                ))}
              </div>
              {group.subdivisions.map((subdivision, subIndex) => (
                <div
                  key={subIndex}
                  className="mb-6 p-4 border-2 border-[#6F5CE6] rounded-md subdivision-box relative"
                >
                  <h3 className="text-sm font-thin mt-6 md:mt-2 mb-4 break-words">
                    {subdivision.name}
                  </h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 py-1">
                    {subdivision.tasks.map((task, index) => (
                      <button
                        key={index}
                        className="bg-transparent hover:bg-[#6F5CE6] hover:text-white border-[#6F5CE6] border text-white px-5 py-2 rounded-sm cursor-pointer transition-colors duration-200 w-full sm:w-auto shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                        onClick={() => handleTaskClick(task)}
                      >
                        {task.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
