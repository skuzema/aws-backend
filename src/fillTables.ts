import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamoDB = new DynamoDB.DocumentClient({ region: "eu-north-1" });

const products = [
  {
    id: uuidv4(),
    title: "Product One",
    description: "Description for product one",
    price: 100,
  },
  {
    id: uuidv4(),
    title: "Product Two",
    description: "Description for product two",
    price: 200,
  },
  {
    id: uuidv4(),
    title: "Product Three",
    description: "Description for product three",
    price: 300,
  },
];

const stocks = [
  { product_id: products[0].id, count: 10 },
  { product_id: products[1].id, count: 20 },
  { product_id: products[2].id, count: 30 },
];

const fillTables = async () => {
  try {
    for (const product of products) {
      await dynamoDB.put({ TableName: "products", Item: product }).promise();
      console.log(`Inserted product: ${product.title}`);
    }

    for (const stock of stocks) {
      await dynamoDB.put({ TableName: "stocks", Item: stock }).promise();
      console.log(`Inserted stock for product_id: ${stock.product_id}`);
    }

    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

fillTables();
