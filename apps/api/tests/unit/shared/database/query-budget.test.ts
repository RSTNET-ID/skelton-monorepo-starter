import { describe, expect, test } from 'bun:test';
import { createQueryBudget } from '../../../helpers/query-budget';

describe('query-budget helper', () => {
  test('bounded batch lookup keeps query count fixed', async () => {
    for (const size of [1, 10, 100]) {
      const budget = createQueryBudget();
      const ids = Array.from({ length: size }, (_, i) => i);
      await budget.run(async () => ids.map(id => ({ id })));
      budget.assertAtMost(1);
      expect(budget.count).toBe(1);
    }
  });
  test('N+1 loop exceeds query budget with larger result set', async () => {
    const budget = createQueryBudget();
    for (const id of [1, 2, 3]) await budget.run(async () => id);
    expect(() => budget.assertAtMost(2)).toThrow('Query budget exceeded');
  });
});
