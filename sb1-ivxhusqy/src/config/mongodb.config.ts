/**
 * Client-side MongoDB Configuration
 * Only contains collection names and cache expiration times
 */
export const MONGODB_CONFIG = {
  COLLECTIONS: {
    LINKEDIN: 'linkedIn_data',
    COMPETITORS: 'competitors',
    ANALYSIS: 'analysis_results'
  },
  CACHE_EXPIRATION: {
    LINKEDIN: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    COMPETITORS: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
    ANALYSIS: 6 * 60 * 60 * 1000 // 6 hours in milliseconds
  }
};

// Cache Expiration Times (in milliseconds)
export const CACHE_EXPIRATION = {
  DEFAULT: 6 * 60 * 60 * 1000, // 6 hours
  LINKEDIN: 6 * 60 * 60 * 1000, // 6 hours
  TWITTER: 6 * 60 * 60 * 1000, // 6 hours
  MEDIUM: 6 * 60 * 60 * 1000, // 6 hours
  ONCHAIN: 6 * 60 * 60 * 1000, // 6 hours
  GITHUB: 6 * 60 * 60 * 1000, // 6 hours
};

// MongoDB Collections
export const COLLECTIONS = {
  LINKEDIN: 'linkedIn_data',
  TWITTER: 'twitter_data',
  MEDIUM: 'medium_data',
  ONCHAIN: 'onchain_data',
  GITHUB: 'github_data',
  CACHE_STATUS: 'cache_status',
};

// Cache Status Types
export const CACHE_STATUS = {
  FRESH: 'fresh',
  STALE: 'stale',
  ERROR: 'error',
  PENDING: 'pending',
}; 