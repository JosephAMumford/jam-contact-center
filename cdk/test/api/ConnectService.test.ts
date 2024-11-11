import {
  ConnectClient,
  DescribeHoursOfOperationCommand,
  StartOutboundVoiceContactCommand,
} from "@aws-sdk/client-connect";
import { mockClient } from "aws-sdk-client-mock";
import {
  ConnectService,
  ConnectServiceLambda,
} from "../../lib/lambda/api/ConnectService";
import { ConnectServiceClient } from "../../lib/sdkClients/ConnectSeviceClient";

const connectClientMock = mockClient(ConnectClient);

let lambda: ConnectServiceLambda;

const mockHoursEvent: any = {
  path: "/connect/hours",
  httpMethod: "POST",
  body: JSON.stringify({
    hoursOfOperationId: "test-id-1",
  }),
};

const mockStartContactEvent: any = {
  path: "/connect/contact",
  httpMethod: "POST",
  body: JSON.stringify({
    destinationPhoneNumber: "+15551234567",
    contactFlowId: "contact-flow-id",
    attributes: {
      queueId: "queue-id",
    },
  }),
};

const context: any = {};

const lambdaHoursSuccessResposne = {};

describe("ConnectService", () => {
  const connectServiceClient = new ConnectServiceClient();

  beforeEach(() => {
    jest
      .spyOn<ConnectServiceClient, "describeHoursOfOperation">(
        connectServiceClient,
        "describeHoursOfOperation"
      )
      .mockImplementation((hoursOfOperationId, instanceId) => {
        if (instanceId === "test-instance-id") {
          return new Promise((resolve, reject) => {
            resolve({
              HoursOfOperation: {
                Config: [],
              },
              $metadata: {},
            });
          });
        }

        return new Promise((resolve, reject) => {
          reject(new Error("Requested resource not found"));
        });
      });

    jest
      .spyOn<ConnectServiceClient, "startOutboundVoiceContact">(
        connectServiceClient,
        "startOutboundVoiceContact"
      )
      .mockImplementation(
        (
          destinationPhoneNumber,
          instanceId,
          contactFlowId,
          attributes,
          queueId
        ) => {
          if (instanceId === "test-instance-id") {
            return new Promise((resolve, reject) => {
              resolve({ ContactId: "contact-id", $metadata: {} });
            });
          }

          return new Promise((resolve, reject) => {
            reject(new Error("Requested resource not found"));
          });
        }
      );

    lambda = new ConnectServiceLambda(connectServiceClient, "test-instance-id");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return a success response for /connect/hours", async () => {
    const response = await lambda.handler(mockHoursEvent, context);

    expect(connectServiceClient.describeHoursOfOperation).toHaveBeenCalled();
    expect(response).toEqual({
      body: JSON.stringify({
        Config: [],
      }),
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Content-Type": "application/json",
      },
      statusCode: 200,
    });
  });

  test("should return an error response for /connect/hours and bad connect api call", async () => {
    lambda = new ConnectServiceLambda(connectServiceClient, "bad-instance-id");
    const response = await lambda.handler(mockHoursEvent, context);

    expect(connectServiceClient.describeHoursOfOperation).toHaveBeenCalled();
    expect(response).toEqual({
      body: "Error getting hours of operation",
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Content-Type": "application/json",
      },
      statusCode: 500,
    });
  });

  test("should return a success response for /connect/contact", async () => {
    const response = await lambda.handler(mockStartContactEvent, context);

    expect(connectServiceClient.startOutboundVoiceContact).toHaveBeenCalled();
    expect(response).toEqual({
      body: JSON.stringify({ ContactId: "contact-id", $metadata: {} }),
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Content-Type": "application/json",
      },
      statusCode: 200,
    });
  });

  test("should return an error response for /connect/contact and bad connect api call", async () => {
    lambda = new ConnectServiceLambda(connectServiceClient, "bad-instance-id");
    const response = await lambda.handler(mockStartContactEvent, context);

    expect(connectServiceClient.startOutboundVoiceContact).toHaveBeenCalled();
    expect(response).toEqual({
      body: "Error starting contact",
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Content-Type": "application/json",
      },
      statusCode: 500,
    });
  });

  test("should create the lambda handler", async () => {
    connectClientMock.on(DescribeHoursOfOperationCommand).resolves({
      HoursOfOperation: {
        Config: [],
      },
      $metadata: {},
    });

    const response = await ConnectService(mockHoursEvent, context);

    expect(response).toEqual({
      body: JSON.stringify({
        Config: [],
      }),
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Content-Type": "application/json",
      },
      statusCode: 200,
    });

    connectClientMock.reset();
  });
});
