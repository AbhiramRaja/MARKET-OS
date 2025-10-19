import * as cdk from "aws-cdk-lib";
import { Stack, StackProps, CfnOutput, Duration } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { join } from "path";

interface ApiProps extends StackProps {
  productsTable: dynamodb.Table;
  ordersTable: dynamodb.Table;
  sellersTable: dynamodb.ITable;
  assetBucket: s3.Bucket;
  userPool: cognito.UserPool;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id, props);

    const productsFn = new node.NodejsFunction(this, "ProductsFn", {
      entry: join(__dirname, "..", "src", "lambdas", "products.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(15),
      memorySize: 512,
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        PRODUCTS_TABLE: props.productsTable.tableName,
      },
    });
    props.productsTable.grantReadWriteData(productsFn);

    const ordersFn = new node.NodejsFunction(this, "OrdersFn", {
      entry: join(__dirname, "..", "src", "lambdas", "orders.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(15),
      memorySize: 512,
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        ORDERS_TABLE: props.ordersTable.tableName,
      },
    });
    props.ordersTable.grantReadWriteData(ordersFn);

    const presignFn = new node.NodejsFunction(this, "PresignFn", {
      entry: join(__dirname, "..", "src", "lambdas", "presign.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        ASSETS_BUCKET: props.assetBucket.bucketName,
        USERS_TABLE: "marketos_users",
      },
    });
    props.assetBucket.grantPut(presignFn);
    presignFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:PutObject"],
        resources: [props.assetBucket.arnForObjects("*")],
      })
    );
    const account = cdk.Stack.of(this).account;
    const region = cdk.Stack.of(this).region;
    presignFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"],
        resources: [`arn:aws:dynamodb:${region}:${account}:table/marketos_users`],
      })
    );

    const sellersFn = new node.NodejsFunction(this, "SellersFn", {
      entry: join(__dirname, "..", "src", "lambdas", "sellers.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(15),
      memorySize: 512,
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        SELLERS_TABLE: props.sellersTable.tableName,
        USERS_TABLE: "marketos_users",
      },
    });
    props.sellersTable.grantReadWriteData(sellersFn);
    sellersFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"],
        resources: [`arn:aws:dynamodb:${region}:${account}:table/marketos_users`],
      })
    );

    // API with permissive CORS for development
    const api = new apigw.RestApi(this, "SellerApi", {
      restApiName: "marketos-seller-api",
      deployOptions: { stageName: "prod" },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
        allowCredentials: true,
      },
    });

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(
      this,
      "SellerApiAuthorizer",
      {
        cognitoUserPools: [props.userPool],
        identitySource: "method.request.header.Authorization",
      }
    );

    // Products endpoints
    const products = api.root.addResource("products");
    products.addMethod("GET", new apigw.LambdaIntegration(productsFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    products.addMethod("POST", new apigw.LambdaIntegration(productsFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    
    const productById = products.addResource("{id}");
    productById.addMethod("GET", new apigw.LambdaIntegration(productsFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    productById.addMethod("PUT", new apigw.LambdaIntegration(productsFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    productById.addMethod("DELETE", new apigw.LambdaIntegration(productsFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // Orders endpoints
    const orders = api.root.addResource("orders");
    orders.addMethod("GET", new apigw.LambdaIntegration(ordersFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    orders.addMethod("POST", new apigw.LambdaIntegration(ordersFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    
    const orderById = orders.addResource("{id}");
    orderById.addMethod("GET", new apigw.LambdaIntegration(ordersFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    orderById.addMethod("PUT", new apigw.LambdaIntegration(ordersFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // Sellers endpoints
    const sellers = api.root.addResource("sellers");
    sellers.addMethod("POST", new apigw.LambdaIntegration(sellersFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    
    const sellersMe = sellers.addResource("me");
    sellersMe.addMethod("GET", new apigw.LambdaIntegration(sellersFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    
    const sellerById = sellers.addResource("{id}");
    sellerById.addMethod("GET", new apigw.LambdaIntegration(sellersFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    sellerById.addMethod("PUT", new apigw.LambdaIntegration(sellersFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // Upload endpoint
    const upload = api.root.addResource("upload-url");
    upload.addMethod("POST", new apigw.LambdaIntegration(presignFn), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    new CfnOutput(this, "ApiBaseUrl", { value: api.url ?? "undefined" });
  }
}
