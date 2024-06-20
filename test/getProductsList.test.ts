import { handler } from "../lambda/getProductsList";
import { mockContext } from "./mockContext";
import { createMockEvent } from "./createMockEvent";
import { APIGatewayProxyResult } from "aws-lambda";

const callback = () => {}; // Mock callback function

test("getProductsList returns a list of products", async () => {
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
