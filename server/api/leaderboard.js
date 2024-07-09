import { Client, Databases, ID } from 'node-appwrite'

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

  if (method === 'POST') {
    const body = await readBody(event)
    console.log('POST | Appwrite leaderboard API called with body:', body)
    const { username, time, mode } = body
    try {
      const response = await databases.createDocument(databaseId, collectionId, ID.unique(), { username, time, mode })
      console.log('POST | Appwrite leaderboard API created document with response:', response)
      return response
    } catch (error) {
      console.error('Error creating document:', error)
      return { error: error.message }
    }
  } else if (method === 'GET') {
    try {
      const response = await databases.listDocuments(databaseId, collectionId)
      console.log('GET | Appwrite leaderboard API called with response:', response)
      return response.documents
    } catch (error) {
      console.error('Error fetching documents:', error)
      return { error: error.message }
    }
  } else {
    return { error: 'Method not allowed' }
  }
})
