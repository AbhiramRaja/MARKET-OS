import { sellerApi } from '../services/rest';

const DISABLED = (import.meta as any)?.env?.VITE_REALTIME_DISABLED === '1';

type Order = { orderId: string; sellerId: string; status: string; updatedAt?: string };

export async function startOrderFeed(args: { sellerId: string; onUpdate: (o: Order) => void }) {
  const { sellerId, onUpdate } = args;

  // Polling fallback (also used when WS disabled for dev/prod)
  const startPolling = async () => {
    const tick = async () => {
      try {
        const { data } = await sellerApi.get('/orders', { params: { sellerId } });
        if (Array.isArray(data)) data.forEach((o: Order) => onUpdate(o));
      } catch {
        // swallow in production build
      }
    };
    await tick();
    const h = setInterval(tick, 5000);
    return () => clearInterval(h);
  };

  if (DISABLED) return startPolling();

  try {
    // Lazy-import GraphQL client & subscription; cast as any to avoid TS build breakage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientMod: any = await import('../graphql/client');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subsMod: any = await import('../graphql/subscriptions');
    const gqlClient = clientMod.gqlClient;
    const onOrderStatusChange = subsMod.onOrderStatusChange;

    // Best-effort subscription; typings come from runtime module, so cast to any.
    const sub = (gqlClient as any)
      .graphql({ query: onOrderStatusChange, variables: { sellerId }, authMode: 'userPool' })
      .subscribe({
        next: ({ data }: any) => {
          const update: Order | undefined = data?.onOrderStatusChange;
          if (update) onUpdate(update);
        },
        error: (_err: unknown) => {
          // fall back to polling if WS errors at runtime
        },
      });

    return () => sub?.unsubscribe?.();
  } catch {
    // If modules not present or any build-time issue, fallback to polling.
    return startPolling();
  }
}
