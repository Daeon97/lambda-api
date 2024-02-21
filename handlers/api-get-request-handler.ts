import { APIGatewayProxyResult } from "aws-lambda";
import { DBDelegate } from "../delegates/db-delegate";

export class APIGetRequestHandler {
    public async processGetRequest(): Promise<APIGatewayProxyResult> {
        const dbDelegate = new DBDelegate();
        return await dbDelegate.getAllDataFromDatabase();
    }
}