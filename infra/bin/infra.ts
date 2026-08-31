#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();

const stack = new InfraStack(app, 'StrataQueryStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Tag every resource for cost tracking / attribution.
cdk.Tags.of(stack).add('project', 'strata-query-app');
