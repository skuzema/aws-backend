import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface ImportServiceStackProps extends cdk.StackProps {
  basicAuthorizerArn: string;
}

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ImportServiceStackProps) {
    super(scope, id, props);

    const { basicAuthorizerArn } = props;

    const importedBucket = s3.Bucket.fromBucketName(
      this,
      "ImportBucket",
      "my-import-bucket-650880631809-eu-north-1"
    );

    const importProductsFile = new lambda.Function(this, "importProductsFile", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "importProductsFile.handler",
      environment: {
        BUCKET_NAME: importedBucket.bucketName,
      },
    });

    importedBucket.grantReadWrite(importProductsFile);

    const api = new apigateway.RestApi(this, "ImportServiceAPI", {
      restApiName: "Import Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    const authorizer = new apigateway.RequestAuthorizer(
      this,
      "basicAuthorizer",
      {
        handler: lambda.Function.fromFunctionArn(
          this,
          "ImportedAuthorizer",
          basicAuthorizerArn
        ),
        identitySources: [apigateway.IdentitySource.header("Authorization")],
      }
    );

    const importIntegration = new apigateway.LambdaIntegration(
      importProductsFile
    );

    const importResource = api.root.addResource("import");

    importResource.addMethod("GET", importIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      requestParameters: {
        "method.request.querystring.name": true,
      },
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
          responseModels: {
            "application/json": apigateway.Model.EMPTY_MODEL,
          },
        },
        {
          statusCode: "401",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
        },
        {
          statusCode: "403",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
        },
      ],
    });

    new cdk.CfnOutput(this, "APIEndpoint", {
      value: api.url,
    });

    const importFileParser = new lambda.Function(this, "importFileParser", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "importFileParser.handler",
      environment: {
        BUCKET_NAME: importedBucket.bucketName,
        SQS_QUEUE_URL:
          "https://sqs.eu-north-1.amazonaws.com/650880631809/catalogItemsQueue",
      },
    });

    importFileParser.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sqs:SendMessage"],
        resources: ["arn:aws:sqs:eu-north-1:650880631809:catalogItemsQueue"],
      })
    );

    importedBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser),
      {
        prefix: "uploaded/",
      }
    );

    importedBucket.grantRead(importFileParser);
    importedBucket.grantDelete(importFileParser);
    importedBucket.grantPut(importFileParser);

    api.addGatewayResponse("UnauthorizedResponse", {
      type: apigateway.ResponseType.UNAUTHORIZED,
      statusCode: "401",
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Methods": "'GET,OPTIONS'",
      },
    });

    api.addGatewayResponse("AccessDeniedResponse", {
      type: apigateway.ResponseType.ACCESS_DENIED,
      statusCode: "403",
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Methods": "'GET,OPTIONS'",
      },
    });
  }
}
