import { APIGatewayProxyResult } from "aws-lambda";
import { Owner } from "../models/owner";
import { DynamoDBDelegate } from "../delegates/dynamo-db-delegate";

export class APIPatchRequestHandler {
    public processPatchRequest(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
        return this.checkPatchRequestHasBody(requestBody);
    }

    private async checkPatchRequestHasBody(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
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

        return this.checkPatchRequestBodyComplete(requestBody);
    }

    private async checkPatchRequestBodyComplete(requestBody: string): Promise<APIGatewayProxyResult> {
        let result: APIGatewayProxyResult;

        try {
            const owner = this.computeOwner(requestBody);

            if (!owner.deviceId || !owner.name || !owner.email || !owner.address || !owner.emergencyContact || !owner.emergencyContact.name || !owner.emergencyContact.phone || !owner.emergencyContact.relationship) {
                throw 'Some fields are undefined';
            }

            const dynamoDBDelegate = new DynamoDBDelegate();
            return await dynamoDBDelegate.updateDeviceDataInDatabaseWithOwnerInfo(owner);

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

    private computeOwner(requestBody: string): Owner {
        const requestBodyObject = JSON.parse(requestBody);

        const owner = Owner.fromObject(requestBodyObject);

        return owner;
    }
}