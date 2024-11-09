#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CoreStack } from "./stacks/coreStack";

const app = new cdk.App();
const environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new CoreStack(app, "CoreStack", {
  env: environment,
  stackName: "connect-core-stack",
});
