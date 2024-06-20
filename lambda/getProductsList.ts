import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";

const client = new DynamoDBClient({});

const productsTableName = process.env.PRODUCTS_TABLE_NAME;
const stocksTableName = process.env.STOCKS_TABLE_NAME;

if (!productsTableName || !stocksTableName) {
  throw new Error(
    "Environment variables PRODUCTS_TABLE_NAME and STOCKS_TABLE_NAME must be defined"
  );
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const productsParams = {
      TableName: productsTableName!,
    };
    const productsCommand = new ScanCommand(productsParams);
    const productsResult = await client.send(productsCommand);

    const stocksParams = {
      TableName: stocksTableName!,
    };
    const stocksCommand = new ScanCommand(stocksParams);
    const stocksResult = await client.send(stocksCommand);

    const products = productsResult.Items || [];
    const stocks = stocksResult.Items || [];

    const response = products.map((product) => {
      const stock = stocks.find(
        (stock) => stock.product_id?.S === product.id?.S
      );
      return {
        id: product.id?.S,
        title: product.title?.S,
        description: product.description?.S,
        price: product.price?.N ? parseFloat(product.price.N) : null,
        count: stock
          ? stock.count?.N
            ? parseInt(stock.count.N, 10)
            : null
          : 0,
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
