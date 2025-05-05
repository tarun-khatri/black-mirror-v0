export * from './onchainApi';
export * from './twitterApi';
export * from './linkedInApi';
export * from './mediumApi';

/**
 * Fetches DefiLlama revenue data for a company
 * @param companyName The name of the company to fetch data for
 * @returns The DefiLlama data or null if the request fails
 */
export const fetchDefiLlamaData = async (companyName: string) => {
  try {
    const response = await fetch(`https://api.llama.fi/summary/fees/${companyName.toLowerCase()}?dataType=dailyRevenue`);
    if (!response.ok) {
      throw new Error('Failed to fetch DefiLlama data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching DefiLlama data:', error);
    return null;
  }
}; 