import { describe, expect, it } from 'vitest';
import { firstFieldError, mapFieldErrors } from '../src/lib/helpers/form-errors.ts';

describe('form error mapper', () => {
	it('normalizes backend fields', () => {
		const errors = mapFieldErrors({ fields: { email: ['Invalid email'], name: 'Required' } });
		expect(firstFieldError(errors, 'email')).toBe('Invalid email');
		expect(firstFieldError(errors, 'name')).toBe('Required');
	});
	it('ignores malformed payloads and unsupported values', () => {
		expect(mapFieldErrors(null)).toEqual({});
		expect(mapFieldErrors({ errors: { email: [123, 'Bad'], amount: false } })).toEqual({
			email: ['Bad']
		});
	});
});
