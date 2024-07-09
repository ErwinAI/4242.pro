import { decrypt } from '../utils/cryptoUtils';

export default defineEventHandler(async (event) => {
    const { code } = await readBody(event);

    if (code) {
        try {
            const decryptedCode = decrypt(code);

            // Check if the decrypted code is a legitimate object and contains the fields score and name
            let parsedData;
            try {
                parsedData = JSON.parse(decryptedCode);
            } catch (e) {
                return { error: 'Decrypted code is not a valid JSON object.' };
            }

            if (typeof parsedData !== 'object' || !parsedData.score || !parsedData.name) {
                return { error: 'Decrypted code does not contain required fields.' };
            }

            // send the decrypted code back
            return { decryptedCode: parsedData };
        } catch (error) {
            console.error('Decryption Error:', error);
            return { error: 'Decryption failed.' };
        }
    } else {
        return { error: 'No code provided.' };
    }
});
