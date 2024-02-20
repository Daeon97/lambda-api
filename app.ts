import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIRequestMapper } from './mappers/api-request-mapper';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const requestContext: { [key: string]: any } = event.requestContext;
    const requestMethod = requestContext.http.method;
    const requestBody = event.body;

    const apiRequestMapper = new APIRequestMapper();

    const response = await apiRequestMapper.processRequest({ requestMethod, requestBody });

    return response;
};
