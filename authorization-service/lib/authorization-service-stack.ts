import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new lambda.Function(this, "basicAuthorizer", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "basicAuthorizer.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      environment: {
        YOUR_GITHUB_ACCOUNT_LOGIN: process.env.YOUR_GITHUB_ACCOUNT_LOGIN!,
        TEST_PASSWORD: process.env.TEST_PASSWORD!,
      },
    });

    new cdk.CfnOutput(this, "BasicAuthorizerArn", {
      value: basicAuthorizer.functionArn,
    });
  }
}
