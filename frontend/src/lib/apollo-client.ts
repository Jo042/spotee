import { ApolloClient, InMemoryCache } from "@apollo/client";
import { HttpLink } from "@apollo/client/link/http";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
  credentials: "include",
});

export const apolloClient = new ApolloClient({
  link: httpLink,

  cache: new InMemoryCache(),

  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
