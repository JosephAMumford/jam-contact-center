import { GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import { DynamoServiceClient } from "../../lib/sdkClients/DynamoServiceClient";
import { GetPromptsLambda } from "../../lib/lambda/core/GetPrompts";

let lambda: GetPromptsLambda;

const mockEvent: any = {
  Details: {
    ContactData: {},
    Parameters: {
      contactFlowName: "Main",
      languageCode: "en-US",
    },
  },
};

const context: any = {};

const mockGetItemResponse: GetCommandOutput = {
  Item: {
    ContactFlowName: "Main",
    Prompts: [
      {
        Id: "MainMenu",
        PromptText: {
          "en-US": "Main menu options",
          "es-US": "Main menu options",
        },
      },
      {
        Id: "Welcome",
        PromptText: {
          "en-US": "Welcome message",
          "es-US": "Welcome message",
        },
      },
    ],
  },
  $metadata: {},
};

const lambdaSuccessResponse = {
  operation: "getPrompts",
  MainMenu: "Main menu options",
  Welcome: "Welcome message",
};

describe("GetPrompts", () => {
  const dynamoClient = new DynamoServiceClient();

  beforeEach(() => {
    jest
      .spyOn<DynamoServiceClient, "getItem">(dynamoClient, "getItem")
      .mockImplementation((key, table) => {
        return new Promise((resolve, reject) => {
          resolve(mockGetItemResponse);
        });
      });

    lambda = new GetPromptsLambda(dynamoClient, "prompt-test-table-name");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return prompts from dynamo", async () => {
    const response = await lambda.handler(mockEvent, context);

    expect(response).toEqual(lambdaSuccessResponse);
  });
});
