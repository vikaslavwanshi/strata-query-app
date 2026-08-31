import type { CodegenConfig } from '@graphql-codegen/cli';

// Generates fully-typed GraphQL operations from the backend schema.
// Uses the client-preset: `graphql()` returns TypedDocumentNodes that Apollo's
// useQuery/useMutation infer result + variable types from.
const config: CodegenConfig = {
  schema: '../backend/src/graphql/schema.graphql',
  documents: ['src/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        // AWSDateTime is a plain ISO-8601 string on the wire.
        scalars: { AWSDateTime: 'string' },
        // Repo uses verbatimModuleSyntax — emit `import type` for type-only imports.
        useTypeImports: true,
      },
    },
  },
};

export default config;
