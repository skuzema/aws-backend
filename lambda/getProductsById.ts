import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";

const dynamoDB = new DynamoDB.DocumentClient();

const productsTableName = process.env.PRODUCTS_TABLE_NAME!;
const stocksTableName = process.env.STOCKS_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const productId = event.pathParameters?.productId;

  if (!productId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify({ message: "Product ID is required" }),
    };
  }

  try {
    const productResult = await dynamoDB
      .get({
        TableName: productsTableName,
        Key: { id: productId },
      })
      .promise();

    const stockResult = await dynamoDB
      .get({
        TableName: stocksTableName,
        Key: { product_id: productId },
      })
      .promise();

    if (!productResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "GET",
        },
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const response = {
      ...productResult.Item,
      count: stockResult.Item ? stockResult.Item.count : 0,
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error fetching product and stock:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
