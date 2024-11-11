import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoServiceClient } from "../../lib/sdkClients/DynamoServiceClient";
import { GetPrompts, GetPromptsLambda } from "../../lib/lambda/core/GetPrompts";

const dynamoClientMock = mockClient(DynamoDBDocumentClient);

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

const mockEventA: any = {
  Details: {
    ContactData: {},
    Parameters: {
      contactFlowName: "Survey",
      languageCode: "en-US",
    },
  },
};

const mockMissingParameterEvent: any = {
  Details: {
    ContactData: {},
    Parameters: {
      contactFlowName: "Main",
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

const mockGetItemResponseA: GetCommandOutput = {
  Item: {
    ContactFlowName: "Survey",
    Prompts: [
      {
        Id: "Intro",
        PromptText: {
          "es-US": "Intro message",
        },
      },
      {
        Id: "ThankYou",
        PromptText: {
          "en-US": "Thank you message",
          "es-US": "Thank you message",
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

const lambdaSuccessResponseA = {
  operation: "getPrompts",
  Intro: "",
  ThankYou: "Thank you message",
};

const lambdaInvalidParametersResponse = {
  operation: "getPrompts",
  error: "Invalid parameters",
};

const lambdaDynamoErrorResponse = {
  operation: "getPrompts",
  error: "Error calling Dynamo",
};

describe("GetPrompts", () => {
  const dynamoClient = new DynamoServiceClient();

  beforeEach(() => {
    jest
      .spyOn<DynamoServiceClient, "getItem">(dynamoClient, "getItem")
      .mockImplementation((key, table) => {
        if (table === "prompt-test-table-name") {
          if (key.ContactFlowName === "Survey") {
            return new Promise((resolve, reject) => {
              resolve(mockGetItemResponseA);
            });
          }
          return new Promise((resolve, reject) => {
            resolve(mockGetItemResponse);
          });
        }

        return new Promise((resolve, reject) => {
          reject(new Error("Requested resource not found"));
        });
      });

    lambda = new GetPromptsLambda(dynamoClient, "prompt-test-table-name");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return prompts from dynamo", async () => {
    const response = await lambda.handler(mockEvent, context);

    expect(dynamoClient.getItem).toHaveBeenCalled();
    expect(response).toEqual(lambdaSuccessResponse);
  });

  test("should return empty prompts from dynamo for missing language key in item", async () => {
    const response = await lambda.handler(mockEventA, context);

    expect(dynamoClient.getItem).toHaveBeenCalled();
    expect(response).toEqual(lambdaSuccessResponseA);
  });

  test("should return an error for missing parameters", async () => {
    const response = await lambda.handler(mockMissingParameterEvent, context);

    expect(dynamoClient.getItem).not.toHaveBeenCalled();
    expect(response).toEqual(lambdaInvalidParametersResponse);
  });

  test("should return an error for bad dynamo api call", async () => {
    lambda = new GetPromptsLambda(dynamoClient, "bad-test-table-name");

    let response;

    try {
      response = await lambda.handler(mockEvent, context);
    } catch (e: any) {
      expect(e.message).toEqual("Requested resource not found");
    }

    expect(dynamoClient.getItem).toHaveBeenCalled();
    expect(response).toEqual(lambdaDynamoErrorResponse);
  });

  test("should create the lambda handler", async () => {
    dynamoClientMock.on(GetCommand).resolves(mockGetItemResponse);

    const response = await GetPrompts(mockEvent, context);

    expect(response).toEqual(lambdaSuccessResponse);

    dynamoClientMock.reset();
  });
});
