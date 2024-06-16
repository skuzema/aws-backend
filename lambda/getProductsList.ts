import { Handler } from "aws-lambda";

export const handler: Handler = async (event: any = {}): Promise<any> => {
  const products = [
    { id: "1", name: "Product 1", price: 100 },
    { id: "2", name: "Product 2", price: 200 },
  ];

  return {
    statusCode: 200,
    body: JSON.stringify(products),
    isBase64Encoded: false,
  };
};
