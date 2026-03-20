import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import { HttpLink } from "@apollo/client/link/http";
import { supabase } from "./supabase";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
  credentials: "include",
});

const authLink = new SetContextLink(async (prevContext, operation) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),

  cache: new InMemoryCache(),

  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
