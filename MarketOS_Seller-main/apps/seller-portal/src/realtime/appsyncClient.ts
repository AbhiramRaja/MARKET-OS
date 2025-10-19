import { fetchAuthSession } from 'aws-amplify/auth';

const HTTP_URL = import.meta.env.VITE_APPSYNC_HTTP_URL as string;
const WS_URL = import.meta.env.VITE_APPSYNC_WS_URL as string;

export function appsyncHeaders() {
  return fetchAuthSession().then(({ tokens }) => {
    const idToken = tokens?.idToken?.toString() ?? '';
    return {
      host: new URL(HTTP_URL).host,
      'Content-Type': 'application/json',
      Authorization: idToken,
    };
  });
}

// Lightweight subscription using native WebSocket per AppSync protocol v2
export async function subscribeOrderStatus(orderId: string, onMessage: (data:any)=>void) {
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString() ?? '';

  const payload = {
    data: JSON.stringify({
      query: `subscription OnOrderStatusChange($orderId: ID!) {
        onOrderStatusChange(orderId: $orderId) {
          orderId status updatedAt
        }
      }`,
      variables: { orderId },
    }),
    extensions: {
      authorization: {
        host: new URL(HTTP_URL).host,
        Authorization: idToken,
      },
    },
  };

  const ws = new WebSocket(WS_URL, 'graphql-ws');

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'connection_init' }));
    ws.send(JSON.stringify({ id: '1', type: 'start', payload }));
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data);
      if (msg.type === 'data') onMessage(msg.payload.data.onOrderStatusChange);
    } catch {}
  };

  return () => ws.close(1000, 'client close');
}
