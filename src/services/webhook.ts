import Redis from 'ioredis';
import crypto from 'crypto';

const redis = new Redis(process.env.REDIS_URL!);

export interface WebhookEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

/**
 * Enqueues a webhook delivery with exponential backoff retry.
 */
export async function dispatchWebhook(
  endpoint: string,
  secret: string,
  event: WebhookEvent,
  attempt = 0
): Promise<void> {
  const body = JSON.stringify(event);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VaultPay-Signature': `sha256=${signature}`,
    },
    body,
  });

  if (!res.ok && attempt < 5) {
    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
    await redis.zadd('webhook:retry', Date.now() + delay, JSON.stringify({
      endpoint, secret, event, attempt: attempt + 1,
    }));
  }
}
