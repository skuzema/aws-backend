import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
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
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    if (!event.body) {
      console.log("Missing request body");
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
        },
        body: JSON.stringify({
          message: "Invalid request, you are missing the parameter body",
        }),
      };
    }

    const { title, description, price, count } = JSON.parse(event.body);
    console.log("Parsed request body:", { title, description, price, count });

    if (!title || !description || !price || !count) {
      console.error(
        "Invalid request. Title, description, price and count are required"
      );

      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
        },
        body: JSON.stringify({
          message:
            "Invalid request. Title, description, price and count are required",
        }),
      };
    }

    const productId = randomUUID();

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

    console.log("Transact write params:", JSON.stringify(params, null, 2));

    const command = new TransactWriteItemsCommand(params);
    await client.send(command);

    console.log("Successfully created product and stock with ID:", productId);

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
      },
      body: JSON.stringify({
        message: "Product created successfully",
        productId,
      }),
    };
  } catch (error) {
    console.error("Error creating product and stock:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
      },
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
