import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { Readable } from "stream";
import csv from "csv-parser";
import { S3Event, Context } from "aws-lambda";
import { handler } from "../lambda/importFileParser";
import "aws-sdk-client-mock-jest";
import { SdkStreamMixin } from "@aws-sdk/types";
import { IncomingMessage } from "http";
import { Socket } from "net";

const s3Mock = mockClient(S3Client);

jest.mock("csv-parser", () =>
  jest.fn().mockImplementation(() => {
    const mockCsvParser = new Readable({ read() {} }) as SdkStreamMixin &
      Readable;
    process.nextTick(() => {
      mockCsvParser.emit("data", { column1: "value1", column2: "value2" });
      mockCsvParser.emit("end");
    });
    return mockCsvParser;
  })
);

class MockSdkStream extends Readable implements SdkStreamMixin {
  transformToByteArray(): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array());
  }

  transformToString(): Promise<string> {
    return Promise.resolve("");
  }

  transformToWebStream(): ReadableStream {
    return new ReadableStream();
  }
}

describe("importFileParser", () => {
  beforeEach(() => {
    s3Mock.reset();
  });

  it("should process the CSV file and move it to the parsed folder", async () => {
    const bodyStream = new MockSdkStream();
    bodyStream.push("column1,column2\nvalue1,value2\n");
    bodyStream.push(null);

    s3Mock.on(GetObjectCommand).resolves({ Body: bodyStream });
    s3Mock.on(CopyObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: { name: "my-bucket" },
            object: { key: "uploaded/test.csv" },
          },
        },
      ],
    } as any;

    const context: Context = {} as any;
    await handler(event, context, () => {});

    await new Promise((resolve) => setImmediate(resolve));

    expect(s3Mock).toHaveReceivedCommandWith(CopyObjectCommand, {
      Bucket: "my-bucket",
      CopySource: "my-bucket/uploaded/test.csv",
      Key: "parsed/test.csv",
    });

    expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
      Bucket: "my-bucket",
      Key: "uploaded/test.csv",
    });
  });

  it("should log an error if the object body is empty", async () => {
    console.error = jest.fn();

    s3Mock.on(GetObjectCommand).resolves({ Body: undefined });

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: { name: "my-bucket" },
            object: { key: "uploaded/test.csv" },
          },
        },
      ],
    } as any;

    const context: Context = {} as any;
    await handler(event, context, () => {});

    expect(console.error).toHaveBeenCalledWith(
      "Error processing S3 event:",
      new Error("Object Body is empty")
    );
  });
});
