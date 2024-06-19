import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyHandler } from "aws-lambda";

const dynamoDB = new DynamoDB.DocumentClient();

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
        body: JSON.stringify({
          message: "Invalid request, you are missing the parameter body",
        }),
      };
    }

    const { title, description, price, count } = JSON.parse(event.body);

    const productId = uuidv4();

    const productItem = {
      id: productId,
      title,
      description,
      price,
    };

    const stockItem = {
      product_id: productId,
      count,
    };

    await dynamoDB
      .transactWrite({
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
      })
      .promise();

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Product created successfully",
        productId,
      }),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
