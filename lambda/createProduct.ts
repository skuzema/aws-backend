import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyHandler } from "aws-lambda";

const client = new DynamoDBClient({});

const productsTableName = process.env.PRODUCTS_TABLE_NAME!;
const stocksTableName = process.env.STOCKS_TABLE_NAME!;

if (!productsTableName || !stocksTableName) {
  throw new Error(
    "Environment variables PRODUCTS_TABLE_NAME and STOCKS_TABLE_NAME must be defined"
  );
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "PUT",
        },
        body: JSON.stringify({
          message: "Invalid request, you are missing the parameter body",
        }),
      };
    }

    const { title, description, price, count } = JSON.parse(event.body);

    if (!title || !description || !price || !count) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Invalid request, title, description, price and count are required",
        }),
      };
    }

    const productId = uuidv4();

    const productItem = {
      id: { S: productId },
      title: { S: title },
      description: { S: description },
      price: { N: price.toString() },
    };

    const stockItem = {
      product_id: { S: productId },
      count: { N: count.toString() },
    };

    const params = {
      TransactItems: [
        {
          Put: {
            TableName: productsTableName,
            Item: productItem,
          },
        },
        {
          Put: {
            TableName: stocksTableName,
            Item: stockItem,
          },
        },
      ],
    };

    const command = new TransactWriteItemsCommand(params);
    await client.send(command);

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "PUT",
      },
      body: JSON.stringify({
        message: "Product created successfully",
        productId,
      }),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "PUT",
      },
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
