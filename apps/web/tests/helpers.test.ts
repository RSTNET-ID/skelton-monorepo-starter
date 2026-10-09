import { describe, expect, it } from 'vitest';
import {
	buildQuery,
	formatCurrency,
	formatPercent,
	initials,
	normalizeSearch,
	paginationInfo,
	parsePositiveInt,
	truncate,
	uniqueBy,
	omitEmpty
} from '../src/lib/helpers/index.ts';

describe('shared helpers', () => {
	it('formats numbers and percentages for Indonesian locale', () => {
		expect(formatCurrency(2500000)).toContain('2.500.000');
		expect(formatPercent(12.5)).toBe('12,5%');
	});
	it('normalizes text and truncates it', () => {
		expect(initials('  Budi Santoso  ')).toBe('BS');
		expect(normalizeSearch('  foo   bar ')).toBe('foo bar');
		expect(truncate('abcdef', 4)).toBe('abc…');
	});
	it('builds repeated query keys and skips empty values', () => {
		expect(buildQuery({ search: 'x y', status: ['a', 'b'], empty: null })).toBe(
			'search=x+y&status=a&status=b'
		);
		expect(parsePositiveInt('-3', 10)).toBe(10);
		expect(paginationInfo(3, 10, 21)).toMatchObject({
			page: 3,
			pages: 3,
			hasNext: false,
			offset: 20
		});
	});
	it('deduplicates stable IDs and omits empty fields', () => {
		expect(uniqueBy([{ id: 'a' }, { id: 'a' }, { id: 'b' }], (v) => v.id)).toHaveLength(2);
		expect(omitEmpty({ a: '', b: 3, c: null })).toEqual({ b: 3 });
	});
});
