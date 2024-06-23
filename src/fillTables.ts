import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: "eu-north-1" });

const products = [
  {
    id: { S: uuidv4() },
    title: { S: "Product One" },
    description: { S: "Description for product one" },
    price: { N: "100" },
  },
  {
    id: { S: uuidv4() },
    title: { S: "Product Two" },
    description: { S: "Description for product two" },
    price: { N: "200" },
  },
  {
    id: { S: uuidv4() },
    title: { S: "Product Three" },
    description: { S: "Description for product three" },
    price: { N: "300" },
  },
];

const stocks = [
  { product_id: { S: products[0].id.S }, count: { N: "10" } },
  { product_id: { S: products[1].id.S }, count: { N: "20" } },
  { product_id: { S: products[2].id.S }, count: { N: "30" } },
];

const fillTables = async () => {
  try {
    for (const product of products) {
      const productCommand = new PutItemCommand({
        TableName: "products",
        Item: product,
      });
      await client.send(productCommand);
      console.log(`Inserted product: ${product.title.S}`);
    }

    for (const stock of stocks) {
      const stockCommand = new PutItemCommand({
        TableName: "stocks",
        Item: stock,
      });
      await client.send(stockCommand);
      console.log(`Inserted stock for product_id: ${stock.product_id.S}`);
    }

    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

fillTables();
