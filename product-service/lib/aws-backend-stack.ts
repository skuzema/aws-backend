import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sns_subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

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
        runtime: lambda.Runtime.NODEJS_20_X,
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
        runtime: lambda.Runtime.NODEJS_20_X,
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
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "createProduct.handler",
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      },
    });

    productsTable.grantWriteData(createProduct);
    stocksTable.grantWriteData(createProduct);

    const api = new apigateway.RestApi(this, "ProductServiceAPI", {
      restApiName: "Product Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const products = api.root.addResource("products");
    const getAllIntegration = new apigateway.LambdaIntegration(getProductsList);
    products.addMethod("GET", getAllIntegration);

    const singleProduct = products.addResource("{productId}");
    const getByIdIntegration = new apigateway.LambdaIntegration(
      getProductsById
    );
    singleProduct.addMethod("GET", getByIdIntegration);

    api.addGatewayResponse("badRequestResponse", {
      type: apigateway.ResponseType.BAD_REQUEST_BODY,
      statusCode: "400",
      templates: {
        "application/json":
          '{ "message": "$context.error.messageString", "issues": ["$context.error.validationErrorString"]}',
      },
    });

    const requestValidator = new apigateway.RequestValidator(
      this,
      "RequestValidator",
      {
        restApi: api,
        validateRequestBody: true,
      }
    );

    const requestModel = new apigateway.Model(this, "RequestModel", {
      restApi: api,
      contentType: "application/json",
      schema: JSON.parse(
        require("fs").readFileSync(
          path.join(__dirname, "..", "schemas", "product-schema.json"),
          "utf-8"
        )
      ),
    });

    const createIntegration = new apigateway.LambdaIntegration(createProduct);
    products.addMethod("POST", createIntegration, {
      requestValidator,
      requestModels: {
        "application/json": requestModel,
      },
    });

    // SQS
    const catalogItemsQueue = new sqs.Queue(this, "CatalogItemsQueue", {
      queueName: "catalogItemsQueue",
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    const createProductTopic = new sns.Topic(this, "CreateProductTopic");

    // Subscription for product with price less than 100
    createProductTopic.addSubscription(
      new sns_subscriptions.EmailSubscription("s.kuzema@gmail.com", {
        filterPolicy: {
          price: sns.SubscriptionFilter.numericFilter({
            lessThan: 100,
          }),
        },
      })
    );

    // Subscription for product with price greater than or equal to 100
    createProductTopic.addSubscription(
      new sns_subscriptions.EmailSubscription("bpmtestusr1@gmail.com", {
        filterPolicy: {
          price: sns.SubscriptionFilter.numericFilter({
            greaterThanOrEqualTo: 100,
          }),
        },
      })
    );

    const catalogBatchProcess = new lambda.Function(
      this,
      "CatalogBatchProcess",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "catalogBatchProcess.handler",
        environment: {
          PRODUCTS_TABLE_NAME: productsTable.tableName,
          STOCKS_TABLE_NAME: stocksTable.tableName,
          CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn,
        },
      }
    );

    productsTable.grantReadData(catalogBatchProcess);
    stocksTable.grantReadData(catalogBatchProcess);
    productsTable.grantWriteData(catalogBatchProcess);
    stocksTable.grantWriteData(catalogBatchProcess);

    createProductTopic.grantPublish(catalogBatchProcess);

    catalogBatchProcess.addEventSource(
      new SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );

    new cdk.CfnOutput(this, "CatalogItemsQueueUrl", {
      value: catalogItemsQueue.queueUrl,
    });
  }
}
