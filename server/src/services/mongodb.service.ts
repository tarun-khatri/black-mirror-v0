import { MongoClient, Db, Collection, Document } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export class MongoDBService {
    private static instance: MongoDBService;
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private readonly uri: string;
    private readonly dbName: string;

    private constructor() {
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        this.dbName = process.env.MONGODB_DB_NAME || 'competitor_analysis';
    }

    public static getInstance(): MongoDBService {
        if (!MongoDBService.instance) {
            MongoDBService.instance = new MongoDBService();
        }
        return MongoDBService.instance;
    }

    public async connect(): Promise<void> {
        try {
            if (!this.client) {
                this.client = await MongoClient.connect(this.uri);
                this.db = this.client.db(this.dbName);
                console.log('Successfully connected to MongoDB.');
            }
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.close();
                this.client = null;
                this.db = null;
                console.log('Disconnected from MongoDB.');
            }
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    private async ensureConnection(): Promise<void> {
        if (!this.client || !this.db) {
            await this.connect();
        }
    }

    private getCollection(collectionName: string): Collection {
        if (!this.db) {
            throw new Error('Database connection not established');
        }
        return this.db.collection(collectionName);
    }

    public async findOne(collectionName: string, query: Document): Promise<Document | null> {
        await this.ensureConnection();
        const collection = this.getCollection(collectionName);
        return await collection.findOne(query);
    }

    public async find(collectionName: string, query: Document): Promise<Document[]> {
        await this.ensureConnection();
        const collection = this.getCollection(collectionName);
        return await collection.find(query).toArray();
    }

    public async insertOne(collectionName: string, document: Document): Promise<Document> {
        await this.ensureConnection();
        const collection = this.getCollection(collectionName);
        const result = await collection.insertOne(document);
        return { ...document, _id: result.insertedId };
    }

    public async insertMany(collectionName: string, documents: Document[]): Promise<Document[]> {
        await this.ensureConnection();
        const collection = this.getCollection(collectionName);
        const result = await collection.insertMany(documents);
        return documents.map((doc, index) => ({ ...doc, _id: result.insertedIds[index] }));
    }

    public async updateOne(collectionName: string, query: Document, update: Document, options: any = {}): Promise<boolean> {
        await this.ensureConnection();
        const collection = this.getCollection(collectionName);
        const result = await collection.updateOne(query, { $set: update }, options);
        return result.modifiedCount > 0;
    }

    public async deleteOne(collectionName: string, query: Document): Promise<boolean> {
        await this.ensureConnection();
        const collection = this.getCollection(collectionName);
        const result = await collection.deleteOne(query);
        return result.deletedCount > 0;
    }

    public async deleteMany(collectionName: string, query: Document): Promise<number> {
        await this.ensureConnection();
        const collection = this.getCollection(collectionName);
        const result = await collection.deleteMany(query);
        return result.deletedCount;
    }
}

export default MongoDBService; 