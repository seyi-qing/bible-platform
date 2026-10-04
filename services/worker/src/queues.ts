export const QUEUES = { AI: 'ai', NOTIFICATIONS: 'notifications', SEARCH: 'search-index', AUDIO: 'audio', MAINTENANCE: 'maintenance' } as const;
export type QueueName = typeof QUEUES[keyof typeof QUEUES];
export const connection = { url: process.env.REDIS_URL ?? 'redis://localhost:6379', maxRetriesPerRequest: null as null };
