"use client";
import React, { useState, useCallback, useRef } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useBalances } from "@/hooks/useBalances";
import useWindowSize from "@/hooks/useWindowSize";
import Header from "@/components/Header";
import TaskGraphWrapper from "@/components/TaskGraphWrapper";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";

export default function Home() {
  const { tasks, groups } = useTasks();
  const { balances, tokens } = useBalances();
  const [selectedTask, setSelectedTask] = useState(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [highlightedGroup, setHighlightedGroup] = useState(null);
  const windowSize = useWindowSize();
  const groupRefs = useRef({});

  console.log("balances: ", balances);
  console.log("tokens: ", tokens);
  console.log("tasks", tasks);

  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
  }, []);

  const handleTokenSelectChange = (event) => {
    setHighlightedGroup("");
    const tokenId = event.target.value;
    setTokenAddress(tokenId);
  };

  const handleReset = () => {
    setHighlightedGroup("");
    setTokenAddress("");
  };

  const handleHighlightGroup = (connector) => {
    const targetGroup = `Balance Connector-${connector}`;

    const groupElement = groupRefs.current[targetGroup];
    if (groupElement) {
      groupElement.classList.add("highlighted");
      setHighlightedGroup(targetGroup);
      groupElement.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        groupElement.classList.add("fade");
        setTimeout(() => {
          groupElement.classList.remove("highlighted", "fade");
        }, 1000);
      }, 1000);
    }
  };

  const handleSetGroupRefs = (groupKey, element) => {
    groupRefs.current[groupKey] = element;
  };

  return (
    <div className="min-h-screen -mb-3 bg-[#191B23] text-white">
      <Header
        tokenAddress={tokenAddress}
        handleTokenAddressChange={handleTokenSelectChange}
        setHighlightedGroup={setHighlightedGroup}
      />
      <TaskGraphWrapper
        tasks={tasks}
        onTaskClick={handleTaskClick}
        handleHighlightGroup={handleHighlightGroup}
        windowSize={windowSize}
        tokenAddress={tokenAddress}
        balances={balances}
      />
      <TaskList
        groups={groups}
        handleTaskClick={handleTaskClick}
        setGroupRef={handleSetGroupRefs}
        highlightedGroup={highlightedGroup}
        tokenAddress={tokenAddress}
        balances={balances}
        handleTokenSelectChange={handleTokenSelectChange}
        tokens={tokens}
        handleReset={handleReset}
      />
      <TaskModal
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
      />
    </div>
  );
}
