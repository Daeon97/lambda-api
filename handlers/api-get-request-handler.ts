import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBDelegate } from "../delegates/dynamo-db-delegate";

export class APIGetRequestHandler {

    public async processGetRequest(path: string): Promise<APIGatewayProxyResult> {
        return this.checkGetRequestHasPathVariable(path);
    }

    private async checkGetRequestHasPathVariable(path: string): Promise<APIGatewayProxyResult> {
        const pathParts = path.split(/\//);
        const rcNumber = pathParts[pathParts.length - 1];

        if (rcNumber === "electri-safe") {
            const statusCode = 400;

            const result: APIGatewayProxyResult = {
                statusCode,
                body: JSON.stringify({
                    statusCode,
                    message: `Resource identifier is missing. Please specify the resource identifier for this request`,
                }),
            }

            return result;
        }

        const dynamoDBDelegate = new DynamoDBDelegate();
        return await dynamoDBDelegate.getDataFromDatabase(rcNumber);
    }
}