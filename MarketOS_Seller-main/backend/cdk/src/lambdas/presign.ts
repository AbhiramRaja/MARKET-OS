import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getSellerId, getUserSub } from './_lib/auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1';
const s3 = new S3Client({ region });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const USERS_TABLE = process.env.USERS_TABLE || 'marketos_users';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    let sellerId =
      getSellerId(event) ||
      event.queryStringParameters?.sellerId ||
      process.env.DEFAULT_SELLER_ID;

    if (!sellerId) {
      const sub = getUserSub(event);
      if (sub) {
        try {
          const resp = await ddb.send(new GetCommand({ TableName: USERS_TABLE, Key: { sub } }));
          sellerId = resp.Item?.sellerId;
        } catch (e) {
          console.error('users lookup failed', e);
        }
      }
    }

    if (!sellerId) return json(400, { error: 'sellerId missing' });

    const accountId = (event.requestContext as any)?.accountId;
    const derivedBucket = accountId ? `marketos-seller-assets-${accountId}-${region}` : undefined;
    const bucket = process.env.ASSETS_BUCKET || derivedBucket;
    if (!bucket) return json(500, { error: 'ASSETS_BUCKET not set and cannot derive from request' });

    let filename = 'upload.bin';
    let contentType = 'application/octet-stream';
    let folder = 'products';
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        if (typeof body.filename === 'string' && body.filename.trim()) filename = body.filename.trim();
        if (typeof body.contentType === 'string' && body.contentType.trim()) contentType = body.contentType.trim();
        if (typeof body.folder === 'string' && body.folder.trim()) folder = body.folder.trim();
      } catch {}
    }

    const key = `${sellerId}/${folder}/${randomUUID()}-${sanitize(filename)}`;
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return json(200, { uploadUrl, bucket, key, region, expiresIn: 3600 });
  } catch (err) {
    console.error(err);
    return json(500, { error: 'failed to create upload URL' });
  }
};

function sanitize(name: string): string { return name.replace(/[^\w.\-]+/g, '_'); }
function json(status: number, body: any) {
  return { statusCode: status, headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    }, body: JSON.stringify(body) };
}
