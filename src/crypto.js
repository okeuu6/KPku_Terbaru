import crypto from 'node:crypto';
import { config } from './config.js';

function keyBytes() {
  return crypto.createHash('sha256').update(config.encKey).digest();
}

export function enkripsiPin(pin) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBytes(), iv);
  const encrypted = Buffer.concat([cipher.update(String(pin), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function dekripsiPin(encoded) {
  try {
    const raw = Buffer.from(String(encoded || ''), 'base64');
    if (raw.length < 29) return '(tidak terbaca)';
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const data = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBytes(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return '(kunci berubah)';
  }
}
