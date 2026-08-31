import { graphql } from '../gql';

// ---- Queries -------------------------------------------------------------
export const LIST_PROPERTIES = graphql(`
  query ListProperties {
    listProperties {
      id
      address
      strataPlanNumber
      createdAt
    }
  }
`);

export const LIST_TICKETS = graphql(`
  query ListTickets($propertyId: ID, $status: TicketStatus) {
    listTickets(propertyId: $propertyId, status: $status) {
      id
      propertyId
      title
      description
      status
      submittedBy
      response
      respondedBy
      createdAt
      respondedAt
    }
  }
`);

// ---- Mutations -----------------------------------------------------------
export const CREATE_PROPERTY = graphql(`
  mutation CreateProperty($address: String!, $strataPlanNumber: String!) {
    createProperty(address: $address, strataPlanNumber: $strataPlanNumber) {
      id
      address
      strataPlanNumber
      createdAt
    }
  }
`);

export const SUBMIT_TICKET = graphql(`
  mutation SubmitTicket(
    $propertyId: ID!
    $title: String!
    $description: String!
    $submittedBy: String!
  ) {
    submitTicket(
      propertyId: $propertyId
      title: $title
      description: $description
      submittedBy: $submittedBy
    ) {
      id
      status
      title
    }
  }
`);

export const RESPOND_TO_TICKET = graphql(`
  mutation RespondToTicket($id: ID!, $response: String!, $respondedBy: String!) {
    respondToTicket(id: $id, response: $response, respondedBy: $respondedBy) {
      id
      status
      response
      respondedBy
      respondedAt
    }
  }
`);

export const UPDATE_TICKET_STATUS = graphql(`
  mutation UpdateTicketStatus($id: ID!, $status: TicketStatus!) {
    updateTicketStatus(id: $id, status: $status) {
      id
      status
    }
  }
`);
