/**
 * RFC 9562 UUIDv7. Canonical textual representation, timestamp ordered at
 * millisecond precision. Randomness from Web Crypto; do not use Math.random.
 *
 * For a single millisecond values are not guaranteed monotonically ordered.
 * Never assume UUID ordering reflects exact insertion order.
 */
export function uuidV7(now: number = Date.now()): string {
  if (!Number.isSafeInteger(now) || now < 0 || now > 281474976710655) {
    throw new RangeError('UUIDv7 timestamp must be an integer in the 48-bit millisecond range');
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let timestamp = BigInt(now);
  for (let i = 5; i >= 0; i--) {
    bytes[i] = Number(timestamp & 255n);
    timestamp >>= 8n;
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
}

export function isUuidV7(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
