import { MongoClient, Db } from 'mongodb';

export class MongoDBService {
  private static instance: MongoDBService;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): MongoDBService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }

  private async connect() {
    if (!this.client) {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('competitor_analysis');
    }
  }

  public async findOne(collection: string, query: any) {
    await this.connect();
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection(collection).findOne(query);
  }

  public async find(collection: string, query: any) {
    await this.connect();
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection(collection).find(query).toArray();
  }

  public async updateOne(collection: string, filter: any, update: any, options: any = {}) {
    await this.connect();
    if (!this.db) throw new Error('Database not connected');
    const result = await this.db.collection(collection).updateOne(filter, { $set: update }, options);
    return result.modifiedCount > 0;
  }

  public async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
} 