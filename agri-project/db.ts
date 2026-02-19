import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Agri DB URI Missing');

const client = new MongoClient(uri);
let clientPromise = client.connect();

export default clientPromise;
