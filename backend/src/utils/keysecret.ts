import crypto from 'crypto';

const KEYSECRET_REGEX = /^lk_[a-f0-9]{20}_[a-f0-9]{20}_[a-f0-9]{20}$/;

/**
 * Gera uma keysecret no formato: lk_<20hex>_<20hex>_<20hex>
 */
export function generateKeysecret(): string {
  const part1 = crypto.randomBytes(10).toString('hex'); // 20 chars
  const part2 = crypto.randomBytes(10).toString('hex');
  const part3 = crypto.randomBytes(10).toString('hex');
  return `lk_${part1}_${part2}_${part3}`;
}

/**
 * Valida o formato de uma keysecret.
 */
export function isValidKeysecret(key: string): boolean {
  return KEYSECRET_REGEX.test(key);
}
