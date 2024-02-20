import { APIGatewayProxyResult } from "aws-lambda";
import { Device } from "../models/device";
import { DynamoDBDelegate } from "../delegates/dynamo-db-delegate";

export class APIPostRequestHandler {
    public processPostRequest(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
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
            const device = this.computeDevice(requestBody);

            if (!device.id || !device.latitude || !device.longitude) {
                throw 'Some fields are undefined';
            }

            const dynamoDBDelegate = new DynamoDBDelegate();
            return await dynamoDBDelegate.storeOrUpdateDeviceDataInDatabase(device);

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

    private computeDevice(requestBody: string): Device {
        const requestBodyObject = JSON.parse(requestBody);

        const device = Device.fromObject(requestBodyObject);

        return device;
    }
}