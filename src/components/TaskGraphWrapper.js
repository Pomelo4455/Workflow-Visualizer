import React from "react";
import TaskGraph from "@/components/TaskGraph";

const TaskGraphWrapper = ({
  tasks,
  onTaskClick,
  handleHighlightGroup,
  windowSize,
  tokenAddress,
  balances,
  balanceIdToName, // Receive balanceIdToName prop
}) => (
  <div className="w-full h-fit flex items-center justify-center">
    {windowSize.width >= 1000 && (
      <TaskGraph
        tasks={tasks}
        onTaskClick={onTaskClick}
        handleHighlightGroup={handleHighlightGroup}
        tokenAddress={tokenAddress}
        balances={balances}
        balanceIdToName={balanceIdToName} // Pass balanceIdToName prop
      />
    )}
  </div>
);

export default TaskGraphWrapper;
