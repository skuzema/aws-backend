import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { handler } from "../lambda/catalogBatchProcess";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "generated-uuid"),
}));

const snsMock = mockClient(SNSClient);
const dynamoDBMock = mockClient(DynamoDBClient);

describe("catalogBatchProcess", () => {
  const OLD_ENV = process.env;

  beforeAll(() => {
    process.env.PRODUCTS_TABLE_NAME = "products";
    process.env.STOCKS_TABLE_NAME = "stocks";
    process.env.CREATE_PRODUCT_TOPIC_ARN =
      "arn:aws:sns:eu-north-1:650880631809:AwsBackendStack-CreateProductTopicE4CD9217-Kw2en6ygX9Op";
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  beforeEach(() => {
    snsMock.reset();
    dynamoDBMock.reset();
  });

  it("should handle empty records gracefully", async () => {
    const event: SQSEvent = {
      Records: [],
    };

    const result = await handler(event);

    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body!).message).toBe(
      "Products created and notifications sent"
    );

    expect(dynamoDBMock).not.toHaveReceivedCommand(PutItemCommand);
    expect(snsMock).not.toHaveReceivedCommand(PublishCommand);
  });

  it("should generate an ID if not provided in the product", async () => {
    const event: SQSEvent = {
      Records: [
        {
          messageId: "1",
          receiptHandle: "handle",
          body: JSON.stringify({
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
          eventSourceARN:
            "arn:aws:sqs:eu-north-1:650880631809:catalogItemsQueue",
          awsRegion: "eu-north-1",
        } as SQSRecord,
      ],
    };

    dynamoDBMock.on(PutItemCommand).resolves({});
    snsMock.on(PublishCommand).resolves({});

    const result = await handler(event);

    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body!).message).toBe(
      "Products created and notifications sent"
    );
  });

  it("should handle a single record", async () => {
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
          eventSourceARN:
            "arn:aws:sqs:eu-north-1:650880631809:catalogItemsQueue",
          awsRegion: "eu-north-1",
        } as SQSRecord,
      ],
    };

    dynamoDBMock.on(PutItemCommand).resolves({});
    snsMock.on(PublishCommand).resolves({});

    const result = await handler(event);

    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body!).message).toBe(
      "Products created and notifications sent"
    );

    const mockProduct = {
      id: { S: "1" },
      title: { S: "Product 1" },
      description: { S: "Description 1" },
      price: { N: "100" },
    };

    dynamoDBMock.on(QueryCommand).resolves({
      Items: [mockProduct],
    });
  });
});
