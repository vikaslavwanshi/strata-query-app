import * as cdk from 'aws-cdk-lib/core';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { InfraStack } from '../lib/infra-stack';

function synth(): Template {
  const app = new cdk.App();
  const stack = new InfraStack(app, 'TestStack');
  return Template.fromStack(stack);
}

test('creates two on-demand DynamoDB tables', () => {
  const template = synth();
  template.resourceCountIs('AWS::DynamoDB::Table', 2);
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    BillingMode: 'PAY_PER_REQUEST',
  });
});

test('tickets table has the propertyId-status GSI', () => {
  const template = synth();
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    GlobalSecondaryIndexes: Match.arrayWith([
      Match.objectLike({ IndexName: 'propertyId-status-index' }),
    ]),
  });
});

test('creates a Node 22 Lambda with both table names in its env', () => {
  const template = synth();
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs22.x',
    Environment: {
      Variables: Match.objectLike({
        PROPERTIES_TABLE_NAME: Match.anyValue(),
        TICKETS_TABLE_NAME: Match.anyValue(),
      }),
    },
  });
});

test('exposes an HTTP API with a POST /graphql route', () => {
  const template = synth();
  template.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
  template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
    RouteKey: 'POST /graphql',
  });
});
