import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const apolloClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/mimic-fi/v3-mainnet",
  cache: new InMemoryCache(),
});

const GET_ENVIRONMENT_BALANCES = gql`
  {
    environment(
      id: "0xd28bd4e036df02abce84bc34ede2a63abcefa0567ff2d923f01c24633262c7f8"
    ) {
      smartVaults {
        balanceConnectors {
          connector
          balances(where: { amount_not: "0" }) {
            amount
            token {
              id
              name
              symbol
              decimals
            }
          }
        }
      }
    }
  }
`;

export const useBalances = () => {
  const [balances, setBalances] = useState([]);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    apolloClient
      .query({ query: GET_ENVIRONMENT_BALANCES })
      .then((result) => {
        const fetchedConnectors = result.data.environment.smartVaults.flatMap(
          (vault) => vault.balanceConnectors
        );
        setBalances(fetchedConnectors);

        // Extract tokens from the fetched connectors
        const allTokens = fetchedConnectors.flatMap((connector) =>
          extractTokens(connector)
        );
        setTokens(allTokens);
      })
      .catch((error) => {
        console.error("Error fetching balances:", error);
      });
  }, []);

  return { balances, tokens };
};

export function extractTokens(data) {
  if (!data || !data.balances || !Array.isArray(data.balances)) {
    return [];
  }

  // Extract token information from each balance
  return data.balances.map((balance) => {
    const { id, name, symbol, decimals } = balance.token;
    return { id, name, symbol, decimals };
  });
}
