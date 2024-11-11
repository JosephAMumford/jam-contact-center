import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoServiceClient } from "../../lib/sdkClients/DynamoServiceClient";
import {
  GetCustomerData,
  GetCustomerDataLambda,
} from "../../lib/lambda/core/GetCustomerData";

const dynamoClientMock = mockClient(DynamoDBDocumentClient);

let lambda: GetCustomerDataLambda;

const mockEvent: any = {
  Details: {
    ContactData: {
      CustomerEndpoint: {
        Address: "+15551234567",
      },
    },
  },
};

const mockMissingCustomerEndpointEvent: any = {
  Details: {
    ContactData: {
      CustomerEndpoint: null,
    },
  },
};

const context: any = {};

const mockGetItemResponse: GetCommandOutput = {
  Item: {
    PhoneNumber: "+15551234567",
    FirstName: "First",
    LastName: "Last",
    VIP: "true",
  },
  $metadata: {},
};

const lambdaSuccessResponse = {
  operation: "getCustomerData",
  PhoneNumber: "+15551234567",
  FirstName: "First",
  LastName: "Last",
  VIP: "true",
};

const lambdaInvalidParameterResponse = {
  opertation: "getCustomerData",
  error: "InvalidParameters",
};

const lambdaDynamoErrorResponse = {
  opertation: "getCustomerData",
  error: "Error calling Dyanmo",
};

describe("GetCustomerData", () => {
  const dynamoClient = new DynamoServiceClient();

  beforeEach(() => {
    jest
      .spyOn<DynamoServiceClient, "getItem">(dynamoClient, "getItem")
      .mockImplementation((key, table) => {
        if (table === "customer-data-test-table-name") {
          return new Promise((resolve, reject) => {
            resolve(mockGetItemResponse);
          });
        }

        return new Promise((resolve, reject) => {
          reject(new Error("Requested resource not found"));
        });
      });

    lambda = new GetCustomerDataLambda(
      dynamoClient,
      "customer-data-test-table-name"
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return prompts from dynamo", async () => {
    const response = await lambda.handler(mockEvent, context);

    expect(dynamoClient.getItem).toHaveBeenCalled();
    expect(response).toEqual(lambdaSuccessResponse);
  });

  test("should return an error for missing parameters", async () => {
    const response = await lambda.handler(
      mockMissingCustomerEndpointEvent,
      context
    );

    expect(dynamoClient.getItem).not.toHaveBeenCalled();
    expect(response).toEqual(lambdaInvalidParameterResponse);
  });

  test("should return an error for bad dynamo api call", async () => {
    lambda = new GetCustomerDataLambda(dynamoClient, "bad-test-table-name");

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

    const response = await GetCustomerData(mockEvent, context);

    expect(response).toEqual(lambdaSuccessResponse);

    dynamoClientMock.reset();
  });
});
