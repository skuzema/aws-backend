import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { handler } from "../lambda/importProductsFile";
import "aws-sdk-client-mock-jest";

const s3Mock = mockClient(S3Client);

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

describe("importProductsFile", () => {
  const OLD_ENV = process.env;

  beforeAll(() => {
    process.env.BUCKET_NAME = "my-import-bucket";
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  beforeEach(() => {
    s3Mock.reset();
  });

  it("should return a signed URL", async () => {
    const signedUrl = "https://signed-url";
    s3Mock.on(PutObjectCommand).resolves({});
    (getSignedUrl as jest.Mock).mockResolvedValue(signedUrl);

    const event: APIGatewayProxyEvent = {
      queryStringParameters: {
        name: "test.csv",
      },
    } as any;

    const context: Context = {} as any;
    const result = (await handler(event, context, () => {})) as any;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.url).toBe(signedUrl);
  });

  it("should return 400 if no name is provided", async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: {},
    } as any;

    const context: Context = {} as any;
    const result = (await handler(event, context, () => {})) as any;

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Name query parameter is required");
  });
});
