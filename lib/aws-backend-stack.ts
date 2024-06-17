import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class AwsBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for getProductsList
    const getProductsList = new lambda.Function(
      this,
      "GetProductsListHandler",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "getProductsList.handler",
      }
    );

    // Lambda function for getProductsById
    const getProductsById = new lambda.Function(
      this,
      "GetProductsByIdHandler",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "getProductsById.handler",
      }
    );

    // API Gateway
    const api = new apigateway.RestApi(this, "ProductServiceAPI", {
      restApiName: "Product Service",
    });

    // /products endpoint
    const products = api.root.addResource("products");
    const getAllIntegration = new apigateway.LambdaIntegration(getProductsList);
    products.addMethod("GET", getAllIntegration);

    // /products/{productId} endpoint
    const singleProduct = products.addResource("{productId}");
    const getByIdIntegration = new apigateway.LambdaIntegration(
      getProductsById
    );
    singleProduct.addMethod("GET", getByIdIntegration);
  }
}
