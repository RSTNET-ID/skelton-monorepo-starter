/**
 * Count calls across one logical repository/database boundary in tests.
 * Inject the tracked execution function into the repository under test.
 * This is not a production SQL interceptor: integration tests should measure
 * actual database calls and assert fixed/bounded counts for varying row sizes.
 */
export interface QueryBudget {
  readonly count: number;
  run<T>(operation: () => Promise<T>): Promise<T>;
  assertAtMost(limit: number): void;
}

export function createQueryBudget(): QueryBudget {
  let count = 0;
  return {
    get count() { return count; },
    async run<T>(operation: () => Promise<T>): Promise<T> {
      count++;
      return await operation();
    },
    assertAtMost(limit: number) {
      if (!Number.isSafeInteger(limit) || limit < 0) throw new RangeError('Invalid query budget');
      if (count > limit) throw new Error('Query budget exceeded: ' + count + ' > ' + limit);
    },
  };
}
