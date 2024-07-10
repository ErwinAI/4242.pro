import { Client, Databases, ID, Query } from 'node-appwrite'

const client = new Client()
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)

const databaseId = process.env.APPWRITE_DATABASE_ID
const collectionId = process.env.APPWRITE_COLLECTION_LEADERBOARD_ID

export default defineEventHandler(async (event) => {
    const method = event.node.req.method

    if (method === 'GET') {
        const { code } = getQuery(event)

        try {
            const response = await databases.getDocument(databaseId, collectionId, code)
            const rank = response ? response.rank : null // Adjust according to your document structure
            return { rank }
        } catch (error) {
            console.error('Error fetching rank:', error)
            return { error: error.message }
        }
    } else {
        return { error: 'Method not allowed' }
    }
})
