# Strata Query App — 2-Day Build Plan

**Stack:** TypeScript everywhere · Apollo Server on Lambda · AWS CDK · DynamoDB · Vite + React + Apollo Client

**Goal:** Practice GraphQL + TypeScript + serverless AWS. Residents submit queries/tickets about property issues; admins view, filter, and respond.

---

## Repo Structure

```
strata-query-app/
├── backend/     # Apollo Lambda + resolvers (TS)
├── infra/       # CDK app (TS)
├── frontend/    # Vite + React + Apollo Client (TS)
└── README.md
```

---

## Data Model

**Properties table**
- PK: `id` (UUID)
- Attributes: `address`, `strataPlanNumber`, `createdAt`

**Tickets table**
- PK: `id` (UUID)
- Attributes: `propertyId`, `title`, `description`, `status`, `submittedBy`, `response`, `respondedBy`, `createdAt`, `respondedAt`
- GSI: `propertyId-status-index` (PK `propertyId`, SK `status`)

## GraphQL Schema (target)

```graphql
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

enum TicketStatus { OPEN IN_PROGRESS RESOLVED }

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
```

---

## DAY 1 — Backend + Infra

### Step 1: Scaffold the repo
- [ ] Create root folder `strata-query-app/` with `backend/`, `infra/`, `frontend/` subfolders
- [ ] Init git repo
- [ ] Each subfolder gets its own `package.json` + `tsconfig.json` (independent npm projects)

### Step 2: CDK skeleton (`infra/`)
- [ ] `cdk init app --language typescript` inside `infra/`
- [ ] Define `StrataQueryStack` in `lib/strata-query-stack.ts` with:
  - `PropertiesTable` (PK `id`)
  - `TicketsTable` (PK `id`) + GSI `propertyId-status-index` (PK `propertyId`, SK `status`)
  - `NodejsFunction` pointing at `backend/src/lambda/handler.ts`
  - Env vars on the Lambda: `PROPERTIES_TABLE_NAME`, `TICKETS_TABLE_NAME`
  - `table.grantReadWriteData(fn)` for both tables
  - HTTP API (API Gateway) with single route `POST /graphql` → Lambda integration, CORS enabled
  - CfnOutput for the API endpoint URL
- [ ] Deploy skeleton with a placeholder "hello world" handler to confirm the whole pipeline (CDK → Lambda → API Gateway) actually works before writing real logic

### Step 3: Backend project setup (`backend/`)
- [ ] Install: `@apollo/server`, `@as-integrations/aws-lambda`, `graphql`, `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `uuid`
- [ ] Create `src/graphql/schema.graphql` (paste schema above)
- [ ] Create `src/db/dynamoClient.ts` — exports a shared `DynamoDBDocumentClient`
- [ ] Create `src/lambda/handler.ts` — Apollo Server instance wrapped with `startServerAndCreateLambdaHandler`

### Step 4: Property resolvers (build first — simpler, validates the pattern)
- [ ] `listProperties` — Scan on Properties table
- [ ] `getProperty(id)` — GetItem
- [ ] `createProperty` — PutItem with generated UUID + `createdAt`
- [ ] `updateProperty` — UpdateItem
- [ ] `deleteProperty` — DeleteItem (no referential check — accept orphaned tickets for now)
- [ ] Deploy, test each in Apollo Sandbox or Postman against the live endpoint

### Step 5: Ticket resolvers (reuse the pattern from Step 4)
- [ ] `submitTicket` — PutItem, default `status: OPEN`
- [ ] `listTickets(propertyId, status)` — Query on GSI if `propertyId` provided, else Scan
- [ ] `getTicket(id)` — GetItem
- [ ] `respondToTicket` — UpdateItem, sets `response`, `respondedBy`, `respondedAt`, `status: IN_PROGRESS` (or leave status separate — your call)
- [ ] `updateTicketStatus` — UpdateItem on `status`
- [ ] `deleteTicket` — DeleteItem
- [ ] Deploy, test full CRUD via Sandbox/Postman

**End of Day 1 checkpoint:** Full schema deployed and testable via Apollo Sandbox — every query/mutation works against real DynamoDB tables.

---

## DAY 2 — Frontend

### Step 6: Scaffold Vite app (`frontend/`)
- [ ] `npm create vite@latest frontend -- --template react-ts`
- [ ] Install: `@apollo/client`, `graphql`
- [ ] Install codegen: `@graphql-codegen/cli`, `@graphql-codegen/client-preset`
- [ ] Set up `.env.local` with `VITE_GRAPHQL_ENDPOINT` (from CDK output)

### Step 7: Apollo Client + Codegen setup
- [ ] `src/apollo/client.ts` — `ApolloClient` + `HttpLink` using `import.meta.env.VITE_GRAPHQL_ENDPOINT`
- [ ] `codegen.ts` config pointing at `../backend/src/graphql/schema.graphql` and `src/**/*.tsx`
- [ ] Write `.graphql` operations (or inline `gql` tags) for each query/mutation
- [ ] Run codegen, confirm typed hooks generate (e.g. `useListPropertiesQuery`, `useSubmitTicketMutation`)

### Step 8: Build screens (no router — simple tab state is enough)
- [ ] `PropertiesAdmin.tsx` — list properties, create new property form
- [ ] `ResidentSubmit.tsx` — ticket form: select property, title, description, submittedBy
- [ ] `AdminDashboard.tsx` — list tickets, filter by status, respond form inline

### Step 9: Wire it all up
- [ ] `App.tsx` — tab switcher between the three screens, wrap in `ApolloProvider`
- [ ] Test full flow end-to-end: create property → submit ticket → see it in dashboard → respond → status updates

### Step 10: Stretch goal (only if time remains)
- [ ] Add an `aiSuggestedCategory` field to `Ticket`
- [ ] In `submitTicket` resolver, call Bedrock (or any LLM) to categorize/summarize the ticket description
- [ ] Display the AI-suggested category on the admin dashboard

**End of Day 2 checkpoint:** Working deployed app — resident can submit, admin can view/filter/respond, all through typed GraphQL operations.

---

## Open Decisions to Make While Building
- Does `respondToTicket` auto-change status to `IN_PROGRESS`, or stay independent from `updateTicketStatus`?
- Skip property-deletion referential check (accept orphaned tickets) — confirmed for now, revisit if time allows.

## Explicitly Out of Scope (don't get pulled in)
- Real authentication (Cognito) — mock roles only
- Elasticsearch
- Flutter / mobile
- File uploads, notifications
- React Router (tab state is enough for 3 screens)
