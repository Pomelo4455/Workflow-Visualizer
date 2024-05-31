// Importing necessary hooks and libraries
"use client";
import { useState, useEffect, useRef } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

// Apollo Client setup
const apolloClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/mimic-fi/v3-mainnet",
  cache: new InMemoryCache(),
});

// GraphQL query
const GET_ENVIRONMENT_TASKS = gql`
  {
    environment(
      id: "0xd28bd4e036df02abce84bc34ede2a63abcefa0567ff2d923f01c24633262c7f8"
    ) {
      tasks {
        taskConfig {
          nextBalanceConnector
          previousBalanceConnector
          recipient
        }
        name
        tokensSource
      }
    }
  }
`;

function howManyBalanceConnectors(tasks) {
  let connectors = new Set();

  tasks.forEach((task) => {
    let prevConnector = task.taskConfig.previousBalanceConnector;
    let nextConnector = task.taskConfig.nextBalanceConnector;

    if (!connectors.has(nextConnector)) {
      connectors.add(nextConnector);
    }
    if (!connectors.has(prevConnector)) {
      connectors.add(prevConnector);
    }
  });

  return connectors;
}

// Function to group tasks into groups
function groupTasks(tasks, connectors) {
  let groups = [];

  // Special case for the first group (previousBalanceConnector is all zeros)
  let specialFirstGroup = tasks.filter(
    (task) =>
      task.taskConfig.previousBalanceConnector ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
  if (specialFirstGroup.length > 0) {
    groups.push({
      name: `Previous Balance Connector: 0x0000000000000000000000000000000000000000000000000000000000000000`,
      tasks: specialFirstGroup,
      groupBy: "previousBalanceConnector",
    });
  }

  // Group tasks based on previousBalanceConnector
  for (let connector of connectors) {
    if (
      connector ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    )
      continue;

    let group = tasks.filter(
      (task) => task.taskConfig.previousBalanceConnector === connector
    );
    if (group.length > 0) {
      groups.push({
        name: `Previous Balance Connector: ${connector}`,
        tasks: group,
        groupBy: "previousBalanceConnector",
      });
    }
  }

  // Group tasks based on nextBalanceConnector
  for (let connector of connectors) {
    let group = tasks.filter(
      (task) => task.taskConfig.nextBalanceConnector === connector
    );
    if (group.length > 0) {
      groups.push({
        name: `Next Balance Connector: ${connector}`,
        tasks: group,
        groupBy: "nextBalanceConnector",
      });
    }
  }

  // Special case for the last group (nextBalanceConnector is all zeros)
  let specialLastGroup = tasks.filter(
    (task) =>
      task.taskConfig.nextBalanceConnector ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
  if (specialLastGroup.length > 0) {
    groups.push({
      name: `Next Balance Connector: 0x0000000000000000000000000000000000000000000000000000000000000000`,
      tasks: specialLastGroup,
      groupBy: "nextBalanceConnector",
    });
  }

  // Create subdivisions within each group
  let finalGroups = groups.map((group) => {
    let subdivisions = [];

    group.tasks.forEach((task) => {
      let found = false;
      for (let subdivision of subdivisions) {
        if (
          subdivision.tasks[0].taskConfig.previousBalanceConnector ===
            task.taskConfig.previousBalanceConnector &&
          subdivision.tasks[0].taskConfig.nextBalanceConnector ===
            task.taskConfig.nextBalanceConnector
        ) {
          subdivision.tasks.push(task);
          found = true;
          break;
        }
      }
      if (!found) {
        const subdivisionName =
          group.groupBy === "previousBalanceConnector"
            ? `Next Balance Connector: ${task.taskConfig.nextBalanceConnector}`
            : `Previous Balance Connector: ${task.taskConfig.previousBalanceConnector}`;

        subdivisions.push({
          name: subdivisionName,
          tasks: [task],
        });
      }
    });

    return { ...group, subdivisions };
  });

  return finalGroups;
}

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const modalRef = useRef();
  const groupRefs = useRef({});

  useEffect(() => {
    apolloClient
      .query({ query: GET_ENVIRONMENT_TASKS })
      .then((result) => {
        const fetchedTasks = result.data.environment.tasks;
        setTasks(fetchedTasks);
        const connectors = howManyBalanceConnectors(fetchedTasks);
        const groups = groupTasks(fetchedTasks, connectors);
        setGroups(groups);
        setFilteredGroups(groups);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

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
    const filtered = groups.filter((group) =>
      group.subdivisions.some((subdivision) =>
        subdivision.tasks.some(
          (task) =>
            (task.taskConfig.recipient &&
              task.taskConfig.recipient
                .toLowerCase()
                .includes(lowerCaseAddress)) ||
            (task.tokensSource &&
              task.tokensSource.toLowerCase().includes(lowerCaseAddress))
        )
      )
    );
    setFilteredGroups(filtered);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setSelectedTask(null);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTask]);

  const getUniqueKey = (group) => {
    const [type, value] = group.name.split(": ");
    return `${type.trim()}-${value.trim()}`;
  };

  const handleHighlightGroup = (connector, groupBy) => {
    const targetGroup =
      groupBy === "previousBalanceConnector"
        ? `Next Balance Connector-${connector}`
        : `Previous Balance Connector-${connector}`;

    // Find the correct group element
    const groupElement = groupRefs.current[targetGroup];
    if (groupElement) {
      groupElement.classList.add("highlight");
      groupElement.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        groupElement.classList.remove("highlight");
      }, 2000); // Remove the highlight after 2 seconds
    }
  };

  return (
    <div className="min-h-screen bg-[#191B23] text-white overflow-x-hidden">
      <div className="bg-[#121418] flex flex-col md:flex-row md:px-20 w-full h-fit p-3 justify-around items-center">
        <div className="bg-[#121418] flex flex-col md:flex-row w-full h-fit p-4 items-center">
          <a
            href="https://www.mimic.fi/"
            target="_blank"
            rel="noopener noreferrer"
          >
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
      </div>
      <div className="mx-10 px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="mb-8 p-4 border-2 border-[#6F5CE6] rounded-lg group-box"
              ref={(el) => (groupRefs.current[getUniqueKey(group)] = el)}
            >
              <h2 className="text-md font-thin mb-6 break-words">
                {group.name}
              </h2>
              {group.subdivisions.map((subdivision, subIndex) => (
                <div
                  key={subIndex}
                  className="mb-6 p-4 border-2 border-[#6F5CE6] rounded-lg subdivision-box relative"
                >
                  <h3 className="text-sm font-thin mt-2 mb-4 break-words">
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
          ))}
        </div>

        {selectedTask && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div
              ref={modalRef}
              className="relative bg-white p-6 rounded-lg shadow-lg"
            >
              <button
                className="absolute top-1 right-4 text-2xl text-gray-700 hover:text-gray-900 transition-colors duration-200"
                onClick={() => setSelectedTask(null)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                {selectedTask.name}
              </h2>
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <span className="font-bold">Next Balance Connector:</span>{" "}
                  {selectedTask.taskConfig.nextBalanceConnector}
                </p>
                <p>
                  <span className="font-bold">Previous Balance Connector:</span>{" "}
                  {selectedTask.taskConfig.previousBalanceConnector}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        body {
          overflow-y: scroll;
        }
        .no-scrollbar {
          overflow-y: hidden;
        }
        .highlight {
          animation: highlight 2.3s;
        }
        @keyframes highlight {
          0% {
            box-shadow: 0 0 5px #6f5ce6;
          }
          50% {
            box-shadow: 0 0 50px #6f5ce6;
          }
          100% {
            box-shadow: 0 0 0px #6f5ce6;
          }
        }
      `}</style>
    </div>
  );
}
