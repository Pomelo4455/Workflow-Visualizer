import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { howManyBalanceConnectors, groupTasks } from "@/utils/taskUtils";

const apolloClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/mimic-fi/v3-mainnet",
  cache: new InMemoryCache(),
});

const GET_ENVIRONMENT_TASKS = gql`
  {
    environment(
      id: "0xd28bd4e036df02abce84bc34ede2a63abcefa0567ff2d923f01c24633262c7f8"
    ) {
      tasks {
        taskConfig {
          nextBalanceConnector
          previousBalanceConnector
        }
        name
      }
    }
  }
`;

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    apolloClient
      .query({ query: GET_ENVIRONMENT_TASKS })
      .then((result) => {
        const fetchedTasks = result.data.environment.tasks;
        setTasks(fetchedTasks);
        const connectors = howManyBalanceConnectors(fetchedTasks);
        const groups = groupTasks(fetchedTasks, connectors);
        setGroups(groups);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  return { tasks, groups };
};
