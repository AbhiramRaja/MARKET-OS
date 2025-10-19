import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { corsHeaders } from "./utils.js";
import { randomUUID } from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.PRODUCTS_TABLE || "marketos_products";

const now = () => new Date().toISOString();

export async function handler(event: any) {
  try {
    const method = event.httpMethod;
    const id = event.pathParameters?.id;

    if (method === "OPTIONS") {
      return { statusCode: 200, headers: corsHeaders, body: "" };
    }

    // GET /products - list all
    if (method === "GET" && !id) {
      const qs = event.queryStringParameters || {};
      const sellerId = qs.sellerId;
      
      let items;
      if (sellerId) {
        const res = await ddb.send(new ScanCommand({ 
          TableName: TABLE,
          FilterExpression: "sellerId = :sid",
          ExpressionAttributeValues: { ":sid": sellerId }
        }));
        items = res.Items || [];
      } else {
        const res = await ddb.send(new ScanCommand({ TableName: TABLE }));
        items = res.Items || [];
      }
      
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(items) };
    }

    // GET /products/{id} - get single product
    if (method === "GET" && id) {
      const res = await ddb.send(new GetCommand({ 
        TableName: TABLE, 
        Key: { productId: id } 
      }));
      return { 
        statusCode: res.Item ? 200 : 404, 
        headers: corsHeaders, 
        body: JSON.stringify(res.Item || { error: "Not found" }) 
      };
    }

    // POST /products - create new
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      
      if (!body.name || !body.sellerId) {
        return { 
          statusCode: 400, 
          headers: corsHeaders, 
          body: JSON.stringify({ error: "name and sellerId required" }) 
        };
      }
      
      const item = {
        productId: randomUUID(),
        sellerId: body.sellerId,
        name: body.name,
        description: body.description || "",
        price: Number(body.price || 0),
        stock: Number(body.stock || 0),
        category: body.category || "General",
        imageUrl: body.imageUrl || "",
        createdAt: now(),
        updatedAt: now(),
      };
      
      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      return { statusCode: 201, headers: corsHeaders, body: JSON.stringify(item) };
    }

    // PUT /products/{id} - update existing
    if (method === "PUT" && id) {
      const body = JSON.parse(event.body || "{}");
      
      const updates: string[] = [];
      const values: Record<string, any> = {};
      const names: Record<string, string> = {};

      if (body.name !== undefined) {
        updates.push("#name = :name");
        values[":name"] = body.name;
        names["#name"] = "name";
      }
      if (body.description !== undefined) {
        updates.push("#desc = :desc");
        values[":desc"] = body.description;
        names["#desc"] = "description";
      }
      if (body.price !== undefined) {
        updates.push("price = :price");
        values[":price"] = Number(body.price);
      }
      if (body.stock !== undefined) {
        updates.push("stock = :stock");
        values[":stock"] = Number(body.stock);
      }
      if (body.category !== undefined) {
        updates.push("category = :category");
        values[":category"] = body.category;
      }

      updates.push("updatedAt = :updatedAt");
      values[":updatedAt"] = now();

      await ddb.send(new UpdateCommand({
        TableName: TABLE,
        Key: { productId: id },
        UpdateExpression: `SET ${updates.join(", ")}`,
        ExpressionAttributeValues: values,
        ...(Object.keys(names).length > 0 ? { ExpressionAttributeNames: names } : {}),
      }));

      const updated = await ddb.send(new GetCommand({ 
        TableName: TABLE, 
        Key: { productId: id } 
      }));

      return { 
        statusCode: 200, 
        headers: corsHeaders, 
        body: JSON.stringify(updated.Item || {}) 
      };
    }

    // DELETE /products/{id}
    if (method === "DELETE" && id) {
      await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { productId: id } }));
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ deleted: id }) };
    }

    return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: "Not found" }) };
  } catch (error: any) {
    console.error("Lambda error:", error);
    return { 
      statusCode: 500, 
      headers: corsHeaders, 
      body: JSON.stringify({ error: "Internal server error", message: error.message }) 
    };
  }
}
