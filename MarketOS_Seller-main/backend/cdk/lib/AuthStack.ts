import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
export class AuthStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.userPool = new cognito.UserPool(this, 'SellerUserPool', {
      userPoolName: 'marketos-seller-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: { email: { required: true, mutable: false } },
      removalPolicy: RemovalPolicy.DESTROY
    });
    this.userPoolClient = this.userPool.addClient('SellerUserPoolClient', {
      authFlows: { userPassword: true, userSrp: true },
      generateSecret: false,
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30)
    });
    new CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
  }
}
