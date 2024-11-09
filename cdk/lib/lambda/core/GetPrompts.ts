import { ConnectContactFlowEvent, Context } from "aws-lambda";
import { DynamoClient } from "../../sdkClients/DynamoClient";
import { ContactFlowEventResponse } from "../constants";

type Prompt = {
  Id: string;
  PromptText: any;
};

type PromptDynamoItem = {
  ContactFlowName: string;
  Prompts: Prompt[];
};

export class GetPromptsLambda {
  constructor(
    private dynamoClient: DynamoClient,
    private promptTableName: string
  ) {}

  public async handler(
    event: ConnectContactFlowEvent,
    context: Context
  ): Promise<ContactFlowEventResponse> {
    console.log("[event] ", JSON.stringify(event, null, 2));

    if (
      !event.Details.Parameters["contactFlowName"] ||
      !event.Details.Parameters["languageCode"]
    ) {
      return {
        operation: "getPrompts",
        error: "Invalid parameters",
      };
    }

    const prompts = await this.getPrompts(
      event.Details.Parameters["contactFlowName"]
    );

    if (!prompts) {
      return {
        operation: "getPrompts",
        error: "Error calling Dynamo",
      };
    }

    const response: ContactFlowEventResponse = {
      operation: "getPrompts",
      ...this.filterPrompts(
        prompts.Item as PromptDynamoItem,
        event.Details.Parameters["languageCode"]
      ),
    };

    return response;
  }

  public filterPrompts(prompts: PromptDynamoItem, languageCode: string) {
    let filteredPrompts: any = {};

    prompts.Prompts.forEach((prompt) => {
      if (prompt.PromptText[languageCode]) {
        filteredPrompts[prompt.Id] = prompt.PromptText[languageCode];
      } else {
        filteredPrompts[prompt.Id] = "";
      }
    });

    return filteredPrompts;
  }

  public async getPrompts(contactFlowName: string) {
    try {
      const dynamoResponse = await this.dynamoClient.getItem(
        { ContactFlowName: contactFlowName },
        this.promptTableName
      );

      return dynamoResponse;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

const dynamoClient = new DynamoClient();

export const GetPrompts = async (
  event: ConnectContactFlowEvent,
  context: Context
) => {
  const lambda = new GetPromptsLambda(
    dynamoClient,
    process.env.PROMPT_TABLE_NAME as string
  );

  return lambda.handler(event, context);
};
