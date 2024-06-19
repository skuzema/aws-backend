import { handler } from "../lambda/getProductsById";
import { mockContext } from "./mockContext";
import { createMockEvent } from "./mockEvent"; // Import the mock event creator
import { APIGatewayProxyResult } from "aws-lambda";

const callback = () => {}; // Mock callback function

test("getProductsById returns a product by ID", async () => {
  const event = createMockEvent({
    productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
  });

  const result = (await handler(
    event,
    mockContext,
    callback
  )) as APIGatewayProxyResult;

  console.log("Result for valid product ID:", result);

  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(body).toHaveProperty("id", event.pathParameters!.productId);
  expect(body).toHaveProperty("title");
  expect(body).toHaveProperty("price");
  expect(body).toHaveProperty("description");
});

test("getProductsById returns 404 if product not found", async () => {
  const eventNotFound = createMockEvent({
    productId: "nonexistent-id",
  });

  const result = (await handler(
    eventNotFound,
    mockContext,
    callback
  )) as APIGatewayProxyResult;

  console.log("Result for nonexistent product ID:", result);

  expect(result.statusCode).toBe(404);
  const body = JSON.parse(result.body);
  expect(body).toHaveProperty("message", "Product not found");
});
