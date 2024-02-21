import { APIGatewayProxyResult } from "aws-lambda";
import { Device } from "../models/device";
import { DBDelegate } from "../delegates/db-delegate";
import { StatusCode } from '../utils/enums';

export class APIPostRequestHandler {
    public processPostRequest(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
        return this.checkPostRequestHasBody(requestBody);
    }

    private async checkPostRequestHasBody(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
        if (!requestBody) {
            const result: APIGatewayProxyResult = {
                statusCode: StatusCode.BadRequest,
                body: JSON.stringify({
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

            const dbDelegate = new DBDelegate();
            return await dbDelegate.storeOrUpdateDeviceDataInDatabase(device);

        } catch (err) {
            result = {
                statusCode: StatusCode.BadRequest,
                body: JSON.stringify({
                    message: `Request body is missing one or more fields. Please specify all required fields`,
                }),
            }
        }

        return result;
    }

    private computeDevice(requestBody: string): Device {
        const requestBodyObject = JSON.parse(requestBody);

        const device = Device.fromObject(requestBodyObject);

        if (!device.id || !device.latitude || !device.longitude) {
            throw 'Some fields are undefined';
        }

        return device;
    }
}