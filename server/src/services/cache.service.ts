import MongoDBService from './mongodb.service';
import { fetchOnchainData } from '../api/socialMedia';

export class CacheService {
    private static instance: CacheService;
    public mongoDBService: MongoDBService;
    private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();
    private readonly REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    private constructor() {
        this.mongoDBService = MongoDBService.getInstance();
        this.startAutoRefresh();
    }

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    private startAutoRefresh() {
        // Start auto-refresh for all companies with onchain data
        this.refreshAllOnchainData();
        // Set up interval to refresh every 6 hours
        setInterval(() => this.refreshAllOnchainData(), this.REFRESH_INTERVAL);
    }

    private async refreshAllOnchainData() {
        try {
            console.log('Starting auto-refresh of onchain data');
            const companies = await this.mongoDBService.find('companies', { 'socialMedia.onchain': { $exists: true } });
            
            for (const company of companies) {
                if (company.socialMedia?.onchain?.identifier) {
                    try {
                        await this.refreshOnchainData(company.name, company.socialMedia.onchain.identifier);
                    } catch (error) {
                        console.error(`Error refreshing onchain data for ${company.name}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error in auto-refresh:', error);
        }
    }

    public async refreshOnchainData(companyName: string, identifier: string): Promise<void> {
        try {
            console.log(`Refreshing onchain data for ${companyName} (${identifier})`);
            const data = await fetchOnchainData(identifier, companyName);
            
            if (data) {
                await this.setCachedData(companyName, 'onchain', identifier, {
                    ...data,
                    lastUpdated: Date.now(),
                    expiresAt: Date.now() + this.REFRESH_INTERVAL
                });
            }
        } catch (error) {
            console.error(`Error refreshing onchain data for ${companyName}:`, error);
            throw error;
        }
    }

    // Get cached data for a specific social media platform
    public async getCachedData(companyName: string, platform: string, identifier: string): Promise<any> {
        try {
            const cachedData = await this.mongoDBService.findOne('companies', { 
                name: companyName,
                [`socialMedia.${platform}.identifier`]: identifier
            });
            
            if (cachedData && cachedData.socialMedia && cachedData.socialMedia[platform]) {
                return cachedData.socialMedia[platform];
            }
            return null;
        } catch (error) {
            console.error(`Error getting cached data for ${companyName}/${platform}/${identifier}:`, error);
            throw error;
        }
    }

    // Set cached data for a specific social media platform
    public async setCachedData(companyName: string, platform: string, identifier: string, data: any): Promise<void> {
        try {
            // Check if company exists
            const company = await this.mongoDBService.findOne('companies', { name: companyName });
            
            if (company) {
                // Update existing company
                await this.mongoDBService.updateOne(
                    'companies',
                    { name: companyName },
                    {
                        socialMedia: {
                            ...company.socialMedia,
                            [platform]: {
                                identifier,
                                data,
                                lastUpdated: Date.now()
                            }
                        }
                    }
                );
            } else {
                // Create new company
                await this.mongoDBService.insertOne('companies', {
                    name: companyName,
                    socialMedia: {
                        [platform]: {
                            identifier,
                            data,
                            lastUpdated: Date.now()
                        }
                    },
                    createdAt: Date.now()
                });
            }
        } catch (error) {
            console.error(`Error setting cached data for ${companyName}/${platform}/${identifier}:`, error);
            throw error;
        }
    }

    // Refresh data for a specific social media platform
    public async refreshData(
        companyName: string,
        platform: string,
        identifier: string,
        fetchFunction: () => Promise<any>
    ): Promise<void> {
        try {
            // Clear existing interval if any
            this.clearRefreshInterval(companyName, platform, identifier);

            // Initial fetch
            const data = await fetchFunction();
            await this.setCachedData(companyName, platform, identifier, data);

            // Set up refresh interval
            const interval = setInterval(async () => {
                try {
                    const newData = await fetchFunction();
                    await this.setCachedData(companyName, platform, identifier, newData);
                } catch (error) {
                    console.error(`Error refreshing data for ${companyName}/${platform}/${identifier}:`, error);
                }
            }, this.REFRESH_INTERVAL);

            // Store the interval
            this.refreshIntervals.set(`${companyName}/${platform}/${identifier}`, interval);
        } catch (error) {
            console.error(`Error setting up refresh for ${companyName}/${platform}/${identifier}:`, error);
            throw error;
        }
    }

    // Get all social media data for a company
    public async getCompanyData(companyName: string): Promise<any> {
        try {
            const company = await this.mongoDBService.findOne('companies', { name: companyName });
            return company;
        } catch (error) {
            console.error(`Error getting company data for ${companyName}:`, error);
            throw error;
        }
    }

    // Clear refresh interval for a specific social media platform
    public clearRefreshInterval(companyName: string, platform: string, identifier: string): void {
        const intervalKey = `${companyName}/${platform}/${identifier}`;
        const interval = this.refreshIntervals.get(intervalKey);
        if (interval) {
            clearInterval(interval);
            this.refreshIntervals.delete(intervalKey);
        }
    }

    // Clear all refresh intervals
    public clearAllRefreshIntervals(): void {
        for (const interval of this.refreshIntervals.values()) {
            clearInterval(interval);
        }
        this.refreshIntervals.clear();
    }
}

export default CacheService; 