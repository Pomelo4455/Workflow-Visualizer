"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useBalances } from "@/hooks/useBalances";
import useWindowSize from "@/hooks/useWindowSize";
import Header from "@/components/Header";
import TaskGraphWrapper from "@/components/TaskGraphWrapper";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";
import TokensSelect from "@/components/TokensSelect";

export default function Home() {
  const { tasks, groups } = useTasks();
  const { balances, tokens } = useBalances();
  const [selectedTask, setSelectedTask] = useState(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [highlightedGroup, setHighlightedGroup] = useState(null);
  const [balanceIdToName, setBalanceIdToName] = useState({});
  const windowSize = useWindowSize();
  const groupRefs = useRef({});

  useEffect(() => {
    const generateBalanceIdToName = () => {
      const balanceIdToName = {};
      let currentLetterCode = 65; // ASCII code for 'A'

      tasks.forEach((task) => {
        const prevConnectorId = task.taskConfig.previousBalanceConnector;
        const nextConnectorId = task.taskConfig.nextBalanceConnector;

        if (
          prevConnectorId !==
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        ) {
          if (!balanceIdToName[prevConnectorId]) {
            balanceIdToName[prevConnectorId] = String.fromCharCode(
              currentLetterCode++
            );
          }
        }

        if (
          nextConnectorId !==
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        ) {
          if (!balanceIdToName[nextConnectorId]) {
            balanceIdToName[nextConnectorId] = String.fromCharCode(
              currentLetterCode++
            );
          }
        }
      });

      setBalanceIdToName(balanceIdToName);
    };

    generateBalanceIdToName();
  }, [tasks]);

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

  console.log(tokens);

  return (
    <div className="min-h-screen -mb-3 bg-[#191B23] text-white">
      <Header />
      <TaskGraphWrapper
        tasks={tasks}
        onTaskClick={handleTaskClick}
        handleHighlightGroup={handleHighlightGroup}
        windowSize={windowSize}
        tokenAddress={tokenAddress}
        balances={balances}
        balanceIdToName={balanceIdToName} // Pass balanceIdToName prop
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
        balanceIdToName={balanceIdToName} // Pass balanceIdToName prop
      />
      <TaskModal
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        tokens={tokens}
      />
    </div>
  );
}
