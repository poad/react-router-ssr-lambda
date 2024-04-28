#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { compileBundles } from '../lib/process/setup';

const app = new cdk.App();

compileBundles();

const name = 'remix-ssr-lambda-example';
new CdkStack(app, `${name}-stack`, {
  name,
});
