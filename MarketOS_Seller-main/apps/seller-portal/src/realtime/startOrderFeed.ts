import { subscribeOrderStatus } from './appsyncClient';

export function startOrderFeed(orderId: string, onUpdate: (o:any)=>void) {
  let stop: (()=>void) | null = null;
  subscribeOrderStatus(orderId, onUpdate).then(unsub => { stop = unsub; });
  return () => { if (stop) stop(); };
}
