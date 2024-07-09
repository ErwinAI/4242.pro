// server/api/encrypt.js
import { encrypt } from '../utils/cryptoUtils';

export default defineEventHandler(async (event) => {
    const { code } = await readBody(event);

    // const { data: response, error } = await useFetch(`/api/encrypt?code=${encodeURIComponent(JSON.stringify(data))}`);
    // TODO: validate that code is an object (try to parse) and has fields score and name

    if (code) {
        try {
            const encryptedCode = encrypt(code);

            // For now, just send the encrypted code back
            return { encryptedCode };
        } catch (error) {
            console.error('Encryption Error:', error);
            return { error: 'Encryption failed.' };
        }
    } else {
        return { error: 'No code provided.' };
    }
});
