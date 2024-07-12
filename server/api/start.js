import { Client, Databases, ID } from 'node-appwrite'

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

    const body = await readBody(event);
    const { mode } = body

    if (!['full', 'card'].includes(mode)) {
        return { error: 'Invalid mode' }
    }

    const id = ID.unique();
    await databases.createDocument(databaseId, collectionId, id, { start: Date.now(), mode: mode });
    console.log('POST | Appwrite start API created session');
    event.res.statusCode = 201;
    setResponseHeader(event, 'Set-Cookie', `session=${id}; Path=/; HttpOnly; SameSite=Strict`);
    return {};
});