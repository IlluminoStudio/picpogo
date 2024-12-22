import { ApolloClient, InMemoryCache } from '@apollo/client';
import { RestLink } from 'apollo-link-rest';

let apolloClient: ApolloClient<any> | null = null;

// Create a new Apollo Client instance
function createApolloClient() {
  const restLink = new RestLink({
    uri: 'https://api.pexels.com/v1/',
    headers: {
      Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || '',
    },
  });

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: restLink,
    cache: new InMemoryCache(),
  });
}

// Initialize Apollo Client with optional initial state
export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // Hydrate the cache with the initial state
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }

  // Create new client for SSG/SSR
  if (typeof window === 'undefined') return _apolloClient;

  // Reuse client on the client-side
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
} 