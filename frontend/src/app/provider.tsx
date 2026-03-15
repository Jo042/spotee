"use client";

import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "@/lib/apollo-client";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
