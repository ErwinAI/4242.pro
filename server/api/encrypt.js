import { encrypt } from '../utils/cryptoUtils';

export default defineEventHandler(async (event) => {
    const { code } = await readBody(event);

    const { secretShareKey } = useRuntimeConfig(event)

    // TODO: validate that code is an object (try to parse) and has fields score and name
    //   but whatever if someone shares a modified code it's their problem lol

    if (code) {
        try {
            const encryptedCode = encrypt(code, secretShareKey);

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
