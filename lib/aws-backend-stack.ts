import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class AwsBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = new dynamodb.Table(this, "ProductsTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: "products",
    });

    const stocksTable = new dynamodb.Table(this, "StocksTable", {
      partitionKey: { name: "product_id", type: dynamodb.AttributeType.STRING },
      tableName: "stocks",
    });

    const getProductsList = new lambda.Function(
      this,
      "GetProductsListHandler",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "getProductsList.handler",
        environment: {
          PRODUCTS_TABLE_NAME: productsTable.tableName,
          STOCKS_TABLE_NAME: stocksTable.tableName,
        },
      }
    );

    productsTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductsList);

    const getProductsById = new lambda.Function(
      this,
      "GetProductsByIdHandler",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "getProductsById.handler",
        environment: {
          PRODUCTS_TABLE_NAME: productsTable.tableName,
          STOCKS_TABLE_NAME: stocksTable.tableName,
        },
      }
    );

    productsTable.grantReadData(getProductsById);
    stocksTable.grantReadData(getProductsById);

    const createProduct = new lambda.Function(this, "CreateProductHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "createProduct.handler",
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
    });

    productsTable.grantWriteData(createProduct);

    const api = new apigateway.RestApi(this, "ProductServiceAPI", {
      restApiName: "Product Service",
    });

    const products = api.root.addResource("products");
    const getAllIntegration = new apigateway.LambdaIntegration(getProductsList);
    products.addMethod("GET", getAllIntegration);

    const createIntegration = new apigateway.LambdaIntegration(createProduct);
    products.addMethod("PUT", createIntegration);

    const singleProduct = products.addResource("{productId}");
    const getByIdIntegration = new apigateway.LambdaIntegration(
      getProductsById
    );
    singleProduct.addMethod("GET", getByIdIntegration);
  }
}
