import {
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import {
  ddb,
  TICKETS_TABLE,
  TICKETS_BY_PROPERTY_INDEX,
} from '../db/dynamoClient.js';
import type { Ticket, TicketStatus } from '../graphql/types.js';

export const ticketQueries = {
  listTickets: async (
    _: unknown,
    args: { propertyId?: string; status?: TicketStatus },
  ): Promise<Ticket[]> => {
    // If a propertyId is supplied, use the GSI for an efficient Query.
    if (args.propertyId) {
      const names: Record<string, string> = { '#pid': 'propertyId' };
      const values: Record<string, unknown> = { ':pid': args.propertyId };
      let keyExpr = '#pid = :pid';

      if (args.status) {
        keyExpr += ' AND #status = :status';
        names['#status'] = 'status';
        values[':status'] = args.status;
      }

      const res = await ddb.send(
        new QueryCommand({
          TableName: TICKETS_TABLE,
          IndexName: TICKETS_BY_PROPERTY_INDEX,
          KeyConditionExpression: keyExpr,
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
        }),
      );
      return (res.Items ?? []) as Ticket[];
    }

    // No propertyId — Scan, optionally filtering by status.
    const res = await ddb.send(
      new ScanCommand({
        TableName: TICKETS_TABLE,
        ...(args.status
          ? {
              FilterExpression: '#status = :status',
              ExpressionAttributeNames: { '#status': 'status' },
              ExpressionAttributeValues: { ':status': args.status },
            }
          : {}),
      }),
    );
    return (res.Items ?? []) as Ticket[];
  },

  getTicket: async (_: unknown, args: { id: string }): Promise<Ticket | null> => {
    const res = await ddb.send(
      new GetCommand({ TableName: TICKETS_TABLE, Key: { id: args.id } }),
    );
    return (res.Item as Ticket) ?? null;
  },
};

export const ticketMutations = {
  submitTicket: async (
    _: unknown,
    args: {
      propertyId: string;
      title: string;
      description: string;
      submittedBy: string;
    },
  ): Promise<Ticket> => {
    const ticket: Ticket = {
      id: randomUUID(),
      propertyId: args.propertyId,
      title: args.title,
      description: args.description,
      status: 'OPEN',
      submittedBy: args.submittedBy,
      createdAt: new Date().toISOString(),
    };
    await ddb.send(new PutCommand({ TableName: TICKETS_TABLE, Item: ticket }));
    return ticket;
  },

  // Responding to a ticket also advances it to IN_PROGRESS (see plan decision).
  respondToTicket: async (
    _: unknown,
    args: { id: string; response: string; respondedBy: string },
  ): Promise<Ticket> => {
    const res = await ddb.send(
      new UpdateCommand({
        TableName: TICKETS_TABLE,
        Key: { id: args.id },
        UpdateExpression:
          'SET #response = :response, respondedBy = :respondedBy, respondedAt = :respondedAt, #status = :status',
        ExpressionAttributeNames: { '#response': 'response', '#status': 'status' },
        ExpressionAttributeValues: {
          ':response': args.response,
          ':respondedBy': args.respondedBy,
          ':respondedAt': new Date().toISOString(),
          ':status': 'IN_PROGRESS',
        },
        ConditionExpression: 'attribute_exists(id)',
        ReturnValues: 'ALL_NEW',
      }),
    );
    return res.Attributes as Ticket;
  },

  updateTicketStatus: async (
    _: unknown,
    args: { id: string; status: TicketStatus },
  ): Promise<Ticket> => {
    const res = await ddb.send(
      new UpdateCommand({
        TableName: TICKETS_TABLE,
        Key: { id: args.id },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': args.status },
        ConditionExpression: 'attribute_exists(id)',
        ReturnValues: 'ALL_NEW',
      }),
    );
    return res.Attributes as Ticket;
  },

  deleteTicket: async (_: unknown, args: { id: string }): Promise<boolean> => {
    await ddb.send(new DeleteCommand({ TableName: TICKETS_TABLE, Key: { id: args.id } }));
    return true;
  },
};
