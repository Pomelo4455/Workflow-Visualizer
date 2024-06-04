import { useState } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const apolloClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/mimic-fi/v3-mainnet",
  cache: new InMemoryCache(),
});

const GET_TASK_INFO = gql`
  query GetTaskInfo($taskId: String!) {
    environment(
      id: "0xd28bd4e036df02abce84bc34ede2a63abcefa0567ff2d923f01c24633262c7f8"
    ) {
      tasks(where: { id: $taskId }) {
        taskConfig {
          nextBalanceConnector
          previousBalanceConnector
          acceptanceList {
            tokens
          }
          customDestinationChains {
            destinationChain
          }
          customMaxBridgeFees {
            maxBridgeFee {
              amount
            }
          }
          customMaxSlippages {
            maxSlippage
          }
          customTokenOuts {
            tokenOut {
              symbol
              name
            }
          }
          customTokenThresholds {
            threshold {
              max
              min
            }
          }
          customVolumeLimits {
            volumeLimit {
              amount
              period
            }
          }
          defaultDestinationChain
          defaultMaxBridgeFee {
            amount
          }
          defaultMaxSlippage
          defaultTokenOut {
            name
            symbol
          }
          defaultTokenThreshold {
            max
            min
          }
          defaultVolumeLimit {
            period
            amount
          }
          gasLimits {
            gasPriceLimit
            priorityFeeLimit
            txCostLimit
            txCostLimitPct
          }
        }
        name
        id
      }
    }
  }
`;

export const useTaskInfo = () => {
  const [taskInfo, setTaskInfo] = useState(null);

  const fetchTaskInfo = (taskId) => {
    return apolloClient
      .query({ query: GET_TASK_INFO, variables: { taskId } })
      .then((result) => {
        setTaskInfo(result.data.environment.tasks[0]);
      })
      .catch((error) => {
        console.error("Error fetching task info:", error);
      });
  };

  return { taskInfo, fetchTaskInfo };
};
