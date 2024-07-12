import { Client, Databases, ID, Query } from 'node-appwrite'
import { verifyTurnstile, getIp } from '../utils/turnstile';

const client = new Client()
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
  .setKey(process.env.APPWRITE_API_KEY) // Your API key

const databases = new Databases(client)

const databaseId = process.env.APPWRITE_DATABASE_ID // Replace with your database ID
const leaderboardCollectionId = process.env.APPWRITE_COLLECTION_LEADERBOARD_ID // Replace with your collection ID
const sessionsCollectionId = process.env.APPWRITE_COLLECTION_SESSIONS_ID // Replace with your collection ID

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'POST') {
    const body = await readBody(event)
    console.log('POST | Appwrite leaderboard API called with body:')
    const { username, time, mode, turnstileToken } = body
    if (!await verifyTurnstile(turnstileToken, getIp(event))) {
      return { robot: 'y u no human' }
    }
    try {
      // Check if a document with the same username and mode exists
      const existingDocuments = await databases.listDocuments(databaseId, leaderboardCollectionId, [
        Query.equal('username', username),
        Query.equal('mode', mode),
      ])

      // check if score is zero or close to it and disqualify
      if (time < 0.2) {
        return { warning: 'NEIN', ...existingDocuments.documents[0] }
      }

      // check if time is reasonable for start and stop time and disqualify
      const cookies = parseCookies(event);
      const sessionId = cookies['session'];
      let session;

      try {
          session = await databases.getDocument(databaseId, sessionsCollectionId, sessionId)
      } catch(_) {
          console.log("cannot find session", sessionId);
          return { error: 'Invalid session' }
      }
      
      if (!isWithinReasonableTime(session, time)) {
          console.log("recorded time is not close to reported time", session, time);
          return { error: 'Cheater detected' }
      }

      if (existingDocuments.total > 0) {

        // check if time is faster or not
        if (existingDocuments.documents[0].time < time) {
          return { warning: 'Time is not faster than existing time', ...existingDocuments.documents[0]  }
        }

        // Update the existing document
        const documentId = existingDocuments.documents[0].$id
        const response = await databases.updateDocument(databaseId, leaderboardCollectionId, documentId, { time })
        console.log('POST | Appwrite leaderboard API updated document with response:')
        return response
      } else {
        // Create a new document
        const response = await databases.createDocument(databaseId, leaderboardCollectionId, ID.unique(), { username, time, mode })
        console.log('POST | Appwrite leaderboard API created document with response:')
        return response
      }
    } catch (error) {
      console.error('Error creating or updating document:', error)
      return { error: error.message }
    }
  } else if (method === 'GET') {
    try {
      const response = await databases.listDocuments(databaseId, leaderboardCollectionId, [Query.orderAsc('time'), Query.limit(120)])
      console.log('GET | Appwrite leaderboard API called with response:')
      return response.documents
    } catch (error) {
      console.error('Error fetching documents:', error)
      return { error: error.message }
    }
  } else {
    return { error: 'Method not allowed' }
  }
})

function isWithinReasonableTime(session, time) {
  if (!session || typeof session.start !== 'number' || typeof session.stop !== 'number') {
    return false;
  }
  const duration = (session.stop - session.start) / 1000;
  // time should be +/- 0.3 sec from duration (given network delays etc, we can tighten this later if needed)
  return time >= duration - 0.3 && time <= duration + 0.3;
}