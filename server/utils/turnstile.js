export async function verifyTurnstile(token, ip) {
    let formData = new FormData();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const result = await fetch(url, {
        body: formData,
        method: 'POST',
    });

    const outcome = await result.json();
    return outcome.success;
}

export function getIp(event) {
    const headers = getRequestHeaders(event);
    let ip = headers['x-forwarded-for']?.split(',').shift() || headers['x-real-ip'] || event.node.req.socket.remoteAddress;

    // Perform additional checks and sanitization if necessary
    if (ip && ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', ''); // Handle IPv4-mapped IPv6 addresses
    }

    return  ip;
}