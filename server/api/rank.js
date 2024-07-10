import { Client, Databases, ID, Query } from 'node-appwrite'

const client = new Client()
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
  .setKey(process.env.APPWRITE_API_KEY) // Your API key

const databases = new Databases(client)

const databaseId = process.env.APPWRITE_DATABASE_ID // Replace with your database ID
const collectionId = process.env.APPWRITE_COLLECTION_LEADERBOARD_ID // Replace with your collection ID

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  const url = event.node.req.url

  if (method === 'GET') {
    const { username, mode } = getQuery(event)
    try {
      const response = await databases.listDocuments(databaseId, collectionId, [Query.equal('mode', mode), Query.orderAsc('time'), Query.limit(350)])
      const rank = response.documents.findIndex((entry) => entry.username === username) + 1
      return { rank }
    } catch (error) {
      console.error('Error fetching rank:', error)
      return { error: error.message }
    }
  } else {
    return { error: 'Method not allowed' }
  }
})
