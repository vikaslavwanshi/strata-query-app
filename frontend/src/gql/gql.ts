/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query ListProperties {\n    listProperties {\n      id\n      address\n      strataPlanNumber\n      createdAt\n    }\n  }\n": typeof types.ListPropertiesDocument,
    "\n  query ListTickets($propertyId: ID, $status: TicketStatus) {\n    listTickets(propertyId: $propertyId, status: $status) {\n      id\n      propertyId\n      title\n      description\n      status\n      submittedBy\n      response\n      respondedBy\n      createdAt\n      respondedAt\n    }\n  }\n": typeof types.ListTicketsDocument,
    "\n  mutation CreateProperty($address: String!, $strataPlanNumber: String!) {\n    createProperty(address: $address, strataPlanNumber: $strataPlanNumber) {\n      id\n      address\n      strataPlanNumber\n      createdAt\n    }\n  }\n": typeof types.CreatePropertyDocument,
    "\n  mutation SubmitTicket(\n    $propertyId: ID!\n    $title: String!\n    $description: String!\n    $submittedBy: String!\n  ) {\n    submitTicket(\n      propertyId: $propertyId\n      title: $title\n      description: $description\n      submittedBy: $submittedBy\n    ) {\n      id\n      status\n      title\n    }\n  }\n": typeof types.SubmitTicketDocument,
    "\n  mutation RespondToTicket($id: ID!, $response: String!, $respondedBy: String!) {\n    respondToTicket(id: $id, response: $response, respondedBy: $respondedBy) {\n      id\n      status\n      response\n      respondedBy\n      respondedAt\n    }\n  }\n": typeof types.RespondToTicketDocument,
    "\n  mutation UpdateTicketStatus($id: ID!, $status: TicketStatus!) {\n    updateTicketStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n": typeof types.UpdateTicketStatusDocument,
};
const documents: Documents = {
    "\n  query ListProperties {\n    listProperties {\n      id\n      address\n      strataPlanNumber\n      createdAt\n    }\n  }\n": types.ListPropertiesDocument,
    "\n  query ListTickets($propertyId: ID, $status: TicketStatus) {\n    listTickets(propertyId: $propertyId, status: $status) {\n      id\n      propertyId\n      title\n      description\n      status\n      submittedBy\n      response\n      respondedBy\n      createdAt\n      respondedAt\n    }\n  }\n": types.ListTicketsDocument,
    "\n  mutation CreateProperty($address: String!, $strataPlanNumber: String!) {\n    createProperty(address: $address, strataPlanNumber: $strataPlanNumber) {\n      id\n      address\n      strataPlanNumber\n      createdAt\n    }\n  }\n": types.CreatePropertyDocument,
    "\n  mutation SubmitTicket(\n    $propertyId: ID!\n    $title: String!\n    $description: String!\n    $submittedBy: String!\n  ) {\n    submitTicket(\n      propertyId: $propertyId\n      title: $title\n      description: $description\n      submittedBy: $submittedBy\n    ) {\n      id\n      status\n      title\n    }\n  }\n": types.SubmitTicketDocument,
    "\n  mutation RespondToTicket($id: ID!, $response: String!, $respondedBy: String!) {\n    respondToTicket(id: $id, response: $response, respondedBy: $respondedBy) {\n      id\n      status\n      response\n      respondedBy\n      respondedAt\n    }\n  }\n": types.RespondToTicketDocument,
    "\n  mutation UpdateTicketStatus($id: ID!, $status: TicketStatus!) {\n    updateTicketStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n": types.UpdateTicketStatusDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListProperties {\n    listProperties {\n      id\n      address\n      strataPlanNumber\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query ListProperties {\n    listProperties {\n      id\n      address\n      strataPlanNumber\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListTickets($propertyId: ID, $status: TicketStatus) {\n    listTickets(propertyId: $propertyId, status: $status) {\n      id\n      propertyId\n      title\n      description\n      status\n      submittedBy\n      response\n      respondedBy\n      createdAt\n      respondedAt\n    }\n  }\n"): (typeof documents)["\n  query ListTickets($propertyId: ID, $status: TicketStatus) {\n    listTickets(propertyId: $propertyId, status: $status) {\n      id\n      propertyId\n      title\n      description\n      status\n      submittedBy\n      response\n      respondedBy\n      createdAt\n      respondedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateProperty($address: String!, $strataPlanNumber: String!) {\n    createProperty(address: $address, strataPlanNumber: $strataPlanNumber) {\n      id\n      address\n      strataPlanNumber\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateProperty($address: String!, $strataPlanNumber: String!) {\n    createProperty(address: $address, strataPlanNumber: $strataPlanNumber) {\n      id\n      address\n      strataPlanNumber\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitTicket(\n    $propertyId: ID!\n    $title: String!\n    $description: String!\n    $submittedBy: String!\n  ) {\n    submitTicket(\n      propertyId: $propertyId\n      title: $title\n      description: $description\n      submittedBy: $submittedBy\n    ) {\n      id\n      status\n      title\n    }\n  }\n"): (typeof documents)["\n  mutation SubmitTicket(\n    $propertyId: ID!\n    $title: String!\n    $description: String!\n    $submittedBy: String!\n  ) {\n    submitTicket(\n      propertyId: $propertyId\n      title: $title\n      description: $description\n      submittedBy: $submittedBy\n    ) {\n      id\n      status\n      title\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RespondToTicket($id: ID!, $response: String!, $respondedBy: String!) {\n    respondToTicket(id: $id, response: $response, respondedBy: $respondedBy) {\n      id\n      status\n      response\n      respondedBy\n      respondedAt\n    }\n  }\n"): (typeof documents)["\n  mutation RespondToTicket($id: ID!, $response: String!, $respondedBy: String!) {\n    respondToTicket(id: $id, response: $response, respondedBy: $respondedBy) {\n      id\n      status\n      response\n      respondedBy\n      respondedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTicketStatus($id: ID!, $status: TicketStatus!) {\n    updateTicketStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTicketStatus($id: ID!, $status: TicketStatus!) {\n    updateTicketStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;