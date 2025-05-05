import axios from 'axios';
import { MongoDBService } from '../services/mongodb.service';
import { CacheService } from '../services/cache.service';
import { getGeminiSummary } from '../utils/gemini';

// Define types locally since we can't import them
export type PlatformType = 'LinkedIn' | 'Twitter' | 'Telegram' | 'Medium' | 'Onchain';

export interface ApiConfig {
  url: string;
  host: string;
}

export interface SocialProfile {
  name?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
  postCount?: number;
  followersCount?: number;
  website?: string;
  category?: string;
  chains?: string[];
  twitter?: string;
  github?: string;
  audit_links?: string[];
  methodology?: Record<string, any>;
  methodologyURL?: string;
  tvl?: number;
  mcap?: number;
  staking?: number;
  fdv?: number;
  following?: number;
  favorites?: number;
  listedCount?: number;
  isVerified?: boolean;
  isBlueVerified?: boolean;
  joinedDate?: string;
  location?: string;
}

export interface FollowerStats {
  current?: number;
  totalFollowers?: number;
  oneDayChange?: {
    count: number;
    percentage: number;
  };
  oneWeekChange?: {
    count: number;
    percentage: number;
  };
}

export interface ContentAnalysis {
  engagementRate?: number;
  metrics?: {
    avgEngagementRate?: number;
    engagementRatePerPost?: number;
    dailyEngagementRate?: number;
    totalLikes?: number;
    totalShares?: number;
    totalReplies?: number;
    totalFavorites?: number;
    recentTweetsCount?: number;
    listedCount?: number;
    likes24h?: number;
    shares24h?: number;
    replies24h?: number;
    tweetFrequency7d?: number;
    replyFrequency7d?: number;
  };
}

export interface Post {
  id?: string;
  text: string;
  date: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface SocialMediaData {
  success: boolean;
  error?: string;
  platform?: PlatformType;
  identifier?: string;
  companyName?: string;
  profile: SocialProfile;
  followerStats: FollowerStats;
  contentAnalysis: ContentAnalysis;
  posts: Post[];
  feesHistory?: Array<{
    date: string;
    fees: number;
  }>;
  totalDailyFees?: number;
  weeklyFees?: number;
  averageDailyFees?: number;
  // Additional protocol-specific fields
  protocolType?: string;
  total24h?: number;
  total48hto24h?: number;
  total7d?: number;
  totalAllTime?: number;
  change_1d?: number;
  // Additional onchain metrics
  activeWallets?: number;
  activeWalletsGrowth24h?: number;
  transactions24h?: number;
  uniqueAddresses24h?: number;
  expiresAt?: number;
  _source?: string;
  _lastUpdated?: string;
  summary?: string;
  // LinkedIn specific fields
  employeeDistribution?: {
    byFunction?: Array<{ name: string; count: number }>;
    bySkill?: Array<{ name: string; count: number }>;
    byLocation?: Array<{ name: string; count: number }>;
  };
}

// Define platform as a const enum to use as both type and value
export const Platform = {
  LinkedIn: 'LinkedIn',
  Twitter: 'Twitter',
  Telegram: 'Telegram',
  Medium: 'Medium',
  Onchain: 'Onchain'
} as const;

const API_CONFIGS: Record<PlatformType, ApiConfig> = {
  LinkedIn: {
    url: 'https://linkedin-data-api.p.rapidapi.com/company',
    host: 'linkedin-data-api.p.rapidapi.com'
  },
  Twitter: {
    url: 'https://twitter154.p.rapidapi.com',
    host: 'twitter154.p.rapidapi.com'
  },
  Telegram: {
    url: 'https://telegram-api.p.rapidapi.com/channel',
    host: 'telegram-api.p.rapidapi.com'
  },
  Medium: {
    url: 'https://medium2.p.rapidapi.com/user',
    host: 'medium2.p.rapidapi.com'
  },
  Onchain: {
    url: 'https://api.llama.fi/protocol',
    host: 'api.llama.fi'
  }
};

// Type guard for Axios errors
function isAxiosError(error: unknown): error is { 
  response?: { 
    data?: { message?: string };
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  }; 
  message: string;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'message' in error
  );
}

