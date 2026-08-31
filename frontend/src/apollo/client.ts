import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT as string | undefined;

if (!endpoint) {
  throw new Error(
    'VITE_GRAPHQL_ENDPOINT is not set. Copy the CDK output into frontend/.env.local.',
  );
}

export const client = new ApolloClient({
  link: new HttpLink({ uri: endpoint }),
  cache: new InMemoryCache(),
});
