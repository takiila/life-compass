import { describe, expect, it } from 'vitest';

import { createPersistenceQueue } from '../src/state/persistenceQueue';

describe('AppState persistence queue', () => {
  it('writes rapid state updates in the same order they were enqueued', async () => {
    const written: number[] = [];
    const queue = createPersistenceQueue(async (value: number) => {
      await new Promise((resolve) => setTimeout(resolve, value === 1 ? 20 : 1));
      written.push(value);
    });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    await queue.flush();
    expect(written).toEqual([1, 2, 3]);
  });

  it('continues after one failed write and reports the error', async () => {
    const written: number[] = [];
    const errors: unknown[] = [];
    const queue = createPersistenceQueue(async (value: number) => { if (value === 2) throw new Error('failed'); written.push(value); }, (error) => errors.push(error));
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    await queue.flush();
    expect(written).toEqual([1, 3]);
    expect(errors).toHaveLength(1);
  });
});
