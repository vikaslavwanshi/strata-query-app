import {
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import { ddb, PROPERTIES_TABLE } from '../db/dynamoClient.js';
import type { Property } from '../graphql/types.js';

export const propertyQueries = {
  listProperties: async (): Promise<Property[]> => {
    const res = await ddb.send(new ScanCommand({ TableName: PROPERTIES_TABLE }));
    return (res.Items ?? []) as Property[];
  },

  getProperty: async (_: unknown, args: { id: string }): Promise<Property | null> => {
    const res = await ddb.send(
      new GetCommand({ TableName: PROPERTIES_TABLE, Key: { id: args.id } }),
    );
    return (res.Item as Property) ?? null;
  },
};

export const propertyMutations = {
  createProperty: async (
    _: unknown,
    args: { address: string; strataPlanNumber: string },
  ): Promise<Property> => {
    const property: Property = {
      id: randomUUID(),
      address: args.address,
      strataPlanNumber: args.strataPlanNumber,
      createdAt: new Date().toISOString(),
    };
    await ddb.send(new PutCommand({ TableName: PROPERTIES_TABLE, Item: property }));
    return property;
  },

  updateProperty: async (
    _: unknown,
    args: { id: string; address?: string; strataPlanNumber?: string },
  ): Promise<Property> => {
    const sets: string[] = [];
    const names: Record<string, string> = {};
    const values: Record<string, unknown> = {};

    if (args.address !== undefined) {
      sets.push('#address = :address');
      names['#address'] = 'address';
      values[':address'] = args.address;
    }
    if (args.strataPlanNumber !== undefined) {
      sets.push('#spn = :spn');
      names['#spn'] = 'strataPlanNumber';
      values[':spn'] = args.strataPlanNumber;
    }

    if (sets.length === 0) {
      // Nothing to update — return the current item.
      const current = await ddb.send(
        new GetCommand({ TableName: PROPERTIES_TABLE, Key: { id: args.id } }),
      );
      return current.Item as Property;
    }

    const res = await ddb.send(
      new UpdateCommand({
        TableName: PROPERTIES_TABLE,
        Key: { id: args.id },
        UpdateExpression: `SET ${sets.join(', ')}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ConditionExpression: 'attribute_exists(id)',
        ReturnValues: 'ALL_NEW',
      }),
    );
    return res.Attributes as Property;
  },

  deleteProperty: async (_: unknown, args: { id: string }): Promise<boolean> => {
    await ddb.send(
      new DeleteCommand({ TableName: PROPERTIES_TABLE, Key: { id: args.id } }),
    );
    return true;
  },
};
