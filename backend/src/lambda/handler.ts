import { ApolloServer } from '@apollo/server';
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda';
import { typeDefs } from '../graphql/typeDefs.js';
import { resolvers } from '../resolvers/index.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Landing page + introspection are handy for a learning project.
  introspection: true,
});

// Bridges API Gateway HTTP API (v2) events to Apollo Server.
// The `as never` works around the ESM/CJS dual-package type mismatch between
// @apollo/server and @as-integrations/aws-lambda — both resolve to the same
// module at runtime (esbuild bundles one copy), only the .d.ts identities differ.
export const handler = startServerAndCreateLambdaHandler(
  server as never,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
);
