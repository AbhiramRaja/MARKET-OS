import { Stack, StackProps, RemovalPolicy, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export interface SellerFrontendStackProps extends StackProps {
  readonly appName?: string;
}

export class SellerFrontendStack extends Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: SellerFrontendStackProps) {
    super(scope, id, props);

    const appName = props?.appName ?? 'marketos-seller-portal';

    // Private S3 bucket; CloudFront will read via Origin Access Control (OAC)
    this.bucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: undefined, // let AWS name it (globally unique)
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    const oac = new cloudfront.OriginAccessControl(this, 'OAC', {
      originAccessControlName: `${appName}-oac`,
      signingBehavior: cloudfront.OriginAccessControlSigningBehavior.SIGNING_ENABLED,
      signingProtocol: cloudfront.OriginAccessControlSigningProtocol.SIGV4,
      originType: cloudfront.OriginAccessControlOriginTypes.S3,
    });

    // CloudFront distribution with SPA routing (403/404 -> /index.html)
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, { originAccessControl: oac }),
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.minutes(1) },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.minutes(1) },
      ],
      comment: `${appName} frontend`,
    });

    // Allow CloudFront to read the bucket via OAC (bucket policy)
    const cfArn = `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`;
    this.bucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:GetObject'],
      resources: [this.bucket.arnForObjects('*')],
      conditions: {
        StringEquals: { 'AWS:SourceArn': cfArn },
      },
    }));

    new CfnOutput(this, 'WebBucketName', { value: this.bucket.bucketName });
    new CfnOutput(this, 'CloudFrontDomain', { value: this.distribution.domainName });
    new CfnOutput(this, 'DistributionId', { value: this.distribution.distributionId });
  }
}
