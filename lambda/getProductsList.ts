import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";

const dynamoDB = new DynamoDB.DocumentClient();

const productsTableName = process.env.PRODUCTS_TABLE_NAME!;
const stocksTableName = process.env.STOCKS_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const productsResult = await dynamoDB
      .scan({ TableName: productsTableName })
      .promise();
    const stocksResult = await dynamoDB
      .scan({ TableName: stocksTableName })
      .promise();

    const products = productsResult.Items || [];
    const stocks = stocksResult.Items || [];

    const response = products.map((product) => {
      const stock = stocks.find((stock) => stock.product_id === product.id);
      return {
        ...product,
        count: stock ? stock.count : 0,
      };
    });

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
    console.error("Error fetching products and stocks:", error);
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
