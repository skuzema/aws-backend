process.env.PRODUCTS_TABLE_NAME = "testProductsTable";
process.env.STOCKS_TABLE_NAME = "testStocksTable";

import { handler } from "../lambda/getProductsList";
import { mockContext } from "./mockContext";
import { createMockEvent } from "./createMockEvent";
import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";

const dynamoDbMock = mockClient(DynamoDBClient);

const callback = () => {};

beforeEach(() => {
  dynamoDbMock.reset();
});

test("getProductsList returns a list of products", async () => {
  dynamoDbMock.on(ScanCommand).resolvesOnce({
    Items: [
      {
        id: { S: "1" },
        title: { S: "Product 1" },
        description: { S: "Description 1" },
        price: { N: "100" },
      },
    ],
  });

  dynamoDbMock.on(ScanCommand).resolvesOnce({
    Items: [{ product_id: { S: "1" }, count: { N: "10" } }],
  });

  const event = createMockEvent();
  const result = (await handler(
    event,
    mockContext,
    callback
  )) as APIGatewayProxyResult;

  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  body.forEach(
    (product: {
      id: string;
      title: string;
      price: number;
      description: string;
      count: number;
    }) => {
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("title");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("description");
      expect(product).toHaveProperty("count");
    }
  );
});
