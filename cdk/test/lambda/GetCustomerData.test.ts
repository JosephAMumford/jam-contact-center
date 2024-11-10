import { GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import { DynamoServiceClient } from "../../lib/sdkClients/DynamoServiceClient";
import { GetCustomerDataLambda } from "../../lib/lambda/core/GetCustomerData";

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

describe("GetCustomerData", () => {
  const dynamoClient = new DynamoServiceClient();

  beforeEach(() => {
    jest
      .spyOn<DynamoServiceClient, "getItem">(dynamoClient, "getItem")
      .mockImplementation((key, table) => {
        return new Promise((resolve, reject) => {
          resolve(mockGetItemResponse);
        });
      });

    lambda = new GetCustomerDataLambda(dynamoClient, "prompt-test-table-name");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return prompts from dynamo", async () => {
    const response = await lambda.handler(mockEvent, context);

    expect(response).toEqual(lambdaSuccessResponse);
  });
});
