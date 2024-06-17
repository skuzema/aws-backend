import { handler } from "../lambda/getProductsById";
import { mockContext } from "./mockContext";

const callback = () => {}; // Mock callback function

test("getProductsById returns a product by ID", async () => {
  const event = {
    pathParameters: {
      productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    },
  };
  const result = await handler(event, mockContext, callback);

  expect(result.statusCode).toBe(200);
  const body = JSON.parse(result.body);
  expect(body).toHaveProperty("id", event.pathParameters.productId);
  expect(body).toHaveProperty("title");
  expect(body).toHaveProperty("price");
  expect(body).toHaveProperty("description");
});

test("getProductsById returns 404 if product not found", async () => {
  const eventNotFound = {
    pathParameters: {
      productId: "nonexistent-id",
    },
  };
  const result = await handler(eventNotFound, mockContext, callback);

  expect(result.statusCode).toBe(404);
  const body = JSON.parse(result.body);
  expect(body).toHaveProperty("message", "Product not found");
});
