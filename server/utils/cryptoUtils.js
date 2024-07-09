import crypto from 'crypto';

const algorithm = 'aes-256-ctr';

// Helper function to convert Base64 to URL-safe Base64
const toUrlSafeBase64 = (base64) => base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// Helper function to convert URL-safe Base64 to Base64
const fromUrlSafeBase64 = (base64) => base64.replace(/-/g, '+').replace(/_/g, '/');

export const encrypt = (text, secretShareKey) => {
    const processedSecretKey = Buffer.from(secretShareKey, 'utf-8');

    const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, processedSecretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    // Combine iv and content into a single URL-safe Base64 string
    const combined = `${iv.toString('base64')}:${encrypted.toString('base64')}`;
    return toUrlSafeBase64(Buffer.from(combined).toString('base64'));
};

export const decrypt = (combined, secretShareKey) => {
    const processedSecretKey = Buffer.from(secretShareKey, 'utf-8');
    const decoded = Buffer.from(fromUrlSafeBase64(combined), 'base64').toString();
    const [iv, content] = decoded.split(':');
    const decipher = crypto.createDecipheriv(algorithm, processedSecretKey, Buffer.from(iv, 'base64'));

    const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'base64')), decipher.final()]);

    return decrypted.toString();
};
