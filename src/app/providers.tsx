"use client";

import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { initializeApollo } from "../lib/apolloClient";
import theme from "../theme";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const client = initializeApollo();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <ApolloProvider client={client}>
        {mounted ? children : null}
      </ApolloProvider>
    </ChakraProvider>
  );
}
