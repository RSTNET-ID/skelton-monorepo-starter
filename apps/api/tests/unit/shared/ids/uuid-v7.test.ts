import { describe, expect, test } from 'bun:test';
import { isUuidV7, uuidV7 } from '@/shared/ids/uuid-v7';

describe('RFC 9562 UUIDv7', () => {
  test('sets version and variant with unique random tail', () => {
    const values = Array.from({ length: 1000 }, () => uuidV7());
    expect(values.every(isUuidV7)).toBe(true);
    expect(new Set(values).size).toBe(values.length);
  });
  test('encodes the 48-bit millisecond timestamp in canonical bytes', () => {
    const value = uuidV7(1740000000000);
    expect(value.replace(/-/g, '').slice(0, 12)).toBe('01952014f800');
  });
  test('orders across different timestamps', () => {
    expect(uuidV7(1000) < uuidV7(1001)).toBe(true);
  });
  test('rejects invalid timestamps and UUID variants', () => {
    expect(() => uuidV7(-1)).toThrow(RangeError);
    expect(() => uuidV7(Number.NaN)).toThrow(RangeError);
    expect(isUuidV7('00000000-0000-4000-8000-000000000000')).toBe(false);
  });
});
