import axios from 'axios';
import { OnchainData } from '../types';
import { SocialMediaData, SocialProfile, FollowerStats, ContentAnalysis, Post } from '../types/index';
import { fetchSocialMediaDataWithCache } from './socialMediaApi';

const LLAMA_API_BASE_URL = 'https://api.llama.fi';

// Helper function to calculate percentage change
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const fetchOnchainMetrics = async (protocol: string): Promise<OnchainData> => {
  console.log(`Fetching onchain metrics for protocol: ${protocol}`);
  
  try {
    // Fetch protocol data and fees data
    console.log(`Making API calls to ${LLAMA_API_BASE_URL} for ${protocol}`);
    const [protocolResponse, feesResponse] = await Promise.all([
      axios.get(`${LLAMA_API_BASE_URL}/protocol/${protocol}`),
      axios.get(`${LLAMA_API_BASE_URL}/summary/fees/${protocol}`)
    ]);

    console.log('Protocol API response:', protocolResponse.status);
    console.log('Fees API response:', feesResponse.status);

    const protocolData = protocolResponse.data;
    const feesData = feesResponse.data;

    console.log('Protocol data:', protocolData.name);
    console.log('Fees data available:', !!feesData);

    // Get daily and weekly metrics from fees data
    const dailyFees = feesData.total24h || 0;
    const prevDailyFees = feesData.total48hto24h || 0;
    const weeklyFees = feesData.total7d || 0;

    console.log('Daily fees:', dailyFees);
    console.log('Previous daily fees:', prevDailyFees);
    console.log('Weekly fees:', weeklyFees);

    // Calculate growth rates based on fees
    const transactionGrowth24h = calculatePercentageChange(dailyFees, prevDailyFees);
    const transactionGrowth7d = calculatePercentageChange(weeklyFees / 7, prevDailyFees);

    // Calculate active wallets from fees data
    const activeWallets = feesData.uniqueAddresses24h || Math.floor(dailyFees / 100); // fallback estimation
    const prevActiveWallets = feesData.uniqueAddresses48hto24h || Math.floor(prevDailyFees / 100);
    const activeWalletsGrowth24h = calculatePercentageChange(activeWallets, prevActiveWallets);

    // Estimate transactions and average value from fees
    const transactions24h = feesData.transactions24h || Math.floor(dailyFees / 10);
    const averageTransactionValue = transactions24h > 0 ? dailyFees / transactions24h : 0;

    const result = {
      profile: {
        name: protocolData.name,
        description: protocolData.description,
        logo: protocolData.logo,
        website: protocolData.url
      },
      metrics: {
        totalTransactions: protocolData.totalFees || 0,
        transactionGrowth24h,
        transactionGrowth7d,
        activeWallets,
        activeWalletsGrowth24h,
        averageTransactionValue
      },
      recentActivity: {
        transactions24h,
        uniqueAddresses24h: activeWallets
      }
    };

    console.log('Returning onchain data:', result);
    return result;
  } catch (error) {
    console.error('Error fetching onchain metrics:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
    }
    throw error;
  }
};

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) {
    return '0';
  }
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatPercentage = (num: number | null | undefined): string => {
  if (num === null || num === undefined) {
    return '0%';
  }
  return num.toFixed(1) + '%';
};

/**
 * Fetches onchain data for a given address
 * @param address The blockchain address to fetch data for
 * @param companyName The name of the company (for display purposes)
 * @returns A promise that resolves to the onchain data
 */
export async function fetchOnchainData(address: string, companyName: string): Promise<SocialMediaData | null> {
  if (!address) {
    console.warn('No onchain address provided');
    return null;
  }

  try {
    // Use the unified API to fetch onchain data
    const data = await fetchSocialMediaDataWithCache('Onchain', address, companyName);
    
    if (!data) {
      console.warn('No onchain data returned from API');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching onchain data:', error);
    return null;
  }
}

/**
 * Fetches onchain metrics for a given address in the social media data format
 * @param address The blockchain address to fetch metrics for
 * @returns A promise that resolves to the onchain metrics
 */
export async function fetchOnchainDataForSocialMedia(address: string): Promise<SocialMediaData | null> {
  return fetchOnchainData(address, '');
} 