import { APIGatewayProxyResult } from "aws-lambda";
import { Owner } from "../models/owner";
import { DBDelegate } from "../delegates/db-delegate";
import { SMSDelegate } from "../delegates/sms-delegate";
import { StatusCode } from '../utils/enums';

export class APIPatchRequestHandler {
    public processPatchRequest(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
        return this.checkPatchRequestHasBody(requestBody);
    }

    private async checkPatchRequestHasBody(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
        if (!requestBody) {
            const result: APIGatewayProxyResult = {
                statusCode: StatusCode.BadRequest,
                body: JSON.stringify({
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
                result = {
                    statusCode: StatusCode.BadRequest,
                    body: JSON.stringify({
                        message: `Request body is missing one or more fields. Please specify all required fields`,
                    }),
                }

                return result;
            }

            const dbDelegate = new DBDelegate();
            result = await dbDelegate.updateDeviceDataInDatabaseWithOwnerInfo(owner);

            const smsDelegate = new SMSDelegate();
            smsDelegate.sendSMS({
                content: `${owner.name} just registered you as an emergency contact`,
                recipientPhone: owner.emergencyContact.phone
            });

        } catch (err) {
            result = {
                statusCode: StatusCode.InternalError,
                body: JSON.stringify({
                    message: "An internal error occurred",
                    verbose: `${JSON.stringify(err)}`,
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