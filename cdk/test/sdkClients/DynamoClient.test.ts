import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoClient } from "../../lib/sdkClients/DynamoClient";

const dynamoClientMock = mockClient(DynamoDBDocumentClient);

const dynamoClient = new DynamoClient();

const mockDynamoResponse: GetCommandOutput = {
  Item: {},
  $metadata: {},
};

describe("DynamoClient", () => {
  beforeEach(() => {
    dynamoClientMock.on(GetCommand).resolves(mockDynamoResponse);
  });

  afterEach(() => {
    dynamoClientMock.reset();
  });

  test("should return response for getItem api call", async () => {
    const response = await dynamoClient.getItem({ TestKey: "TestKey" }, "test-table");

    expect(response).toEqual(mockDynamoResponse);
  });
});
