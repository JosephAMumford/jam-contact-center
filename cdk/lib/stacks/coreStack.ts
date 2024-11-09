import * as cdk from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { CONNECT_INSTANCE_ID } from "../lambda/constants";

export class CoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const promptTable = new Table(this, "PromptTable", {
      partitionKey: {
        name: "ContactFlowName",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: "jam-cc-prompts",
    });

    const getPromptsLambdaRole = new Role(this, "GetPromptsLambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      roleName: "GetPrompts-LambdaRole",
      inlinePolicies: {
        "lambda-policy": new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["dynamoDb:GetItem"],
              effect: Effect.ALLOW,
              resources: [promptTable.tableArn],
            }),
            new PolicyStatement({
              actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
              ],
              effect: Effect.ALLOW,
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    const getPromptsLambda = new NodejsFunction(this, "GetPromptsLambda", {
      bundling: {
        minify: false,
      },
      description: "Get prompts from DynamoDB",
      entry: "./lib/lambda/core/GetPrompts.ts",
      environment: {
        PROMPT_TABLE_NAME: promptTable.tableName,
      },
      functionName: "GetPrompts",
      handler: "GetPrompts",
      memorySize: 128,
      role: getPromptsLambdaRole,
      runtime: Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(5),
    });

    getPromptsLambda.addPermission("conenct-permission", {
      principal: new ServicePrincipal("connect.amazonaws.com"),
      sourceArn: `arn:aws:connect:${props?.env?.region}:${props?.env?.account}:instance/${CONNECT_INSTANCE_ID}`,
      sourceAccount: props?.env?.account,
    });
  }
}
