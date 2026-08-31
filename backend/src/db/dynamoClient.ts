import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Shared DynamoDB Document client. Created once per Lambda container (module scope)
// so it is reused across warm invocations.
const baseClient = new DynamoDBClient({});

export const ddb = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// Table names are injected as env vars by the CDK stack.
export const PROPERTIES_TABLE = process.env.PROPERTIES_TABLE_NAME ?? '';
export const TICKETS_TABLE = process.env.TICKETS_TABLE_NAME ?? '';
export const TICKETS_BY_PROPERTY_INDEX = 'propertyId-status-index';