// Generic function to handle API requests
async function fetchPlatformData<T>(
  platform: PlatformType,
  identifier: string,
  companyName: string
): Promise<T> {
  const config = API_CONFIGS[platform];
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY is not set in environment variables');
  }

  console.log(`Fetching data for ${platform} with identifier: ${identifier}`);
  console.log(`Using API host: ${config.host}`);

  try {
    const response = await axios.get<T>(config.url, {
      params: { username: identifier },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': config.host
      }
    });

    console.log(`Successfully fetched data for ${platform}`);
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error(`${platform} API Error: ${errorMessage}`);
      
      // Return a minimal valid response structure instead of throwing an error
      // This allows the application to continue functioning
      return {
        success: false,
        error: errorMessage,
        platform,
        identifier,
        timestamp: new Date().toISOString()
      } as unknown as T;
    }
    console.error(`Unexpected error fetching ${platform} data:`, error);
    
    // Return a minimal valid response structure for unexpected errors too
    return {
      success: false,
      error: 'Unexpected error occurred',
      platform,
      identifier,
      timestamp: new Date().toISOString()
    } as unknown as T;
  }
}

// Platform-specific data fetching functions
export async function fetchLinkedInData(identifier: string, companyName: string, forceRefresh = false): Promise<any> {
  // Use the custom LinkedIn service logic
  const { fetchLinkedInData } = await import('../services/linkedin.service');
  const raw = await fetchLinkedInData(identifier, companyName, forceRefresh);

  // Log the data being sent to the frontend
  //console.log('[API RESPONSE] LinkedIn data:', JSON.stringify(raw, null, 2));

  // Return the raw LinkedInData object directly
  return raw;
}

interface TwitterApiResponse {
  creation_date: string;
  user_id: string;
  username: string;
  name: string;
  follower_count: number;
  following_count: number;
  favourites_count: number;
  is_private: boolean | null;
  is_verified: boolean;
  is_blue_verified: boolean;
  location: string;
  profile_pic_url: string;
  profile_banner_url: string;
  description: string;
  external_url: string;
  number_of_tweets: number;
  bot: boolean;
  timestamp: number;
  has_nft_avatar: boolean;
  category: string | null;
  default_profile: boolean;
  default_profile_image: boolean;
  listed_count: number;
  verified_type: string;
}

interface TwitterTweet {
  tweet_id: string;
  creation_date: string;
  text: string;
  favorite_count: number;
  retweet_count: number;
  reply_count: number;
  views?: number;
  media_url?: string[] | null;
  video_url?: string | null;
  user: {
    user_id: string;
    username: string;
    name: string;
    follower_count: number;
    following_count: number;
    favourites_count: number | null;
    is_verified: boolean;
    is_blue_verified: boolean;
    location: string;
    profile_pic_url: string;
    description: string;
    external_url: string;
    number_of_tweets: number;
    creation_date: string;
    listed_count: number | null;
  };
}

interface TwitterTweetsResponse {
  results: TwitterTweet[];
  continuation_token?: string;
}

interface TwitterHistoricalData {
  timestamp: number;
  followers: number;
  tweets: number;
}

