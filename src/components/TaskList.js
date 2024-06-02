import React from "react";
import "../app/globals.css";

const TaskList = ({
  filteredGroups,
  handleTaskClick,
  handleHighlightGroup,
  setGroupRef,
  highlightedGroup,
}) => {
  const getUniqueKey = (group) => {
    const [type, value] = group.name.split(": ");
    return `${type.trim()}-${value.trim()}`;
  };

  return (
    <div className="mx-10 px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group, groupIndex) => {
          const groupKey = getUniqueKey(group);
          return (
            <div
              key={groupIndex}
              className={`mb-8 p-4 border-2 border-[#6F5CE6] rounded-md group-box ${
                highlightedGroup === groupKey ? "highlighted" : ""
              }`}
              ref={(el) => setGroupRef(groupKey, el)}
            >
              <h2 className="text-md font-thin mb-6 break-words">
                {group.name}
              </h2>
              {group.subdivisions.map((subdivision, subIndex) => (
                <div
                  key={subIndex}
                  className="mb-6 p-4 border-2 border-[#6F5CE6] rounded-md subdivision-box relative"
                >
                  <h3 className="text-sm font-thin mt-6 md:mt-2 mb-4 break-words">
                    {subdivision.name}
                  </h3>
                  <button
                    className="absolute top-2 right-2 bg-[#6e5ce639] hover:bg-[#6F5CE6] text-white rounded-sm py-0.5 px-3 cursor-pointer transition-colors duration-200"
                    onClick={() =>
                      handleHighlightGroup(
                        group.groupBy === "previousBalanceConnector"
                          ? subdivision.tasks[0].taskConfig.nextBalanceConnector
                          : subdivision.tasks[0].taskConfig
                              .previousBalanceConnector,
                        group.groupBy
                      )
                    }
                  >
                    Highlight
                  </button>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 py-4">
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
