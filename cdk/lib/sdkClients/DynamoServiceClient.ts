import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";

export class DynamoServiceClient {
  dynamo: DynamoDBDocumentClient;

  constructor() {
    this.dynamo = DynamoDBDocumentClient.from(new DynamoDBClient());
  }

  public async getItem(key: any, tableName: string): Promise<GetCommandOutput> {
    const input: GetCommandInput = {
      Key: key,
      TableName: tableName,
    };

    return this.dynamo.send(new GetCommand(input));
  }
}
