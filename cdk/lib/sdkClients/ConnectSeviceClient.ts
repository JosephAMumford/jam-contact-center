import {
  ConnectClient,
  DescribeHoursOfOperationCommand,
  DescribeHoursOfOperationCommandInput,
  DescribeHoursOfOperationCommandOutput,
  StartOutboundVoiceContactCommand,
  StartOutboundVoiceContactCommandInput,
  StartOutboundVoiceContactCommandOutput,
} from "@aws-sdk/client-connect";

export class ConnectServiceClient {
  connect: ConnectClient;

  constructor() {
    this.connect = new ConnectClient();
  }

  public async describeHoursOfOperation(
    hoursId: string,
    instanceId: string
  ): Promise<DescribeHoursOfOperationCommandOutput> {
    const input: DescribeHoursOfOperationCommandInput = {
      HoursOfOperationId: hoursId,
      InstanceId: instanceId,
    };

    return await this.connect.send(new DescribeHoursOfOperationCommand(input));
  }

  public async startOutboundVoiceContact(
    destinationPhoneNumber: string,
    instanceId: string,
    contactFlowId: string,
    attributes: any,
    queueId: string
  ): Promise<StartOutboundVoiceContactCommandOutput> {
    const input: StartOutboundVoiceContactCommandInput = {
      DestinationPhoneNumber: destinationPhoneNumber,
      ContactFlowId: contactFlowId,
      InstanceId: instanceId,
      Attributes: attributes,
      QueueId: queueId,
    };

    return await this.connect.send(new StartOutboundVoiceContactCommand(input));
  }
}
