import React from "react";
import TaskGraph from "@/components/TaskGraph";

const TaskGraphWrapper = ({ tasks, onTaskClick, windowSize, tokenAddress }) => (
  <div className="w-full h-fit flex items-center justify-center">
    {windowSize.width >= 1000 && (
      <TaskGraph
        tasks={tasks}
        onTaskClick={onTaskClick}
        filterTokenAddress={tokenAddress}
      />
    )}
  </div>
);

export default TaskGraphWrapper;
