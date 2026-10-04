export const WORKER_QUEUES = ['audio', 'ai', 'notifications', 'search-index'] as const;
export type WorkerQueue = typeof WORKER_QUEUES[number];

/**
 * Central queue registry. Workers should import this instead of duplicating
 * queue names, preventing producer/consumer drift.
 */
export const workerQueueName = (queue: WorkerQueue) => `bible-platform:${queue}`;
