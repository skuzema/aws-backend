import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
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
  console.log("Received event:", JSON.stringify(event, null, 2));

  const productId = event.pathParameters?.productId;

  if (!productId) {
    console.log("Product ID is missing in the path parameters");
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
    const productParams = {
      TableName: productsTableName!,
      Key: { id: { S: productId } },
    };
    const productCommand = new GetItemCommand(productParams);
    const productResult = await client.send(productCommand);

    console.log("Product result:", JSON.stringify(productResult, null, 2));

    const stockParams = {
      TableName: stocksTableName!,
      Key: { product_id: { S: productId } },
    };
    const stockCommand = new GetItemCommand(stockParams);
    const stockResult = await client.send(stockCommand);

    console.log("Stock result:", JSON.stringify(stockResult, null, 2));

    if (!productResult.Item) {
      console.log("Product not found for ID:", productId);
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
      id: productResult.Item.id?.S || "",
      title: productResult.Item.title?.S || "",
      description: productResult.Item.description?.S || "",
      price: productResult.Item.price?.N
        ? parseFloat(productResult.Item.price.N)
        : 0,
      count: stockResult.Item?.count?.N
        ? parseInt(stockResult.Item.count.N, 10)
        : 0,
    };

    console.log("Response:", JSON.stringify(response, null, 2));

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