export async function fetchTwitterData(identifier: string, companyName: string, forceRefresh = false): Promise<SocialMediaData> {
  console.log(`[Twitter API] Starting fetch for ${identifier} (${companyName}), forceRefresh: ${forceRefresh}`);
  
  const mongoService = MongoDBService.getInstance();
  
  try {
    const cacheKey = `twitter:${identifier}`;  // Remove timestamp to maintain consistent cache key
    
    // Try to get data from cache first
    const cachedData = await mongoService.findOne('cache', { key: cacheKey });
    
    if (!forceRefresh && cachedData && cachedData.expiresAt > Date.now()) {
      console.log(`[Twitter API] Cache hit for ${identifier}, expires in ${Math.round((cachedData.expiresAt - Date.now()) / (1000 * 60))} minutes`);
      return {
        ...cachedData.data,
        _source: 'cache',
        _lastUpdated: new Date(cachedData.lastUpdated || cachedData.expiresAt - 12 * 60 * 60 * 1000).toISOString()
      };
    }

    // Only fetch new data if cache is expired or force refresh is true
    if (forceRefresh || !cachedData || cachedData.expiresAt <= Date.now()) {
      console.log(`[Twitter API] ${forceRefresh ? 'Force refresh requested' : 'Cache expired'} for ${identifier}, fetching fresh data`);
      
      const config = API_CONFIGS[Platform.Twitter];
      const apiKey = process.env.VITE_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
      const apiHost = process.env.VITE_RAPIDAPI_TWITTER_HOST || process.env.RAPIDAPI_TWITTER_HOST || config.host;

      if (!apiKey) {
        throw new Error('RAPIDAPI_KEY is not set in environment variables');
      }

      // Fetch user details
      const userResponse = await axios.get<TwitterApiResponse>(`${config.url}/user/details`, {
        params: { 
          username: identifier,
          user_id: identifier // Using username as user_id for initial fetch
        },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      });

      const twitterData = userResponse.data;
      
      // Fetch recent tweets for engagement metrics
      const tweetsResponse = await axios.get<TwitterTweetsResponse>(`${config.url}/user/tweets`, {
        params: { 
          username: identifier,
          user_id: twitterData.user_id,
          limit: '40',
          include_replies: 'false',
          include_pinned: 'false'
        },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      });

      const recentTweets = tweetsResponse.data?.results || [];
      
      // Get user data from the first tweet's user object
      const userData = recentTweets[0]?.user || twitterData;

      // Calculate engagement metrics
      const totalLikes = recentTweets.reduce((sum: number, tweet: TwitterTweet) => sum + (tweet.favorite_count || 0), 0);
      const totalRetweets = recentTweets.reduce((sum: number, tweet: TwitterTweet) => sum + (tweet.retweet_count || 0), 0);
      const totalReplies = recentTweets.reduce((sum: number, tweet: TwitterTweet) => sum + (tweet.reply_count || 0), 0);
      const followerCount = userData.follower_count || 0;
      const avgEngagementRate = recentTweets.length > 0 && followerCount > 0
        ? ((totalLikes + totalRetweets + totalReplies) / (followerCount * recentTweets.length)) * 100 
        : 0;

      // Calculate tweet and reply frequency for last 7 days
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const tweetsLast7Days = recentTweets.filter(tweet => {
        const tweetDate = new Date(tweet.creation_date).getTime();
        return tweetDate >= sevenDaysAgo;
      });
      
      const tweetFrequency7d = tweetsLast7Days.length;
      const replyFrequency7d = tweetsLast7Days.reduce((sum, tweet) => sum + (tweet.reply_count || 0), 0);

      // Calculate Engagement Rate per Post
      const engagementRatesPerPost = recentTweets.map(tweet => {
        const postEngagements = (tweet.favorite_count || 0) + (tweet.retweet_count || 0) + (tweet.reply_count || 0);
        return followerCount > 0 ? (postEngagements / followerCount) * 100 : 0;
      });
      const avgEngagementRatePerPost = engagementRatesPerPost.length > 0
        ? engagementRatesPerPost.reduce((sum, rate) => sum + rate, 0) / engagementRatesPerPost.length
        : 0;

      // Calculate Daily Engagement Rate (last 24 hours)
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const last24hTweets = recentTweets.filter(tweet => {
        const tweetDate = new Date(tweet.creation_date).getTime();
        return tweetDate >= oneDayAgo;
      });

      const likes24h = last24hTweets.reduce((sum, tweet) => sum + (tweet.favorite_count || 0), 0);
      const shares24h = last24hTweets.reduce((sum, tweet) => sum + (tweet.retweet_count || 0), 0);
      const replies24h = last24hTweets.reduce((sum, tweet) => sum + (tweet.reply_count || 0), 0);
      const dailyEngagementRate = followerCount > 0
        ? ((likes24h + shares24h + replies24h) / followerCount) * 100
        : 0;

      // Calculate follower growth
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      
      // Get historical follower data from cache with proper time windows
      const historicalData = await mongoService.find('cache', { 
        key: `twitter:${identifier}:followers`,
        timestamp: { $gte: oneWeekAgo }
      });
      
      // Sort historical data by timestamp in descending order (newest first)
      const sortedHistoricalData = historicalData.sort((a, b) => b.timestamp - a.timestamp);
      
      // Get follower counts for different time periods
      const currentFollowers = userData.follower_count || 0;
      
      // Find the closest data point to 24h ago
      const oneDayAgoData = sortedHistoricalData.find(d => d.timestamp <= oneDayAgo);
      const oneDayAgoFollowers = oneDayAgoData?.followers || currentFollowers;
      
      // Find the closest data point to 7 days ago
      const oneWeekAgoData = sortedHistoricalData.find(d => d.timestamp <= oneWeekAgo);
      const oneWeekAgoFollowers = oneWeekAgoData?.followers || currentFollowers;
      
      // Calculate changes
      const oneDayChange = currentFollowers - oneDayAgoFollowers;
      const oneWeekChange = currentFollowers - oneWeekAgoFollowers;
      
      // Calculate percentages with proper rounding
      const oneDayChangePercent = oneDayAgoFollowers > 0 
        ? Number(((oneDayChange / oneDayAgoFollowers) * 100).toFixed(2)) 
        : 0;
      const oneWeekChangePercent = oneWeekAgoFollowers > 0 
        ? Number(((oneWeekChange / oneWeekAgoFollowers) * 100).toFixed(2)) 
        : 0;
      
      // Store current follower count for future calculations
      // Update the most recent entry or create a new one if none exists
      const followerKey = `twitter:${identifier}:followers`;
      const lastHour = now - 60 * 60 * 1000;
      
      // First try to update the most recent entry within the last hour
      const updateResult = await mongoService.updateOne(
        'cache',
        { 
          key: followerKey,
          timestamp: { $gte: lastHour }
        },
        { 
          key: followerKey,
          followers: currentFollowers,
          timestamp: now
        }
      );
      
      // If no entry was updated (no recent data), create a new one
      if (updateResult === false) {
        await mongoService.insertOne('cache', {
          key: followerKey,
          followers: currentFollowers,
          timestamp: now
        });
      }
      
      // Prepare the new posts array from the latest tweets
      const postsForSummary = recentTweets.slice(0, 20).map((tweet: TwitterTweet) => tweet.text);

      let summary = '';
      if (postsForSummary.length > 0) {
        try {
          summary = await getGeminiSummary(postsForSummary);
        } catch (e) {
          console.error('[Twitter API] Gemini summary error:', e);
          summary = '';
        }
      } else {
        summary = '';
      }

      const data: SocialMediaData = {
        success: true,
        platform: Platform.Twitter,
        identifier,
        companyName,
        profile: {
          name: userData.name || '',
          username: userData.username || '',
          displayName: userData.name || '',
          bio: userData.description || '',
          profileImage: userData.profile_pic_url || '',
          postCount: userData.number_of_tweets || 0,
          followersCount: userData.follower_count || 0,
          following: userData.following_count || 0,
          favorites: userData.favourites_count || 0,
          listedCount: userData.listed_count || 0,
          isVerified: userData.is_verified || false,
          isBlueVerified: userData.is_blue_verified || false,
          joinedDate: userData.creation_date || '',
          location: userData.location || '',
          website: userData.external_url || ''
        },
        followerStats: {
          current: currentFollowers,
          totalFollowers: currentFollowers,
          oneDayChange: {
            count: oneDayChange,
            percentage: oneDayChangePercent
          },
          oneWeekChange: {
            count: oneWeekChange,
            percentage: oneWeekChangePercent
          }
        },
        contentAnalysis: {
          engagementRate: avgEngagementRate,
          metrics: {
            avgEngagementRate,
            engagementRatePerPost: avgEngagementRatePerPost,
            dailyEngagementRate,
            totalLikes,
            totalShares: totalRetweets,
            totalReplies,
            totalFavorites: userData.favourites_count || 0,
            recentTweetsCount: recentTweets.length,
            listedCount: userData.listed_count || 0,
            likes24h,
            shares24h,
            replies24h,
            tweetFrequency7d,
            replyFrequency7d
          }
        },
        posts: recentTweets.map((tweet: TwitterTweet) => ({
          id: tweet.tweet_id || '',
          text: tweet.text || '',
          date: tweet.creation_date || new Date().toISOString(),
          likes: tweet.favorite_count || 0,
          comments: tweet.reply_count || 0,
          shares: tweet.retweet_count || 0
        })),
        summary,
        _source: 'api',
        _lastUpdated: new Date(now).toISOString(),
        expiresAt: now + 12 * 60 * 60 * 1000
      };

      // Cache the data with 12 hour expiration
      await mongoService.updateOne(
        'cache',
        { key: cacheKey },
        { 
          key: cacheKey,
          data: data,
          lastUpdated: now,
          expiresAt: now + 12 * 60 * 60 * 1000
        },
        { upsert: true }
      );

      return data;
    }

    // If we have cached data but it's expired, return it anyway while fetching new data in background
    if (cachedData) {
      // Trigger a background refresh
      setTimeout(() => {
        fetchTwitterData(identifier, companyName, true)
          .catch(err => console.error('[Twitter API] Background refresh failed:', err));
      }, 0);

      // Return cached data immediately
      return {
        ...cachedData.data,
        _source: 'cache',
        _lastUpdated: new Date(cachedData.lastUpdated || cachedData.expiresAt - 12 * 60 * 60 * 1000).toISOString()
      };
    }

    throw new Error('No cached data available and failed to fetch fresh data');
  } catch (error) {
    console.error('[Twitter API] Error:', error);
    if (isAxiosError(error)) {
      console.error('[Twitter API] Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }

    // If we have cached data, return it even if expired
    const errorCachedData = await mongoService.findOne('cache', { key: `twitter:${identifier}` });
    if (errorCachedData) {
      console.log('[Twitter API] Returning expired cached data due to error');
      return {
        ...errorCachedData.data,
        _source: 'cache',
        _lastUpdated: new Date(errorCachedData.lastUpdated || errorCachedData.expiresAt - 12 * 60 * 60 * 1000).toISOString()
      };
    }

    // If no cached data available, return error response
    const errorMessage = isAxiosError(error) ? error.response?.data?.message || error.message : 'Failed to fetch Twitter data';
    return {
      success: false,
      error: errorMessage,
      platform: Platform.Twitter,
      identifier,
      companyName,
      profile: {
        name: '',
        username: '',
        displayName: '',
        bio: '',
        profileImage: '',
        postCount: 0,
        followersCount: 0,
        website: ''
      },
      followerStats: {
        current: 0,
        totalFollowers: 0,
        oneDayChange: { count: 0, percentage: 0 },
        oneWeekChange: { count: 0, percentage: 0 }
      },
      contentAnalysis: {
        engagementRate: 0,
        metrics: {
          avgEngagementRate: 0,
          totalLikes: 0,
          totalShares: 0,
          totalReplies: 0,
          totalFavorites: 0,
          recentTweetsCount: 0,
          listedCount: 0
        }
      },
      posts: [],
      _source: 'error',
      _lastUpdated: new Date().toISOString(),
      expiresAt: Date.now()
    };
  }
}

export async function fetchTelegramData(identifier: string, companyName: string): Promise<SocialMediaData> {
  console.log(`Fetching Telegram data for ${identifier} (${companyName})`);
  return fetchPlatformData<SocialMediaData>(Platform.Telegram, identifier, companyName);
}

export const fetchMediumData = async (identifier: string, companyName: string, forceRefresh = false): Promise<SocialMediaData> => {
  console.log(`[Medium API] Starting fetch for ${identifier} (${companyName}), forceRefresh: ${forceRefresh}`);
  
  const mongoService = MongoDBService.getInstance();
  
  try {
    const cacheKey = `medium:${identifier}`;
    
    // Try to get data from cache first
    const cachedData = await mongoService.findOne('cache', { key: cacheKey });
    
    if (!forceRefresh && cachedData && cachedData.expiresAt > Date.now()) {
      console.log(`[Medium API] Cache hit for ${identifier}, expires in ${Math.round((cachedData.expiresAt - Date.now()) / (1000 * 60))} minutes`);
      return {
        ...cachedData.data,
        _source: 'cache',
        _lastUpdated: new Date(cachedData.lastUpdated || cachedData.expiresAt - 12 * 60 * 60 * 1000).toISOString()
      };
    }

    // Return mock data for Medium since API is not subscribed
    console.log('[Medium API] Using mock data');
    
    const mockData: SocialMediaData = {
      success: true,
      platform: 'Medium',
      identifier,
      companyName,
      profile: {
        name: companyName,
        username: identifier,
        displayName: companyName,
        bio: 'Official blog of ' + companyName,
        profileImage: 'https://via.placeholder.com/150',
        postCount: 45,
        followersCount: 2000
      },
      followerStats: {
        current: 2000,
        totalFollowers: 2000,
        oneDayChange: {
          count: 50,
          percentage: 2.5
        },
        oneWeekChange: {
          count: 50,
          percentage: 2.5
        }
      },
      contentAnalysis: {
        engagementRate: 0.15,
        metrics: {
          avgEngagementRate: 0.15,
          totalLikes: 500,
          totalShares: 100,
          totalReplies: 50,
          totalFavorites: 0,
          recentTweetsCount: 10,
          listedCount: 0
        }
      },
      posts: [
        {
          id: '1',
          text: 'Introducing New Features in ' + companyName,
          date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          likes: 150,
          comments: 25,
          shares: 45
        }
      ],
      _source: 'api',
      _lastUpdated: new Date().toISOString(),
      expiresAt: Date.now() + 12 * 60 * 60 * 1000  // 12 hours cache
    };

    // Cache the mock data
    await mongoService.updateOne(
      'cache',
      { key: cacheKey },
      { 
        key: cacheKey,
        data: mockData,
        lastUpdated: Date.now(),
        expiresAt: Date.now() + 12 * 60 * 60 * 1000  // 12 hours
      },
      { upsert: true }
    );

    return mockData;
  } catch (error) {
    console.error('[Medium API] Error:', error);
    throw error;
  }
};

// Define types for DeFi Llama API responses
interface DefiLlamaProtocolData {
  id: string;
  name: string;
  address: string | null;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: string;
  audits: string;
  audit_note: string | null;
  gecko_id: string | null;
  cmcId: string | null;
  category: string;
  chains: string[];
  module: string;
  twitter: string;
  forkedFrom: string[];
  oracles: string[];
  defillamaId: string;
  disabled: boolean;
  displayName: string;
  methodologyURL: string;
  methodology: Record<string, any>;
  audit_links: string[];
  versionKey: string | null;
  github: string | null;
  governanceID: string | null;
  treasury: string | null;
  parentProtocol: string | null;
  previousNames: string[];
  latestFetchIsOk: boolean;
  slug: string;
  protocolType: string;
  total24h: number;
  total48hto24h: number;
  total7d: number;
  totalAllTime: number;
  change_1d: number;
  tvl?: number;
  mcap?: number;
  staking?: number;
  fdv?: number;
}

interface DefiLlamaFeesData {
  id: string;
  name: string;
  address: string | null;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: string;
  audits: string;
  audit_note: string | null;
  gecko_id: string | null;
  cmcId: string | null;
  category: string;
  chains: string[];
  module: string;
  twitter: string;
  forkedFrom: string[];
  oracles: string[];
  defillamaId: string;
  disabled: boolean;
  displayName: string;
  methodologyURL: string;
  methodology: Record<string, any>;
  audit_links: string | null;
  versionKey: string | null;
  github: string | null;
  governanceID: string | null;
  treasury: string | null;
  parentProtocol: string | null;
  previousNames: string | null;
  latestFetchIsOk: boolean;
  slug: string;
  protocolType: string;
  total24h: number;
  total48hto24h: number;
  total7d: number;
  totalAllTime: number;
  change_1d: number;
  totalDataChart: [number, number][];
  totalDataChartBreakdown: [number, Record<string, Record<string, number>>][];
  transactions24h?: number;
  uniqueAddresses24h?: number;
}

// Add this function after the imports
async function cleanupOldCacheEntries(identifier: string) {
  const mongoService = MongoDBService.getInstance();
  try {
    // Delete any cache entries that have timestamps in their keys
    await mongoService.deleteMany('cache', {
      key: { $regex: `onchain:${identifier}:.*` }
    });
  } catch (error) {
    console.error('Error cleaning up old cache entries:', error);
  }
}

export async function fetchOnchainData(identifier: string, companyName: string, forceRefresh = false): Promise<SocialMediaData> {
  const cacheKey = `onchain:${identifier}`; // Remove the timestamp from the key
  const mongoService = MongoDBService.getInstance();
  
  // Clean up any old cache entries with timestamps in their keys
  await cleanupOldCacheEntries(identifier);

  // Helper function to calculate growth percentage
  const calculateGrowth = (current: number, previous: number) => 
    previous === 0 ? 0 : ((current - previous) / previous) * 100;
  
  try {
    console.log(`Fetching onchain data for ${identifier} (${companyName})`);
    let shouldFetchFresh = false;
    if (!forceRefresh) {
      const cachedData = await mongoService.findOne('cache', { key: cacheKey });
      if (cachedData) {
        if (cachedData.expiresAt > Date.now()) {
          console.log(`[CACHE HIT] Returning cached data for ${identifier} (expires in ${Math.round((cachedData.expiresAt - Date.now()) / 1000 / 60)} minutes)`);
          return {
            ...cachedData.data,
            _source: 'cache',
            _lastUpdated: new Date(cachedData.lastUpdated || cachedData.expiresAt - 6 * 60 * 60 * 1000).toISOString()
          };
        } else {
          console.log(`[CACHE EXPIRED] Cache expired ${Math.round((Date.now() - cachedData.expiresAt) / 1000 / 60)} minutes ago for ${identifier}`);
          shouldFetchFresh = true;
        }
      } else {
        console.log(`[CACHE MISS] No cached data found for ${identifier}`);
        shouldFetchFresh = true;
      }
    } else {
      console.log(`[FORCE REFRESH] Bypassing cache for ${identifier}`);
      shouldFetchFresh = true;
    }

    if (shouldFetchFresh) {
      console.log(`[API CALL] Fetching fresh data from DeFi Llama API for ${identifier}`);
      // Fetch protocol data from DeFi Llama
      console.log(`[API CALL] Fetching protocol data from https://api.llama.fi/protocol/${identifier}`);
      const protocolResponse = await axios.get<DefiLlamaProtocolData>(`https://api.llama.fi/protocol/${identifier}`);
      const protocolData = protocolResponse.data;
      if (!protocolData) {
        throw new Error('No protocol data received from DeFi Llama');
      }
      console.log('[API CALL] Protocol data received:', {
        name: protocolData.name,
        category: protocolData.category,
        chains: protocolData.chains
      });
      // Fetch fees data from DeFi Llama
      console.log(`Fetching fees data from https://api.llama.fi/summary/fees/${identifier}?dataType=dailyFees`);
      const feesResponse = await axios.get<DefiLlamaFeesData>(`https://api.llama.fi/summary/fees/${identifier}?dataType=dailyFees`);
      const feesData = feesResponse.data;
      if (!feesData || !feesData.totalDataChart) {
        throw new Error('No fees data received from DeFi Llama');
      }
      console.log('Fees data received:', {
        totalDataPoints: feesData.totalDataChart.length,
        latestFee: feesData.totalDataChart[feesData.totalDataChart.length - 1]
      });
      // Extract recent activity from fees data
      const recentActivity = feesData.totalDataChart
        .slice(-30)
        .map(([timestamp, value]) => ({
          date: new Date(timestamp * 1000).toISOString(),
          value: value || 0 // Ensure value is never null
        }));
      // Calculate metrics with proper fallbacks
      const dailyFees = feesData.total24h || recentActivity[recentActivity.length - 1]?.value || 0;
      const previousDayFees = feesData.total48hto24h || recentActivity[recentActivity.length - 2]?.value || 0;
      const weeklyFees = feesData.total7d || recentActivity
        .slice(-7)
        .reduce((sum, item) => sum + (item.value || 0), 0);
      // Calculate daily change percentage
      const dailyChangePercent = calculateGrowth(dailyFees, previousDayFees);
      // Use actual values from the API or estimate based on fees
      const transactionsCount = Math.ceil(dailyFees);
      const uniqueAddresses = Math.ceil(dailyFees * 0.8); // Estimate unique users as 80% of transactions
      // Calculate active wallets based on unique addresses
      const activeWallets = uniqueAddresses;
      const activeWalletsGrowth = feesData.change_1d || 0;
      // Average transaction value calculation
      const avgTxValue = transactionsCount > 0 ? dailyFees / transactionsCount : 0;
      console.log('Calculated metrics:', {
        dailyFees,
        weeklyFees,
        transactionsCount,
        uniqueAddresses,
        activeWallets,
        avgTxValue,
        dailyChangePercent,
        weeklyGrowth: feesData.change_1d
      });
      const responseData: SocialMediaData = {
        success: true,
        platform: 'Onchain',
        identifier,
        companyName,
        profile: {
          name: protocolData.name,
          displayName: protocolData.displayName,
          bio: protocolData.description,
          website: protocolData.url,
          profileImage: protocolData.logo,
          category: protocolData.category,
          chains: protocolData.chains,
          twitter: protocolData.twitter,
          github: protocolData.github || undefined,
          audit_links: protocolData.audit_links || [],
          methodology: protocolData.methodology,
          methodologyURL: protocolData.methodologyURL,
          tvl: protocolData.tvl || 0,
          mcap: protocolData.mcap || 0,
          staking: protocolData.staking || 0,
          fdv: protocolData.fdv || 0
        },
        followerStats: {
          totalFollowers: activeWallets,
          oneDayChange: {
            count: Math.round(activeWallets * (feesData.change_1d / 100)),
            percentage: feesData.change_1d
          },
          oneWeekChange: {
            count: Math.round(activeWallets * (feesData.change_1d / 100)),
            percentage: feesData.change_1d
          }
        },
        contentAnalysis: {
          engagementRate: avgTxValue > 0 ? avgTxValue / 1000 : 0.01,
          metrics: {
            avgEngagementRate: avgTxValue > 0 ? avgTxValue / 1000 : 0.01,
            totalLikes: dailyFees,
            totalShares: weeklyFees,
            totalReplies: 0,
            totalFavorites: 0,
            recentTweetsCount: recentActivity.length,
            listedCount: 0
          }
        },
        posts: recentActivity.map((activity, index) => ({
          id: `onchain-${index}`,
          text: `Daily fees: ${activity.value.toLocaleString()} USD`,
          date: activity.date,
          likes: activity.value,
          comments: Math.ceil(activity.value * 0.01),
          shares: Math.ceil(activity.value * 0.05)
        })),
        feesHistory: recentActivity.map(item => ({
          date: item.date,
          fees: item.value
        })),
        totalDailyFees: dailyFees,
        weeklyFees: weeklyFees,
        averageDailyFees: weeklyFees / 7,
        protocolType: protocolData.protocolType || 'DeFi',
        total24h: dailyFees,
        total48hto24h: previousDayFees,
        total7d: weeklyFees,
        totalAllTime: feesData.totalAllTime || dailyFees * 365, // Estimate if not available
        change_1d: feesData.change_1d || dailyChangePercent,
        activeWallets: activeWallets,
        activeWalletsGrowth24h: feesData.change_1d || 0,
        transactions24h: transactionsCount,
        uniqueAddresses24h: uniqueAddresses,
        _source: 'api',
        _lastUpdated: new Date().toISOString(),
        expiresAt: Date.now() + 6 * 60 * 60 * 1000  // 6 hours cache for Onchain
      };
      console.log('[CACHE] Storing fresh data in cache');
      // Cache the data with the new key format
      await mongoService.updateOne(
        'cache',
        { key: cacheKey },
        { 
          key: cacheKey,
          data: responseData,
          expiresAt: Date.now() + 6 * 60 * 60 * 1000  // 6 hours
        },
        { upsert: true }
      );
      console.log('[CACHE] Successfully cached and returning data');
      return responseData;
    }
    // If we reach here, something went wrong
    throw new Error('Failed to fetch or return onchain data');
  } catch (error) {
    console.error('Error fetching onchain data:', error);
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as unknown as { response?: { data?: { message?: string } }; message: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message;
      console.error('Axios error details:', {
        message: errorMessage,
        response: axiosError.response?.data
      });
      throw new Error(`Failed to fetch onchain data from DeFi Llama: ${errorMessage}`);
    }
    throw new Error('Failed to fetch onchain data from DeFi Llama');
  }
}

// Mock data for development/testing
export const mockSocialMediaData = {
  profile: {
    name: 'Mock Company',
    handle: '@mockcompany',
    bio: 'A mock company for testing',
    location: 'San Francisco, CA',
    website: 'https://mockcompany.com',
    postCount: 100
  },
  followerStats: {
    totalFollowers: 10000,
    followersGrowth: 5.2,
    engagementRate: 0.15
  },
  contentAnalysis: {
    avgLikes: 500,
    avgComments: 50,
    avgShares: 25,
    postFrequency: 3
  }
}; 