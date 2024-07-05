import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { handler } from "../lambda/catalogBatchProcess";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";

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
});
