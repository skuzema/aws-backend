import { Handler, APIGatewayProxyResult } from "aws-lambda";
import { products } from "./mock_products";

export const handler: Handler = async (
  event: any = {}
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Access-Control-Allow-Methods": "GET",
    },
    body: JSON.stringify(products),
  };
};
