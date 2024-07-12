import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class AuthorizationServiceStack extends cdk.Stack {
  public readonly basicAuthorizerArn: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubAccountLogin = "skuzema";
    const environmentVariables: { [key: string]: string } = {};
    environmentVariables[githubAccountLogin] = "TEST_PASSWORD";

    const basicAuthorizer = new lambda.Function(this, "basicAuthorizer", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "basicAuthorizer.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      environment: environmentVariables,
    });

    // const basicAuthorizer = new lambda.Function(this, "basicAuthorizer", {
    //   runtime: lambda.Runtime.NODEJS_20_X,
    //   handler: "basicAuthorizer.handler",
    //   code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
    //   environment: {
    //     YOUR_GITHUB_ACCOUNT_LOGIN: process.env.YOUR_GITHUB_ACCOUNT_LOGIN!,
    //     TEST_PASSWORD: process.env.TEST_PASSWORD!,
    //   },
    // });

    this.basicAuthorizerArn = basicAuthorizer.functionArn;

    new cdk.CfnOutput(this, "BasicAuthorizerArn", {
      value: this.basicAuthorizerArn,
      exportName: "BasicAuthorizerArn",
    });
  }
}
