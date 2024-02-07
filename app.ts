import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIRequestMapper } from './mappers/api-request-mapper';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const requestMethod = event.httpMethod;
    const path = event.path;
    const requestBody = event.body;

    console.log(`Path is ${event.path} and path parameter(s) is(are) ${event.pathParameters}`);

    const apiRequestMapper = new APIRequestMapper();

    const response = await apiRequestMapper.processRequest({ requestMethod, path, requestBody });

    return response;
};
