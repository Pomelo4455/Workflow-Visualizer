import React, { useRef, useEffect, useState } from "react";
import { useTaskInfo } from "@/hooks/useTaskInfo";

const TaskModal = ({ selectedTask, setSelectedTask, tokens }) => {
  const modalRef = useRef();
  const { taskInfo, fetchTaskInfo } = useTaskInfo();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setSelectedTask(null);
      setIsModalVisible(false);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      setLoading(true);
      fetchTaskInfo(selectedTask.id).finally(() => {
        setLoading(false);
        setIsModalVisible(true);
      });
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTask, fetchTaskInfo]);

  if (!selectedTask) return null;

  const weiToPercentage = (wei) => {
    return (wei / 1e16).toFixed(2) + "%"; // Convert wei to percentage
  };

  const renderField = (label, value, isWei = false) => {
    if (
      value === null ||
      value === undefined ||
      value === "Unknown (Unknown)" ||
      value === "undefined (undefined)" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return null;
    }
    return (
      <p className="mb-2">
        <span className="font-bold">{label}:</span>{" "}
        {Array.isArray(value)
          ? value
              .map((val) => (isWei ? `${val} (${weiToPercentage(val)})` : val))
              .join(", ")
          : isWei
          ? `${value} (${weiToPercentage(value)})`
          : value}
      </p>
    );
  };

  const getTokenSymbolById = (id) => {
    const token = tokens.find((token) => token.id === id);
    return token ? `${id} (${token.symbol})` : id;
  };

  const renderAcceptanceList = (tokens) => {
    if (!tokens || tokens.length === 0) return null;
    const tokenSymbols = tokens.map((tokenId) => getTokenSymbolById(tokenId));
    return renderField("Acceptance List Tokens", tokenSymbols);
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="spinner"></div>
        </div>
      )}
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div
            ref={modalRef}
            className="relative bg-white max-w-[1000px] p-6 rounded-md shadow-lg"
          >
            <button
              className="absolute top-1 right-4 text-2xl text-gray-700 hover:text-gray-900 transition-colors duration-200"
              onClick={() => {
                setSelectedTask(null);
                setIsModalVisible(false);
              }}
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              {selectedTask.name}
            </h2>
            {taskInfo && (
              <div className="text-sm text-gray-700">
                {renderAcceptanceList(
                  taskInfo.taskConfig.acceptanceList.tokens
                )}
                {renderField(
                  "Custom Destination Chains",
                  taskInfo.taskConfig.customDestinationChains?.map(
                    (chain) => chain.destinationChain
                  )
                )}
                {renderField(
                  "Custom Max Bridge Fees",
                  taskInfo.taskConfig.customMaxBridgeFees?.map(
                    (fee) => fee.maxBridgeFee.amount
                  )
                )}
                {renderField(
                  "Custom Max Slippages",
                  taskInfo.taskConfig.customMaxSlippages?.map(
                    (slippage) => slippage.maxSlippage
                  )
                )}
                {renderField(
                  "Custom Token Outs",
                  taskInfo.taskConfig.customTokenOuts?.map(
                    (token) =>
                      `${token.tokenOut.name} (${token.tokenOut.symbol})`
                  )
                )}
                {renderField(
                  "Custom Token Thresholds",
                  taskInfo.taskConfig.customTokenThresholds?.map(
                    (threshold) =>
                      `Max: ${threshold.threshold.max}, Min: ${threshold.threshold.min}`
                  )
                )}
                {renderField(
                  "Custom Volume Limits",
                  taskInfo.taskConfig.customVolumeLimits?.map(
                    (limit) =>
                      `Amount: ${limit.volumeLimit.amount}, Period: ${limit.volumeLimit.period}`
                  )
                )}
                {renderField(
                  "Default Destination Chain",
                  taskInfo.taskConfig.defaultDestinationChain
                )}
                {renderField(
                  "Default Max Bridge Fee",
                  taskInfo.taskConfig.defaultMaxBridgeFee?.amount
                )}
                {renderField(
                  "Default Max Slippage",
                  taskInfo.taskConfig.defaultMaxSlippage
                )}
                {renderField(
                  "Default Token Out",
                  `${taskInfo.taskConfig.defaultTokenOut?.name} (${taskInfo.taskConfig.defaultTokenOut?.symbol})`
                )}
                {renderField(
                  "Default Token Threshold",
                  `Max: ${taskInfo.taskConfig.defaultTokenThreshold?.max}, Min: ${taskInfo.taskConfig.defaultTokenThreshold?.min}`
                )}
                {renderField(
                  "Default Volume Limit",
                  `Amount: ${taskInfo.taskConfig.defaultVolumeLimit?.amount}, Period: ${taskInfo.taskConfig.defaultVolumeLimit?.period}`
                )}
                {renderField(
                  "Gas Price Limit",
                  taskInfo.taskConfig.gasLimits?.gasPriceLimit
                )}
                {renderField(
                  "Priority Fee Limit",
                  taskInfo.taskConfig.gasLimits?.priorityFeeLimit
                )}
                {renderField(
                  "Transaction Cost Limit",
                  taskInfo.taskConfig.gasLimits?.txCostLimit
                )}
                {renderField(
                  "Transaction Cost Limit Percentage",
                  taskInfo.taskConfig.gasLimits?.txCostLimitPct,
                  true
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TaskModal;
