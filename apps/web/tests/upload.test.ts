import { describe, expect, it } from 'vitest';
import { validateUploadOrigin } from '../src/lib/helpers/upload.ts';

describe('presigned upload origins', () => {
	const allow = ['https://minio.example.com'];
	it('accepts explicit HTTPS origins', () => {
		expect(validateUploadOrigin('https://minio.example.com/bucket/file?signature=abc', allow)).toBe(
			true
		);
	});
	it('rejects unexpected, spoofed and downgraded hosts', () => {
		expect(validateUploadOrigin('https://evil.example.com/bucket', allow)).toBe(false);
		expect(validateUploadOrigin('https://minio.example.com.evil.test/bucket', allow)).toBe(false);
		expect(validateUploadOrigin('http://minio.example.com/bucket', allow)).toBe(false);
		expect(validateUploadOrigin('https://user:pass@minio.example.com/bucket', allow)).toBe(false);
	});
	it('allows explicitly configured local development URLs', () => {
		expect(validateUploadOrigin('http://localhost:9000/bucket', ['http://localhost:9000'])).toBe(
			true
		);
	});
});
