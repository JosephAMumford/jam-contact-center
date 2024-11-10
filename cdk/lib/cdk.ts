#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CoreStack } from "./stacks/coreStack";
import { WebsiteStack } from "./stacks/websiteStack";
import { ApiStack } from "./stacks/apiStack";

const app = new cdk.App();
const environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new CoreStack(app, "CoreStack", {
  env: environment,
  stackName: "connect-core-stack",
});

new WebsiteStack(app, "WebsiteStack", {
  env: environment,
  stackName: "website-stack",
});

new ApiStack(app, "ApiStack", {
  env: environment,
  stackName: "api-stack",
});
