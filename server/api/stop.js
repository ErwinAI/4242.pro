import { Client, Databases } from 'node-appwrite'

const client = new Client()
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
  .setKey(process.env.APPWRITE_API_KEY) // Your API key

const databases = new Databases(client)

const databaseId = process.env.APPWRITE_DATABASE_ID // Replace with your database ID
const collectionId = process.env.APPWRITE_COLLECTION_SESSIONS_ID // Replace with your collection ID

export default defineEventHandler(async (event) => {
    const method = event.node.req.method;
  
    if (method !== 'POST') {
        return { error: 'Method not allowed' }
    }

    const cookies = parseCookies(event);
    const sessionId = cookies['session'];
    let session;

    try {
        session = await databases.getDocument(databaseId, collectionId, sessionId)
    } catch(_) {
        return { error: 'Invalid session' }
    }
    
    // check if session was started longer than 2 minutes ago
    if (!isWithinLastTwoMinutes(session.start)) {
        return { error: 'Session too old' }
    }

    await databases.updateDocument(databaseId, collectionId, sessionId, { stop: Date.now() });

    console.log('POST | Appwrite stop API ended session');
    event.res.statusCode = 200;
    return {};
});

function isWithinLastTwoMinutes(timestamp) {
    if (!timestamp || typeof timestamp !== 'number') {
        return false;
    }
    const now = Date.now();
    const twoMinutesAgo = now - 2 * 60 * 1000; // 2 minutes in milliseconds
  
    return timestamp >= twoMinutesAgo && timestamp <= now;
  }