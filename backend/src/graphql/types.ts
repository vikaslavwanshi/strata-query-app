// Domain types stored in DynamoDB and returned by resolvers.
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Property {
  id: string;
  address: string;
  strataPlanNumber: string;
  createdAt: string; // ISO 8601
}

export interface Ticket {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  status: TicketStatus;
  submittedBy: string;
  response?: string;
  respondedBy?: string;
  createdAt: string; // ISO 8601
  respondedAt?: string; // ISO 8601
}
