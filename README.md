# Strata Query App

A small end-to-end **GraphQL + TypeScript + serverless AWS** app. Residents submit
maintenance queries/tickets about a strata property; admins list, filter, and respond.

Built as a learning project to practice Apollo GraphQL on Lambda, DynamoDB single-table
access patterns (incl. a GSI), AWS CDK, and typed GraphQL on the frontend via codegen.

```
┌────────────┐   POST /graphql   ┌───────────────┐   ┌──────────────────┐
│  Vite +    │ ────────────────▶ │  API Gateway  │──▶│  Lambda (Node 22) │
│  React +   │   (Apollo Client) │  HTTP API v2  │   │  Apollo Server v5 │
│  Apollo    │ ◀──────────────── │               │   │  + resolvers      │
└────────────┘      JSON         └───────────────┘   └───────┬──────────┘
                                                             │ AWS SDK v3
                                                    ┌────────▼─────────┐
                                                    │ DynamoDB          │
                                                    │  • Properties     │
                                                    │  • Tickets (+GSI) │
                                                    └───────────────────┘
```

## Stack

| Layer     | Tech                                                                 |
|-----------|----------------------------------------------------------------------|
| Frontend  | Vite + React + TypeScript, Apollo Client v4, GraphQL Code Generator   |
| API       | API Gateway HTTP API → Lambda (Node 22), Apollo Server v5             |
| Data      | DynamoDB (on-demand): `Properties`, `Tickets` + `propertyId-status-index` GSI |
| Infra     | AWS CDK (TypeScript), esbuild bundling                                |
| Region    | `ap-southeast-2` (Sydney)                                             |

## Repo layout

```
strata-query-app/
├── backend/     # Apollo Server + resolvers (ESM TypeScript, bundled by CDK)
│   └── src/
│       ├── graphql/     schema.graphql · typeDefs.ts · types.ts
│       ├── db/          dynamoClient.ts (shared DynamoDBDocumentClient)
│       ├── resolvers/   propertyResolvers · ticketResolvers · index (scalar + map)
│       └── lambda/      handler.ts (startServerAndCreateLambdaHandler)
├── infra/       # CDK app — tables, Lambda, HTTP API, outputs, tags, tests
└── frontend/    # Vite app — apollo/client.ts, codegen (src/gql/), 3 screens
```

## How it works

1. The browser runs **Apollo Client**, which POSTs GraphQL operations to the HTTP API
   endpoint (from `VITE_GRAPHQL_ENDPOINT`).
2. API Gateway invokes a single **Lambda**. `@as-integrations/aws-lambda` adapts the
   API Gateway v2 event into an **Apollo Server** request.
3. Resolvers talk to **DynamoDB** with the AWS SDK v3 Document client:
   - `listProperties` / `listTickets` → `Scan` (tickets filtered by `status` when given).
   - `listTickets(propertyId, …)` → **`Query` on the GSI** for efficient per-property reads.
   - Everything else → `GetItem` / `PutItem` / `UpdateItem` / `DeleteItem`.
4. `respondToTicket` records the response **and** moves the ticket to `IN_PROGRESS`;
   `updateTicketStatus` changes status independently (e.g. → `RESOLVED`).
5. The frontend’s types are **generated from the schema** (`npm run codegen`), so queries,
   variables, and results are fully typed with no hand-written interfaces.

## Prerequisites

- Node 22+, npm
- AWS credentials configured for `ap-southeast-2`, CDK bootstrapped in the account.

## Deploy

```bash
# 1. Install deps
cd backend && npm install && cd ../infra && npm install && cd ../frontend && npm install

# 2. Deploy the backend + infra (prints the GraphQL endpoint)
cd ../infra
npx cdk deploy --require-approval never --outputs-file cdk-outputs.json

# 3. Point the frontend at the deployed endpoint
cd ../frontend
echo "VITE_GRAPHQL_ENDPOINT=<GraphqlEndpoint from the CDK output>" > .env.local
npm run codegen   # generate typed operations from the schema
npm run dev       # http://localhost:5173
```

## Tests

```bash
cd infra && npx jest          # CDK assertions: tables, GSI, Node 22 Lambda, POST /graphql route
cd backend && npx tsc --noEmit # backend typecheck
cd frontend && npx tsc -b      # frontend typecheck
```

## Cost

Everything is serverless and pay-per-request, sitting inside the perpetual AWS free tiers
(1M Lambda invocations, 1M HTTP API requests, 25 GB + 25 WCU/RCU-equivalent DynamoDB
on-demand per month). For light/learning traffic this runs at **effectively $0/month**.
There are **no always-on resources** — no NAT, no provisioned capacity, no idle compute.
The frontend runs locally (`npm run dev`), so there is no hosting cost either.

Every resource is tagged `project=strata-query-app` for cost attribution.

## Teardown

```bash
cd infra && npx cdk destroy
```

Tables use `RemovalPolicy.DESTROY`, so `cdk destroy` removes everything (data included).

## Possible next steps (out of scope for the 2-day build)

- **AI triage (stretch):** add `aiSuggestedCategory` to `Ticket` and call Amazon Bedrock
  in `submitTicket` to auto-categorise the description.
- Real auth (Cognito) instead of free-text `submittedBy` / `respondedBy`.
- Host the frontend on S3 + CloudFront (still ~free) for a fully-deployed demo URL.
- Referential integrity: block deleting a property that still has tickets.
