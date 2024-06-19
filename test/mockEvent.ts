import { APIGatewayProxyEvent } from "aws-lambda";

export const createMockEvent = (pathParameters: {
  [key: string]: string;
}): APIGatewayProxyEvent => {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: "",
    pathParameters,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: null as any, // You can provide a more detailed mock if needed
    resource: "",
  };
};
