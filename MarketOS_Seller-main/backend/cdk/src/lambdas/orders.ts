import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { corsHeaders } from "./utils.js";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ORDERS_TABLE = process.env.ORDERS_TABLE || "marketos_orders";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || "marketos_products";

const now = () => new Date().toISOString();

export async function handler(event: any) {
  const method = event.httpMethod;
  const id = event.pathParameters?.id;

  if (method === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  // GET /orders - list all orders
  if (method === "GET" && !id) {
    try {
      const res = await ddb.send(new ScanCommand({ TableName: ORDERS_TABLE }));
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(res.Items || []) };
    } catch (e: any) {
      console.error(e);
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "server" }) };
    }
  }

  // GET /orders/{id} - get single order
  if (method === "GET" && id) {
    try {
      const res = await ddb.send(new GetCommand({ 
        TableName: ORDERS_TABLE, 
        Key: { orderId: id } 
      }));
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(res.Item || {}) };
    } catch (e: any) {
      console.error(e);
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "server" }) };
    }
  }

  // POST /orders - create order and decrement stock atomically
  // Body: { sellerId?: string, items: [{ productId, qty: number }], meta?: {...} }
  if (method === "POST") {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const items: { productId: string; qty: number }[] = body.items || [];
      
      if (!items.length) {
        return { 
          statusCode: 400, 
          headers: corsHeaders, 
          body: JSON.stringify({ error: "items-required" }) 
        };
      }

      const orderId = randomUUID();
      const orderItems: any[] = [];
      let totalAmount = 0;

      // For each item, decrement stock atomically
      for (const it of items) {
        const qty = Number(it.qty || 0);
        if (!it.productId || qty <= 0) {
          return { 
            statusCode: 400, 
            headers: corsHeaders, 
            body: JSON.stringify({ error: "invalid-item", productId: it.productId }) 
          };
        }

        // Update product stock with condition: stock >= qty
        const update = await ddb.send(new UpdateCommand({
          TableName: PRODUCTS_TABLE,
          Key: { productId: it.productId },
          UpdateExpression: "SET stock = stock - :q, updatedAt = :u",
          ConditionExpression: "attribute_exists(productId) AND stock >= :q",
          ExpressionAttributeValues: { ":q": qty, ":u": now() },
          ReturnValues: "ALL_NEW",
        }));

        const newItem = update.Attributes;
        if (!newItem) {
          return { 
            statusCode: 500, 
            headers: corsHeaders, 
            body: JSON.stringify({ error: "update-failed", productId: it.productId }) 
          };
        }

        orderItems.push({
          productId: it.productId,
          qty,
          price: newItem.price ?? 0,
          name: newItem.name ?? "",
          newStock: newItem.stock ?? 0,
        });
        totalAmount += (newItem.price ?? 0) * qty;
      }

      // Create order record
      const order = {
        orderId,
        items: orderItems,
        sellerId: body.sellerId || orderItems[0]?.sellerId || null,
        totalAmount,
        status: "CREATED",
        createdAt: now(),
        updatedAt: now(),
        meta: body.meta || {},
      };

      await ddb.send(new PutCommand({ 
        TableName: ORDERS_TABLE, 
        Item: order 
      }));

      return { 
        statusCode: 201, 
        headers: corsHeaders, 
        body: JSON.stringify(order) 
      };
    } catch (e: any) {
      console.error(e);
      
      // Handle insufficient stock gracefully
      if (e?.name === "ConditionalCheckFailedException") {
        return { 
          statusCode: 400, 
          headers: corsHeaders, 
          body: JSON.stringify({ error: "insufficient-stock" }) 
        };
      }
      
      return { 
        statusCode: 500, 
        headers: corsHeaders, 
        body: JSON.stringify({ error: "server", message: e?.message || "error" }) 
      };
    }
  }

  // PUT /orders/{id} - update order status
  if (method === "PUT" && id) {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      
      await ddb.send(new UpdateCommand({
        TableName: ORDERS_TABLE,
        Key: { orderId: id },
        UpdateExpression: "SET #status = :status, updatedAt = :u",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": body.status, ":u": now() },
      }));

      const updated = await ddb.send(new GetCommand({ 
        TableName: ORDERS_TABLE, 
        Key: { orderId: id } 
      }));

      return { 
        statusCode: 200, 
        headers: corsHeaders, 
        body: JSON.stringify(updated.Item || {}) 
      };
    } catch (e: any) {
      console.error(e);
      return { 
        statusCode: 500, 
        headers: corsHeaders, 
        body: JSON.stringify({ error: "server" }) 
      };
    }
  }

  return { 
    statusCode: 404, 
    headers: corsHeaders, 
    body: JSON.stringify({ error: "not-found" }) 
  };
}
