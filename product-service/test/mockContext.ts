import { Context } from "aws-lambda";

export const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: "testFunction",
  functionVersion: "1",
  invokedFunctionArn:
    "arn:aws:lambda:us-east-1:123456789012:function:testFunction",
  memoryLimitInMB: "128",
  awsRequestId: "1234567890",
  logGroupName: "/aws/lambda/testFunction",
  logStreamName: "2021/10/22/[$LATEST]1234567890abcdef",
  getRemainingTimeInMillis: () => 1000,
  done: () => null,
  fail: () => null,
  succeed: () => null,
};
