import { Handler, APIGatewayProxyResult } from "aws-lambda";

export const handler: Handler = async (
  event: any = {}
): Promise<APIGatewayProxyResult> => {
  const products = [
    { id: "1", name: "Product 1", price: 100 },
    { id: "2", name: "Product 2", price: 150 },
    { id: "3", name: "Product 3", price: 200 },
    { id: "4", name: "Product 4", price: 250 },
    { id: "5", name: "Product 5", price: 300 },
    { id: "6", name: "Product 6", price: 350 },
    { id: "7", name: "Product 7", price: 400 },
    { id: "8", name: "Product 8", price: 450 },
  ];

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
