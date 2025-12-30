import crypto from 'crypto';

export function generateLicenseKey(productId: number, orderId: number): string {
  const timestamp = Date.now();
  const data = `${productId}-${orderId}-${timestamp}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  // Format: XXXX-XXXX-XXXX-XXXX
  const key = hash.substring(0, 16).toUpperCase();
  return `${key.substring(0, 4)}-${key.substring(4, 8)}-${key.substring(8, 12)}-${key.substring(12, 16)}`;
}

export function validateLicenseKey(key: string): boolean {
  const pattern = /^DV-\d{4}-\d{4}-[A-Z0-9]+-[A-Z0-9]+$/;
  return pattern.test(key);
}