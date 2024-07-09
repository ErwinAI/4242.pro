// server/utils/cryptoUtils.js
import crypto from 'crypto';

// Use a hardcoded 32-byte key for development. Replace with a securely stored key in production.
const secretKey = Buffer.from('12345678901234567890123456789012', 'utf-8'); // 32-byte key
const algorithm = 'aes-256-ctr';

export const encrypt = (text) => {
    const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    // Combine iv and content into a single string
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (combined) => {
    const [iv, content] = combined.split(':');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));

    const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);

    return decrypted.toString();
};
