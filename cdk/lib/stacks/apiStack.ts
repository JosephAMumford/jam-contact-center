import * as cdk from "aws-cdk-lib";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { CONNECT_INSTANCE_ID } from "../lambda/constants";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  LambdaRestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectServiceLambdaRole = new Role(
      this,
      "ConnectServiceLambdaRole",
      {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        roleName: "ConnectService-LambdaRole",
        inlinePolicies: {
          "lambda-policy": new PolicyDocument({
            statements: [
              new PolicyStatement({
                actions: [
                  "connect:DescribeHoursOfOperation",
                  "connect:StartOutboundVoiceContact",
                ],
                effect: Effect.ALLOW,
                resources: [
                  `arn:aws:connect:${props?.env?.region}:${props?.env?.account}:instance/${CONNECT_INSTANCE_ID}/*`,
                ],
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
      }
    );

    const connectServiceLambda = new NodejsFunction(
      this,
      "ConnectServiceLambda",
      {
        bundling: {
          minify: false,
        },
        description: "API integration with Connect",
        entry: "./lib/lambda/api/ConnectService.ts",
        environment: {
          INSTANCE_ID: CONNECT_INSTANCE_ID,
        },
        functionName: "ConnectService",
        handler: "ConnectService",
        memorySize: 128,
        role: connectServiceLambdaRole,
        runtime: Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(10),
      }
    );

    const auth = new CognitoUserPoolsAuthorizer(this, "ApiAuthorizer", {
      cognitoUserPools: [
        UserPool.fromUserPoolId(this, "jam-cc-userpool", "us-east-1_1KYqo4IOs"),
      ],
    });

    const api = new LambdaRestApi(this, "Api", {
      handler: connectServiceLambda,
      deploy: true,
      proxy: false,
    });

    const connectResource = api.root.addResource("connect");

    const contactResource = connectResource.addResource("contact");
    contactResource.addMethod(
      "POST",
      new LambdaIntegration(connectServiceLambda),
      { authorizer: auth, authorizationType: AuthorizationType.COGNITO }
    );
    contactResource.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["POST"],
      allowCredentials: true,
    });

    const hoursResource = connectResource.addResource("hours");
    hoursResource.addMethod(
      "POST",
      new LambdaIntegration(connectServiceLambda),
      { authorizer: auth, authorizationType: AuthorizationType.COGNITO }
    );
    hoursResource.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["POST"],
      allowCredentials: true,
    });

    const customerResource = api.root.addResource("customer");
    customerResource.addMethod(
      "POST",
      new LambdaIntegration(connectServiceLambda),
      { authorizer: auth, authorizationType: AuthorizationType.COGNITO }
    );
    customerResource.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: ["POST"],
      allowCredentials: true,
    });
  }
}
