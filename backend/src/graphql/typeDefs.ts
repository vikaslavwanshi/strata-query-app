// GraphQL schema as an inline template string.
// Inlined (rather than reading schema.graphql at runtime) so esbuild bundles it
// cleanly into the Lambda with no file-system reads. Keep in sync with schema.graphql.
export const typeDefs = /* GraphQL */ `
  scalar AWSDateTime

  type Property {
    id: ID!
    address: String!
    strataPlanNumber: String!
    createdAt: AWSDateTime!
  }

  type Ticket {
    id: ID!
    propertyId: ID!
    title: String!
    description: String!
    status: TicketStatus!
    submittedBy: String!
    response: String
    respondedBy: String
    createdAt: AWSDateTime!
    respondedAt: AWSDateTime
  }

  enum TicketStatus {
    OPEN
    IN_PROGRESS
    RESOLVED
  }

  type Query {
    listProperties: [Property!]!
    getProperty(id: ID!): Property
    listTickets(propertyId: ID, status: TicketStatus): [Ticket!]!
    getTicket(id: ID!): Ticket
  }

  type Mutation {
    createProperty(address: String!, strataPlanNumber: String!): Property!
    updateProperty(id: ID!, address: String, strataPlanNumber: String): Property!
    deleteProperty(id: ID!): Boolean!

    submitTicket(propertyId: ID!, title: String!, description: String!, submittedBy: String!): Ticket!
    respondToTicket(id: ID!, response: String!, respondedBy: String!): Ticket!
    updateTicketStatus(id: ID!, status: TicketStatus!): Ticket!
    deleteTicket(id: ID!): Boolean!
  }
`;
