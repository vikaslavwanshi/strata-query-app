import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as path from 'node:path';

// infra runs as CommonJS under ts-node, so __dirname is available natively.
const backendDir = path.join(__dirname, '..', '..', 'backend');

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ---- DynamoDB ----------------------------------------------------------
    // On-demand (PAY_PER_REQUEST) billing — no provisioned capacity, sits in
    // the free tier for a low-traffic learning app. RemovalPolicy DESTROY so
    // `cdk destroy` fully cleans up (fine for throwaway data).
    const propertiesTable = new dynamodb.Table(this, 'PropertiesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const ticketsTable = new dynamodb.Table(this, 'TicketsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // GSI to query tickets by property (and optionally filter by status).
    ticketsTable.addGlobalSecondaryIndex({
      indexName: 'propertyId-status-index',
      partitionKey: { name: 'propertyId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ---- Lambda (Apollo GraphQL server) ------------------------------------
    const graphqlFn = new NodejsFunction(this, 'GraphqlFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(backendDir, 'src', 'lambda', 'handler.ts'),
      projectRoot: backendDir,
      depsLockFilePath: path.join(backendDir, 'package-lock.json'),
      handler: 'handler',
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
      environment: {
        PROPERTIES_TABLE_NAME: propertiesTable.tableName,
        TICKETS_TABLE_NAME: ticketsTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        // CommonJS output: esbuild consumes our ESM source but emits CJS, so the
        // bundled CommonJS deps (lru-cache etc.) keep native require() — an ESM
        // bundle rewrites those into a shim that throws on Node builtins.
        format: OutputFormat.CJS,
        target: 'node22',
        sourceMap: true,
        // @aws-sdk/* ships in the Node 22 Lambda runtime — keep it external to
        // shrink the bundle and speed cold starts.
        externalModules: ['@aws-sdk/*'],
      },
    });

    propertiesTable.grantReadWriteData(graphqlFn);
    ticketsTable.grantReadWriteData(graphqlFn);

    // ---- HTTP API (API Gateway v2) -----------------------------------------
    const httpApi = new HttpApi(this, 'StrataHttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],
        allowHeaders: ['content-type'],
      },
    });

    httpApi.addRoutes({
      path: '/graphql',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('GraphqlIntegration', graphqlFn),
    });

    // ---- Outputs -----------------------------------------------------------
    new cdk.CfnOutput(this, 'GraphqlEndpoint', {
      value: `${httpApi.apiEndpoint}/graphql`,
      description: 'POST GraphQL requests here (set as VITE_GRAPHQL_ENDPOINT).',
    });
  }
}
