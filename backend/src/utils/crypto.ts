import crypto from 'crypto';

if (!process.env.ENCRYPTION_KEY) {
  throw new Error("FALHA CRÍTICA: Variável de ambiente ENCRYPTION_KEY não configurada! Ela deve ter 32 caracteres.");
}
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Garante 32 bytes para AES-256
const KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
const IV_LENGTH = 16;

/**
 * Criptografa uma string com AES-256-CBC.
 * Usado para armazenar keysecret de forma recuperável (para exibição).
 */
export function encryptKeysecret(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf-8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Descriptografa uma keysecret criptografada.
 */
export function decryptKeysecret(encryptedText: string): string {
  const [ivHex, encHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedBuffer = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  return decrypted.toString('utf-8');
}
