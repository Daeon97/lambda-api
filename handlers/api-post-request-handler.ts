import { APIGatewayProxyResult } from "aws-lambda";
import { Company } from "../models/company";
import { DynamoDBDelegate } from "../delegates/dynamo-db-delegate";

export class APIPostRequestHandler {

    public async processPostRequest(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
        return this.checkPostRequestHasBody(requestBody);
    }

    private async checkPostRequestHasBody(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
        if (!requestBody) {
            const statusCode = 400;

            const result: APIGatewayProxyResult = {
                statusCode,
                body: JSON.stringify({
                    statusCode,
                    message: `Request body is missing. Please specify a request body for this request`,
                }),
            }

            return result;
        }

        return this.checkPostRequestBodyComplete(requestBody);
    }

    private async checkPostRequestBodyComplete(requestBody: string): Promise<APIGatewayProxyResult> {
        let result: APIGatewayProxyResult;

        try {
            const company = this.computeCompany(requestBody);

            if (!company.rcNumber || !company.name || !company.address || !company.iso) {
                throw 'Some fields are undefined';
            }

            const dynamoDBDelegate = new DynamoDBDelegate();
            return await dynamoDBDelegate.storeDataToDatabase(company);

        } catch (err) {
            const statusCode = 400;

            result = {
                statusCode,
                body: JSON.stringify({
                    statusCode,
                    message: `Request body is missing one or more fields. Please specify all required fields`,
                }),
            }
        }

        return result;
    }

    private computeCompany(requestBody: string): Company {
        const requestBodyObject: { key: string, value: string } = JSON.parse(requestBody);

        const company = Company.fromObject(requestBodyObject);

        return company;
    }
}