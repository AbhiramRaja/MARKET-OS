import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as node from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { join } from 'path';
import * as cognito from 'aws-cdk-lib/aws-cognito';


interface RealtimeProps extends StackProps {
  appsyncApiName?: string;
  ordersTableName?: string;
  ordersStreamArn?: string;
  userPool?: cognito.IUserPool;
}

export class RealtimeStack extends Stack {
  public readonly api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: RealtimeProps = {}) {
    super(scope, id, props);

    const ordersTableName = props.ordersTableName ?? 'marketos_orders';
    const ordersStreamArn = props.ordersStreamArn ?? process.env.ORDERS_STREAM_ARN ?? '';

    this.api = new appsync.GraphqlApi(this, 'SellerRealtimeApi', {
      name: props.appsyncApiName ?? 'marketos-realtime',
      schema: appsync.SchemaFile.fromAsset('appsync/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: { authorizationType: appsync.AuthorizationType.API_KEY },
      },
      xrayEnabled: true,
    });

    const importedOrders = dynamodb.Table.fromTableAttributes(this, 'ImportedOrdersTable', {
      tableName: ordersTableName,
      tableStreamArn: ordersStreamArn,
    });

    const streamFn = new node.NodejsFunction(this, 'OrderStreamFn', {
      entry: join(__dirname, '..', 'src', 'lambdas', 'orderStream.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 512,
      environment: {
        APPSYNC_URL: this.api.graphqlUrl,
      },
    });

    streamFn.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'dynamodb:DescribeStream',
        'dynamodb:GetRecords',
        'dynamodb:GetShardIterator',
        'dynamodb:ListStreams'
      ],
      resources: [ordersStreamArn],
    }));

    new lambda.EventSourceMapping(this, 'OrdersStreamMapping', {
      target: streamFn,
      eventSourceArn: ordersStreamArn,
      startingPosition: lambda.StartingPosition.LATEST,
      batchSize: 100,
      enabled: true,
    });

    new CfnOutput(this, 'AppSyncGraphQLUrl', {
      value: this.api.graphqlUrl,
      description: 'AppSync GraphQL Endpoint',
    });

    new CfnOutput(this, 'AppSyncApiKey', {
      value: this.api.apiKey || 'N/A',
      description: 'AppSync API Key',
    });

    new CfnOutput(this, 'AppSyncApiId', {
      value: this.api.apiId,
      description: 'AppSync API ID',
    });
  }
}
