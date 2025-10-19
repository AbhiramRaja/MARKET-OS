import { fetchAuthSession } from 'aws-amplify/auth';

const HTTP_URL = import.meta.env.VITE_APPSYNC_HTTP_URL;
const WS_URL   = import.meta.env.VITE_APPSYNC_WS_URL;

/**
 * Subscribe to order status changes using Cognito token and explicit AppSync WS URL
 */
export async function subscribeOrderStatus(orderId: string, onMessage: (o: any) => void) {
  const token = (await fetchAuthSession()).tokens?.idToken?.toString();
  if (!token) throw new Error('No Cognito idToken for AppSync');

  const payload = {
    data: JSON.stringify({
      query: "subscription OnOrderStatusChange($id: ID!) { onOrderStatusChange(id:$id){ id status updatedAt }}",
      variables: { id: orderId }
    }),
    extensions: {
      authorization: {
        Authorization: token,
        host: new URL(HTTP_URL).host,
      },
    },
  };

  // Encode header for AppSync protocol
  const header = btoa(JSON.stringify({
    ...payload.extensions.authorization,
    "content-type": "application/json; charset=UTF-8",
  })).replace(/=+$/, '');

  // Build WS URL with headers and empty payload
  const url = new URL(WS_URL);
  url.searchParams.set("header", header);
  url.searchParams.set("payload", btoa(JSON.stringify({})));

  const ws = new WebSocket(url.toString(), "graphql-ws");

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "connection_init" }));
    ws.send(JSON.stringify({ id: "1", type: "start", payload }));
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(String(evt.data));
      if (msg.type === "data") onMessage(msg.payload.data.onOrderStatusChange);
    } catch {}
  };

  ws.onerror = (e) => console.error("[appsync-ws] error", e);

  return () => ws.close(1000, "client close");
}
