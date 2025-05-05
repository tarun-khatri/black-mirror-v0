import axios from 'axios';
import { MONGODB_CONFIG } from '../config/mongodb.config';

interface CacheOptions {
  collectionName: string;
  expirationTime?: number;
  useStaleData?: boolean;
}

export class ApiCacheService {
  private static instance: ApiCacheService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = '/api/cache'; // This will be handled by your API proxy in vite.config.ts
  }

  public static getInstance(): ApiCacheService {
    if (!ApiCacheService.instance) {
      ApiCacheService.instance = new ApiCacheService();
    }
    return ApiCacheService.instance;
  }

  public async fetchLinkedInDataWithCache<T>(
    query: any,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    return this.withCache(query, fetchFn, {
      collectionName: MONGODB_CONFIG.COLLECTIONS.LINKEDIN,
      expirationTime: MONGODB_CONFIG.CACHE_EXPIRATION.LINKEDIN,
      useStaleData: true
    });
  }

  public async withCache<T>(
    query: any,
    fetchFn: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    try {
      const key = JSON.stringify(query);
      const response = await axios.get(`${this.baseUrl}/${options.collectionName}/${encodeURIComponent(key)}`);
      const cachedData = response.data;

      if (cachedData) {
        const now = Date.now();
        const isExpired = now - cachedData.timestamp > (options.expirationTime || 0);

        if (!isExpired) {
          console.log(`Cache hit for ${options.collectionName}`);
          return cachedData.data;
        }

        if (options.useStaleData) {
          console.log(`Using stale data for ${options.collectionName}`);
          return cachedData.data;
        }
      }

      console.log(`Cache miss for ${options.collectionName}`);
      const freshData = await fetchFn();
      
      await axios.post(
        `${this.baseUrl}/${options.collectionName}/${encodeURIComponent(key)}`,
        { data: freshData }
      );

      return freshData;
    } catch (error) {
      console.error(`Error in cache operation for ${options.collectionName}:`, error);
      // If cache fails, try to fetch fresh data
      return fetchFn();
    }
  }
}

export const apiCacheService = ApiCacheService.getInstance(); 