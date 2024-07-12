import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class AuthorizationServiceStack extends cdk.Stack {
  public readonly basicAuthorizerArn: string;

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

    this.basicAuthorizerArn = basicAuthorizer.functionArn;

    basicAuthorizer.addPermission("ApiGatewayInvoke", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: `arn:aws:execute-api:eu-north-1:650880631809:*/*`,
    });

    new cdk.CfnOutput(this, "BasicAuthorizerArn", {
      value: this.basicAuthorizerArn,
      exportName: "BasicAuthorizerArn",
    });
  }
}
