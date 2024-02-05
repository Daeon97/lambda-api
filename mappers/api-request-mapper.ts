import { APIGatewayProxyResult } from 'aws-lambda';
import { APIPostRequestHandler } from '../handlers/api-post-request-handler';
import { APIGetRequestHandler } from '../handlers/api-get-request-handler';

enum RequestMethod {
    Get = "GET",
    Post = "POST",
}

export class APIRequestMapper {
    constructor(private readonly requestMethod: string, private readonly requestBody: string | null | undefined) { }

    public async processRequest(): Promise<APIGatewayProxyResult> {
        return this.checkRequestMethodSupported();
    }

    private async checkRequestMethodSupported(): Promise<APIGatewayProxyResult> {
        if (this.requestMethod !== RequestMethod.Post && this.requestMethod !== RequestMethod.Get) {
            const statusCode = 405;

            const result: APIGatewayProxyResult = {
                statusCode,
                body: JSON.stringify({
                    statusCode,
                    message: `Request method '${this.requestMethod}' is not supported`,
                }),
            };

            return result;
        }

        switch (this.requestMethod) {
            case RequestMethod.Post:
                const apiPostRequestHandler = new APIPostRequestHandler();
                return await apiPostRequestHandler.processPostRequest(this.requestBody);

            case RequestMethod.Get:
                const apiGetRequestHandler = new APIGetRequestHandler();
                return await apiGetRequestHandler.processGetRequest(this.requestBody);
        }
    }
}