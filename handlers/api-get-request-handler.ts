import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBDelegate } from "../delegates/dynamo-db-delegate";

export class APIGetRequestHandler {
    public async processGetRequest(): Promise<APIGatewayProxyResult> {
        const dynamoDBDelegate = new DynamoDBDelegate();
        return await dynamoDBDelegate.getAllDataFromDatabase();
    }
}