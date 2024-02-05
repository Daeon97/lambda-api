import { APIGatewayProxyResult } from "aws-lambda";

export class APIGetRequestHandler {

    public async processGetRequest(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
        return this.checkGetRequestHasPathVariable(requestBody);
    }

    private async checkGetRequestHasPathVariable(requestBody: string | null | undefined): Promise<APIGatewayProxyResult> {
        // if (!requestBody) {
        //     const statusCode = 400;

        //     const result: APIGatewayProxyResult = {
        //         statusCode,
        //         body: JSON.stringify({
        //             statusCode,
        //             message: `Request body is missing. Please specify a request body for this request`,
        //         }),
        //     }

        //     return result;
        // }

        // return this.checkPostRequestBodyComplete(requestBody);
    }
}