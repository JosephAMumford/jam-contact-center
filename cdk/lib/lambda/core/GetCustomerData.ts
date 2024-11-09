import { ConnectContactFlowEvent, Context } from "aws-lambda";
import { DynamoClient } from "../../sdkClients/DynamoClient";
import { ContactFlowEventResponse } from "../constants";

export class GetCustomerDataLambda {
  constructor(
    private dynamoClient: DynamoClient,
    private customerDataTableName: string
  ) {}

  public async handler(event: ConnectContactFlowEvent, context: Context) {
    console.log("[event] ", JSON.stringify(event, null, 2));

    if (!event.Details.ContactData.CustomerEndpoint?.Address) {
      return {
        opertation: "getCustomerData",
        error: "InvalidParameters",
      };
    }

    const customerData = await this.getCustomerData(
      event.Details.ContactData.CustomerEndpoint.Address
    );

    if (!customerData) {
      return {
        opertation: "getCustomerData",
        error: "Error calling Dyanmo",
      };
    }

    const response: ContactFlowEventResponse = {
      operation: "getCustomerData",
      ...customerData.Item,
    };

    return response;
  }

  public async getCustomerData(phoneNumber: string) {
    try {
      const dynamoResponse = await this.dynamoClient.getItem(
        { PhoneNumber: phoneNumber },
        this.customerDataTableName
      );

      return dynamoResponse;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

const dynamoClient = new DynamoClient();

export const GetCustomerData = async (
  event: ConnectContactFlowEvent,
  context: Context
) => {
  const lambda = new GetCustomerDataLambda(
    dynamoClient,
    process.env.CUSTOMER_DATA_TABLE_NAME as string
  );

  return lambda.handler(event, context);
};
