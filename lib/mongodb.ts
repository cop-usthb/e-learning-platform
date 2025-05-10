import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

if (!process.env.MONGODB_DB) {
  throw new Error("Please add your MongoDB database name to .env.local")
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    console.log("Connecting to MongoDB...")
    console.log(`Database name: ${dbName}`)

    const client = new MongoClient(uri)
    await client.connect()
    console.log("MongoDB connection established")

    const db = client.db(dbName)
    console.log(`Connected to database: ${db.databaseName}`)

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}
