import {
  ConnectClient,
  DescribeHoursOfOperationCommand,
  DescribeHoursOfOperationCommandOutput,
  StartOutboundVoiceContactCommand,
  StartOutboundVoiceContactCommandOutput,
} from "@aws-sdk/client-connect";
import { mockClient } from "aws-sdk-client-mock";
import { ConnectServiceClient } from "../../lib/sdkClients/ConnectSeviceClient";

const connectClientMock = mockClient(ConnectClient);

const connectServiceClient = new ConnectServiceClient();

const mockHoursOfOperationResponse: DescribeHoursOfOperationCommandOutput = {
  $metadata: {},
};

const mockStartOutboundVoiceContactResponse: StartOutboundVoiceContactCommandOutput =
  {
    ContactId: "test-contact-id",
    $metadata: {},
  };

describe("ConnectServiceClient", () => {
  beforeEach(() => {
    connectClientMock
      .on(DescribeHoursOfOperationCommand)
      .resolves(mockHoursOfOperationResponse);

    connectClientMock
      .on(StartOutboundVoiceContactCommand)
      .resolves(mockStartOutboundVoiceContactResponse);
  });

  afterEach(() => {
    connectClientMock.reset();
  });

  test("should return response for describeHoursOfOpearation", async () => {
    const response = await connectServiceClient.describeHoursOfOperation(
      "test-hours-id",
      "test-instance-id"
    );

    expect(response).toEqual(mockHoursOfOperationResponse);
  });

  test("should return response for startOutboundVoiceContact", async () => {
    const response = await connectServiceClient.startOutboundVoiceContact(
      "+15551234567",
      "test-instance-id",
      "test-contact-flow-id",
      { queueId: "test-queue-id" },
      "test-queue-id"
    );

    expect(response).toEqual(mockStartOutboundVoiceContactResponse);
  });
});
