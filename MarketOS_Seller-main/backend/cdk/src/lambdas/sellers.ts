import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { getSellerId, getUserSub } from './_lib/auth';

const ddb = new DynamoDBClient({});
const SELLERS_TABLE = process.env.SELLERS_TABLE!;
const USERS_TABLE = process.env.USERS_TABLE || 'marketos_users';

const json = (code: number, body: any) => ({
  statusCode: code,
  headers: {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  },
  body: JSON.stringify(body),
});

const now = () => new Date().toISOString();

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).toUpperCase();
}

async function getMappedSellerId(sub: string): Promise<string | undefined> {
  const res = await ddb.send(new GetItemCommand({ TableName: USERS_TABLE, Key: marshall({ sub }) }));
  const item = res.Item ? unmarshall(res.Item) : undefined;
  return item?.sellerId;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.resource || event.path;
    const sub = getUserSub(event);
    if (!sub) return json(401, { error: 'unauthorized' });

    // GET /api/sellers/me
    if (method === 'GET' && /\/api\/sellers\/me$/.test(path)) {
      const mapped = await getMappedSellerId(sub);
      if (!mapped) return json(404, { error: 'no-seller' });
      const res = await ddb.send(new GetItemCommand({ TableName: SELLERS_TABLE, Key: marshall({ sellerId: mapped }) }));
      return json(200, res.Item ? unmarshall(res.Item) : {});
    }

    // GET /api/sellers/{id}
    if (method === 'GET' && /\/api\/sellers\/\{id\}$/.test(event.resource || '')) {
      const id = event.pathParameters?.id!;
      const res = await ddb.send(new GetItemCommand({ TableName: SELLERS_TABLE, Key: marshall({ sellerId: id }) }));
      return json(200, res.Item ? unmarshall(res.Item) : {});
    }

    // POST /api/sellers  (create + map sub -> sellerId)
    if (method === 'POST' && /\/api\/sellers$/.test(path)) {
      const body = event.body ? JSON.parse(event.body) : {};
      const inputName: string | undefined = body.name;
      const providedId: string | undefined = body.sellerId;
      if (!inputName && !providedId) return json(400, { error: 'name-or-sellerId-required' });

      const sellerId = providedId || slugify(inputName!);
      const item = {
        sellerId,
        name: inputName || sellerId,
        logo: body.logo || null,
        ownerSub: sub,
        createdAt: now(),
        updatedAt: now(),
      };

      await ddb.send(new PutItemCommand({ TableName: SELLERS_TABLE, Item: marshall(item) }));
      await ddb.send(new PutItemCommand({ TableName: USERS_TABLE, Item: marshall({ sub, sellerId }) }));
      return json(201, item);
    }

    // PUT /api/sellers/{id}
    if (method === 'PUT' && /\/api\/sellers\/\{id\}$/.test(event.resource || '')) {
      const id = event.pathParameters?.id!;
      const mapped = await getMappedSellerId(sub);
      if (!mapped || mapped !== id) return json(403, { error: 'forbidden' });
      const body = event.body ? JSON.parse(event.body) : {};
      const expr: string[] = [];
      const values: Record<string, any> = {};
      if (typeof body.name === 'string') { expr.push('#n = :n'); values[':n'] = body.name; }
      if (typeof body.logo === 'string') { expr.push('#l = :l'); values[':l'] = body.logo; }
      expr.push('#u = :u'); values[':u'] = now();

      const ExpressionAttributeNames = { '#n': 'name', '#l': 'logo', '#u': 'updatedAt' };
      await ddb.send(new UpdateItemCommand({
        TableName: SELLERS_TABLE,
        Key: marshall({ sellerId: id }),
        UpdateExpression: 'SET ' + expr.join(', '),
        ExpressionAttributeNames,
        ExpressionAttributeValues: marshall(values),
      }));
      const updated = await ddb.send(new GetItemCommand({ TableName: SELLERS_TABLE, Key: marshall({ sellerId: id }) }));
      return json(200, updated.Item ? unmarshall(updated.Item) : {});
    }

    return json(404, { error: 'not-found' });
  } catch (e: any) {
    console.error(e);
    return json(500, { error: 'server', message: e?.message || 'error' });
  }
};
