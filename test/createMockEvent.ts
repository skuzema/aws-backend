import { APIGatewayProxyEvent } from "aws-lambda";

export const createMockEvent = (pathParameters?: {
  [key: string]: string;
}): APIGatewayProxyEvent => {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: "/products",
    pathParameters: pathParameters || null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: "",
  };
};
