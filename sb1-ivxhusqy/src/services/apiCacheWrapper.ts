import apiConfig from '../api/api';
// import CacheService from '../../server/src/services/cache.service';

// Generic function to fetch social media data with cache
export async function fetchSocialMediaDataWithCache(
  platform: string,
  identifier: string,
  companyName: string
) {
  try {
    console.log(`Attempting to fetch ${platform} data for ${identifier} (${companyName})`);
    
    // Try to get cached data first
    const cacheResponse = await fetch(`${apiConfig.endpoints.cache}/${companyName}/${platform}/${identifier}`);
    if (cacheResponse.ok) {
      const cachedData = await cacheResponse.json();
      if (cachedData) {
        console.log(`Cache hit for ${platform} data`);
        return cachedData;
      }
    }

    console.log(`Cache miss for ${platform} data, refreshing...`);
    
    // If no cached data, fetch from API and cache it
    const refreshResponse = await fetch(`${apiConfig.endpoints.cache}/${companyName}/${platform}/${identifier}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const responseData = await refreshResponse.json();
    
    if (!refreshResponse.ok) {
      console.error(`Failed to refresh ${platform} cache:`, responseData);
      throw new Error(`Failed to refresh ${platform} cache: ${responseData.details || responseData.error}`);
    }
    
    // Check if the response indicates an error
    if (responseData && responseData.success === false) {
      console.error(`${platform} API error:`, responseData.error);
      throw new Error(`${platform} API error: ${responseData.error}`);
    }

    console.log(`Successfully refreshed ${platform} cache`);
    return responseData;
  } catch (error) {
    console.error(`Error in fetch${platform}DataWithCache:`, error);
    throw error;
  }
}

// LinkedIn specific function
export async function fetchLinkedInDataWithCache(identifier: string, companyName: string) {
  return fetchSocialMediaDataWithCache('linkedin', identifier, companyName);
}

// Twitter specific function
export async function fetchTwitterDataWithCache(identifier: string, companyName: string) {
  return fetchSocialMediaDataWithCache('twitter', identifier, companyName);
}

// Telegram specific function
export async function fetchTelegramDataWithCache(identifier: string, companyName: string) {
  return fetchSocialMediaDataWithCache('telegram', identifier, companyName);
}

// Medium specific function
export async function fetchMediumDataWithCache(identifier: string, companyName: string) {
  return fetchSocialMediaDataWithCache('medium', identifier, companyName);
}

// Get all social media data for a company
export async function fetchCompanyData(companyName: string) {
  try {
    const response = await fetch(`${apiConfig.endpoints.cache}/companies/${companyName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }
} 