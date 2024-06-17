import { Handler, APIGatewayProxyResult } from "aws-lambda";
import { products } from "./mock_products";

export const handler: Handler = async (
  event: any = {}
): Promise<APIGatewayProxyResult> => {
  const productId = event.pathParameters.productId;
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return {
      statusCode: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify({ message: "Product not found" }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
    body: JSON.stringify(product),
  };
};
