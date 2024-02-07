import { APIGatewayProxyResult } from 'aws-lambda';
import { APIPostRequestHandler } from '../handlers/api-post-request-handler';
import { APIGetRequestHandler } from '../handlers/api-get-request-handler';

enum RequestMethod {
    Get = "GET",
    Post = "POST",
}

export class APIRequestMapper {
    public processRequest({ requestMethod, path, requestBody }: { requestMethod: string; path: string; requestBody: string | null | undefined }): Promise<APIGatewayProxyResult> {
        return this.checkRequestMethodSupported({ requestMethod, path, requestBody });
    }

    private async checkRequestMethodSupported({ requestMethod, path, requestBody }: { requestMethod: string; path: string; requestBody: string | null | undefined }): Promise<APIGatewayProxyResult> {
        if (requestMethod !== RequestMethod.Post && requestMethod !== RequestMethod.Get) {
            const statusCode = 405;

            const result: APIGatewayProxyResult = {
                statusCode,
                body: JSON.stringify({
                    statusCode,
                    message: `Request method '${requestMethod}' is not supported`,
                }),
            };

            return result;
        }

        switch (requestMethod) {
            case RequestMethod.Post:
                const apiPostRequestHandler = new APIPostRequestHandler();
                return await apiPostRequestHandler.processPostRequest(requestBody);

            case RequestMethod.Get:
                const apiGetRequestHandler = new APIGetRequestHandler();
                return await apiGetRequestHandler.processGetRequest(path);
        }
    }
}