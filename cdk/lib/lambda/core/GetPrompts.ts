import { ConnectContactFlowEvent, Context } from "aws-lambda";

export class GetPromptsLambda {
  constructor() {}

  public async handler(event: ConnectContactFlowEvent, context: Context) {
    console.log("[event] ", JSON.stringify(event, null, 2));

    
    return {};
  }
}

export const GetPrompts = async (
  event: ConnectContactFlowEvent,
  context: Context
) => {
  const lambda = new GetPromptsLambda();

  return lambda.handler(event, context);
};
