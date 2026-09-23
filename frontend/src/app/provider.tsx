"use client";

import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "@/lib/apollo-client";
import { ToastProvider } from "@/components/common/toast/ToastProvider";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <ToastProvider>{children}</ToastProvider>
    </ApolloProvider>
  );
}
