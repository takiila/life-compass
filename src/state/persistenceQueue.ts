export function createPersistenceQueue<T>(save: (value: T) => Promise<void>, onError?: (error: unknown) => void) {
  let pending: Promise<void> = Promise.resolve();
  return {
    enqueue(value: T) {
      pending = pending.then(() => save(value)).catch((error) => { onError?.(error); });
      return pending;
    },
    flush() { return pending; },
  };
}
