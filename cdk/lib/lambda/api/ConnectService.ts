import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { ConnectServiceClient } from "../../sdkClients/ConnectSeviceClient";

export class ConnectServiceLambda {
  constructor(
    private connect: ConnectServiceClient,
    private instanceId: string
  ) {}

  public async handler(event: APIGatewayProxyEvent, context: Context) {
    console.log("[event] ", JSON.stringify(event, null, 2));

    let response;
    let errorMessage;
    let responseData: any = {};
    const responseHeaders = {
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
      "Content-Type": "application/json",
    };

    if (
      event.path === "/connect/hours" &&
      event.httpMethod === "POST" &&
      event.body
    ) {
      try {
        const parsedBody = JSON.parse(event.body);
        const hoursOfOperationId = parsedBody["hoursOfOperationId"];
        const connectResponse = await this.connect.describeHoursOfOperation(
          hoursOfOperationId,
          this.instanceId
        );

        if (connectResponse) {
          responseData = connectResponse.HoursOfOperation;
        }
      } catch (e) {
        console.log(e);
        errorMessage = "Error getting hours of operation";
      }
    }

    if (
      event.path === "/connect/contact" &&
      event.httpMethod === "POST" &&
      event.body
    ) {
      try {
        const parsedBody = JSON.parse(event.body);

        const connectResponse = await this.connect.startOutboundVoiceContact(
          parsedBody["destinationPhoneNumber"],
          this.instanceId,
          parsedBody["contactFlowId"],
          parsedBody["attributes"],
          parsedBody["attributes"]["queueId"]
        );

        if (connectResponse) {
          responseData = connectResponse.ContactId;
        }
      } catch (e) {
        console.log(e);
        errorMessage = "Error starting contact";
      }
    }

    if (errorMessage) {
      response = {
        body: errorMessage,
        headers: responseHeaders,
        statusCode: 500,
      };
    } else {
      response = {
        body: JSON.stringify(responseData),
        headers: responseHeaders,
        statusCode: 200,
      };
    }

    return response;
  }
}

const connectServiceClient = new ConnectServiceClient();

export const ConnectService = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  const lambda = new ConnectServiceLambda(
    connectServiceClient,
    process.env.INSTANCE_ID as string
  );

  return lambda.handler(event, context);
};
