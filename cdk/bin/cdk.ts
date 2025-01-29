#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();

const name = 'react-router-ssr-lambda';
new CdkStack(app, `${name}-stack`, {
  name,
});
