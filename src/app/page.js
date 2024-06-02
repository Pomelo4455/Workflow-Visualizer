"use client";
import React, { useState, useCallback, useRef } from "react";
import { useTasks } from "@/hooks/useTasks";
import useWindowSize from "@/hooks/useWindowSize";
import Header from "@/components/Header";
import TaskGraphWrapper from "@/components/TaskGraphWrapper";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";

export default function Home() {
  const { tasks, groups, filteredGroups, setFilteredGroups } = useTasks();
  const [selectedTask, setSelectedTask] = useState(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [highlightedGroup, setHighlightedGroup] = useState(null);
  const windowSize = useWindowSize();
  const groupRefs = useRef({});

  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
  }, []);

  const handleTokenAddressChange = (event) => {
    const address = event.target.value;
    setTokenAddress(address);
    filterGroups(address);
  };

  const filterGroups = (address) => {
    if (!address) {
      setFilteredGroups(groups);
      return;
    }
    const lowerCaseAddress = address.toLowerCase();
    const filtered = groups
      .map((group) => {
        const filteredSubdivisions = group.subdivisions
          .map((subdivision) => {
            const filteredTasks = subdivision.tasks.filter(
              (task) =>
                (task.taskConfig.recipient &&
                  task.taskConfig.recipient
                    .toLowerCase()
                    .includes(lowerCaseAddress)) ||
                (task.tokensSource &&
                  task.tokensSource.toLowerCase().includes(lowerCaseAddress))
            );
            return { ...subdivision, tasks: filteredTasks };
          })
          .filter((subdivision) => subdivision.tasks.length > 0);
        return { ...group, subdivisions: filteredSubdivisions };
      })
      .filter((group) => group.subdivisions.length > 0);
    setFilteredGroups(filtered);
  };

  const handleHighlightGroup = (connector, groupBy) => {
    const targetGroup =
      groupBy === "previousBalanceConnector"
        ? `Next Balance Connector-${connector}`
        : `Previous Balance Connector-${connector}`;

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
    <div className="min-h-screen bg-[#191B23] text-white overflow-x-hidden">
      <Header
        tokenAddress={tokenAddress}
        handleTokenAddressChange={handleTokenAddressChange}
      />
      <TaskGraphWrapper
        tasks={tasks}
        onTaskClick={handleTaskClick}
        windowSize={windowSize}
        tokenAddress={tokenAddress}
      />
      <TaskList
        filteredGroups={filteredGroups}
        handleTaskClick={handleTaskClick}
        handleHighlightGroup={handleHighlightGroup}
        setGroupRef={handleSetGroupRefs}
        highlightedGroup={highlightedGroup} // Pass the highlighted group state
      />
      <TaskModal
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
      />
    </div>
  );
}
