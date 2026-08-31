import { GraphQLScalarType, Kind } from 'graphql';
import { propertyQueries, propertyMutations } from './propertyResolvers.js';
import { ticketQueries, ticketMutations } from './ticketResolvers.js';

// AWSDateTime is an AppSync convention; here we back it with a pass-through
// ISO-8601 string scalar so the schema reads the same as a hosted AppSync API.
const AWSDateTime = new GraphQLScalarType({
  name: 'AWSDateTime',
  description: 'ISO-8601 date-time string',
  serialize: (value) => value as string,
  parseValue: (value) => value as string,
  parseLiteral: (ast) => (ast.kind === Kind.STRING ? ast.value : null),
});

export const resolvers = {
  AWSDateTime,
  Query: {
    ...propertyQueries,
    ...ticketQueries,
  },
  Mutation: {
    ...propertyMutations,
    ...ticketMutations,
  },
};
