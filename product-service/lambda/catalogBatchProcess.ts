import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSEvent, SQSRecord } from "aws-lambda";

const snsClient = new SNSClient({});
const dynamoDBClient = new DynamoDBClient({});
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME!;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME!;
const CREATE_PRODUCT_TOPIC_ARN = process.env.CREATE_PRODUCT_TOPIC_ARN!;

export const handler = async (event: SQSEvent) => {
  console.log("Start catalogBatchProcess");
  const snsPromises = event.Records.map(async (record: SQSRecord) => {
    const product = JSON.parse(record.body);

    const putProductItemCommand = new PutItemCommand({
      TableName: PRODUCTS_TABLE_NAME,
      Item: {
        id: { S: product.id },
        title: { S: product.title },
        description: { S: product.description },
        price: { N: product.price.toString() },
      },
    });
    await dynamoDBClient.send(putProductItemCommand);

    const putStockItemCommand = new PutItemCommand({
      TableName: STOCKS_TABLE_NAME,
      Item: {
        product_id: { S: product.id },
        count: { N: product.count.toString() },
      },
    });
    await dynamoDBClient.send(putStockItemCommand);

    const publishCommand = new PublishCommand({
      TopicArn: CREATE_PRODUCT_TOPIC_ARN,
      Message: JSON.stringify(product),
    });

    await snsClient.send(publishCommand);
  });

  await Promise.all(snsPromises);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Products created and notifications sent",
    }),
  };
};
