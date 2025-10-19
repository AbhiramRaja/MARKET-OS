import { unmarshall } from "@aws-sdk/util-dynamodb";

/**
 * Trigger: DynamoDB Stream on Orders table.
 * Publishes status changes to AppSync subscription.
 *
 * Required env:
 * - APPSYNC_URL  (GraphQL endpoint, ends with /graphql)
 * - APPSYNC_KEY  (API key)
 */
export const handler = async (event: any) => {
  const url = process.env.APPSYNC_URL!;
  const apiKey = process.env.APPSYNC_KEY!;
  if (!url || !apiKey) {
    console.error("Missing APPSYNC_URL or APPSYNC_KEY");
    return;
  }

  const mutation = `
    mutation Publish($orderId: ID!, $sellerId: String!, $status: String!, $updatedAt: AWSDateTime!) {
      publishOrderUpdate(orderId: $orderId, sellerId: $sellerId, status: $status, updatedAt: $updatedAt) {
        orderId
        sellerId
        status
        updatedAt
      }
    }
  `;

  const records = event?.Records ?? [];
  for (const rec of records) {
    try {
      if (!rec.dynamodb?.NewImage) continue;
      if (rec.eventName !== "MODIFY" && rec.eventName !== "INSERT") continue;

      const newItem = unmarshall(rec.dynamodb.NewImage);
      const oldItem = rec.dynamodb.OldImage ? unmarshall(rec.dynamodb.OldImage) : {};

      // Only broadcast when the status actually changed (or on first insert).
      if (rec.eventName === "MODIFY" && oldItem?.status === newItem?.status) continue;

      const variables = {
        orderId: newItem.orderId,
        sellerId: newItem.sellerId,
        status: newItem.status,
        updatedAt: newItem.updatedAt || new Date().toISOString(),
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ query: mutation, variables }),
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("AppSync error:", res.status, text);
      } else {
        console.log("AppSync ok:", text);
      }
    } catch (err) {
      console.error("orderStream error:", err);
    }
  }

  // Nothing to return; this is an async processor.
  return;
};
