import { APIGatewayProxyResult } from 'aws-lambda';
import { APIPostRequestHandler } from '../handlers/api-post-request-handler';
import { APIGetRequestHandler } from '../handlers/api-get-request-handler';
import { APIPatchRequestHandler } from '../handlers/api-patch-request-hadler';
import { RequestMethod, StatusCode } from '../utils/enums';

export class APIRequestMapper {
    public processRequest({ requestMethod, requestBody }: { requestMethod: string; requestBody: string | null | undefined }): Promise<APIGatewayProxyResult> {
        return this.checkRequestMethodSupported({ requestMethod, requestBody });
    }

    private async checkRequestMethodSupported({ requestMethod, requestBody }: { requestMethod: string; requestBody: string | null | undefined }): Promise<APIGatewayProxyResult> {
        if (requestMethod !== RequestMethod.Post && requestMethod !== RequestMethod.Get && requestMethod !== RequestMethod.Patch) {

            const result: APIGatewayProxyResult = {
                statusCode: StatusCode.MethodNotAllowed,
                body: JSON.stringify({
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
                return await apiGetRequestHandler.processGetRequest();
            
            case RequestMethod.Patch:
                const apiPatchRequestHandler = new APIPatchRequestHandler();
                return await apiPatchRequestHandler.processPatchRequest(requestBody);
        }
    }
}