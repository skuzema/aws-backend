import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSEvent, Context, SQSRecord } from "aws-lambda";
import { handler } from "../lambda/catalogBatchProcess";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";

// Mock the clients
const snsMock = mockClient(SNSClient);
const dynamoDBMock = mockClient(DynamoDBClient);

describe("catalogBatchProcess", () => {
  const OLD_ENV = process.env;

  beforeAll(() => {
    process.env.PRODUCTS_TABLE_NAME = "ProductsTable";
    process.env.CREATE_PRODUCT_TOPIC_ARN =
      "arn:aws:sns:region:account-id:CreateProductTopic";
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  beforeEach(() => {
    snsMock.reset();
    dynamoDBMock.reset();
  });

  it("should create products and send notifications", async () => {
    const event: SQSEvent = {
      Records: [
        {
          messageId: "1",
          receiptHandle: "handle",
          body: JSON.stringify({
            id: "1",
            title: "Product 1",
            description: "Description 1",
            price: 100,
            count: 10,
          }),
          attributes: {
            ApproximateReceiveCount: "1",
            SentTimestamp: "timestamp",
            SenderId: "sender",
            ApproximateFirstReceiveTimestamp: "timestamp",
          },
          messageAttributes: {},
          md5OfBody: "md5",
          eventSource: "aws:sqs",
          eventSourceARN: "arn:aws:sqs:region:account-id:queue",
          awsRegion: "region",
        } as SQSRecord,
      ],
    };

    dynamoDBMock.on(PutItemCommand).resolves({});
    snsMock.on(PublishCommand).resolves({});

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe(
      "Products created and notifications sent"
    );

    // Check that DynamoDB PutItemCommand was received with the expected properties
    expect(dynamoDBMock).toHaveReceivedCommand(PutItemCommand);
    expect(dynamoDBMock).toHaveReceivedCommandWith(PutItemCommand, {
      TableName: "ProductsTable",
      Item: {
        id: { S: "1" },
        title: { S: "Product 1" },
        description: { S: "Description 1" },
        price: { N: "100" },
        count: { N: "10" },
      },
    });

    // Check that SNS PublishCommand was received with the expected properties
    expect(snsMock).toHaveReceivedCommand(PublishCommand);
    expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
      TopicArn: "arn:aws:sns:region:account-id:CreateProductTopic",
      Message: JSON.stringify({
        id: "1",
        title: "Product 1",
        description: "Description 1",
        price: 100,
        count: 10,
      }),
    });
  });

  it("should handle empty records gracefully", async () => {
    const event: SQSEvent = {
      Records: [],
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe(
      "Products created and notifications sent"
    );

    expect(dynamoDBMock).not.toHaveReceivedCommand(PutItemCommand);
    expect(snsMock).not.toHaveReceivedCommand(PublishCommand);
  });

  it("should handle errors gracefully", async () => {
    const event: SQSEvent = {
      Records: [
        {
          messageId: "1",
          receiptHandle: "handle",
          body: JSON.stringify({
            id: "1",
            title: "Product 1",
            description: "Description 1",
            price: 100,
            count: 10,
          }),
          attributes: {
            ApproximateReceiveCount: "1",
            SentTimestamp: "timestamp",
            SenderId: "sender",
            ApproximateFirstReceiveTimestamp: "timestamp",
          },
          messageAttributes: {},
          md5OfBody: "md5",
          eventSource: "aws:sqs",
          eventSourceARN: "arn:aws:sqs:region:account-id:queue",
          awsRegion: "region",
        } as SQSRecord,
      ],
    };

    dynamoDBMock.on(PutItemCommand).rejects(new Error("DynamoDB error"));
    snsMock.on(PublishCommand).resolves({});

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe(
      "Products created and notifications sent"
    );

    expect(dynamoDBMock).toHaveReceivedCommand(PutItemCommand);
    expect(dynamoDBMock).toHaveReceivedCommandWith(PutItemCommand, {
      TableName: "ProductsTable",
      Item: {
        id: { S: "1" },
        title: { S: "Product 1" },
        description: { S: "Description 1" },
        price: { N: "100" },
        count: { N: "10" },
      },
    });

    expect(snsMock).not.toHaveReceivedCommand(PublishCommand);
  });
});
