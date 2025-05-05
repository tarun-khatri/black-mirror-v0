import axios from 'axios';
import { MongoDBService } from './mongodb.service';
import { LinkedInData } from '../types/index';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'linkedin-data-api.p.rapidapi.com';
const mongoService = MongoDBService.getInstance();

if (!RAPIDAPI_KEY) {
  console.error('[LinkedIn Service] RAPIDAPI_KEY is not set in environment variables');
  throw new Error('RAPIDAPI_KEY is required for LinkedIn service');
}

const rapidApiHeaders = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST,
  'Content-Type': 'application/json',
};

// Helper function to transform data into frontend format
function transformToFrontendFormat(data: any): LinkedInData {
  // If already in frontend format, but with old keys, remap employeeDistribution
  if (data.companyProfile?.data) {
    const empDist = data.companyProfile.data.employeeDistribution || {};
    // Only remap if not already in byFunction/bySkill/byLocation
    if (!empDist.byFunction && (empDist.function || empDist.skill || empDist.location)) {
      const convertObjArr = (arr: any[]) =>
        Array.isArray(arr)
          ? arr.map(obj => {
              const key = Object.keys(obj)[0];
              return { name: key, count: obj[key] };
            })
          : [];
      data.companyProfile.data.employeeDistribution = {
        byFunction: convertObjArr(empDist.function),
        bySkill: convertObjArr(empDist.skill),
        byLocation: convertObjArr(empDist.location),
      };
    }
    return data;
  }

  // Helper to convert { "Engineering": 71 } to { name: "Engineering", count: 71 }
  const convertObjArr = (arr: any[]) =>
    Array.isArray(arr)
      ? arr.map(obj => {
          const key = Object.keys(obj)[0];
          return { name: key, count: obj[key] };
        })
      : [];

  // Map employeeDistribution fields
  const empDist = data.employeeDistribution || {};
  const employeeDistribution = {
    byFunction: convertObjArr(empDist.function),
    bySkill: convertObjArr(empDist.skill),
    byLocation: convertObjArr(empDist.location),
  };

  return {
    companyProfile: {
      success: true,
      data: {
        name: data.companyName || data.name || '',
        displayName: data.companyName || data.name || '',
        companyName: data.companyName || data.name || '',
        description: data.description || '',
        website: data.website || '',
        linkedinUrl: data.linkedinUrl || '',
        profileImage: data.logo || '',
        industry: data.industry || 'N/A',
        bio: data.description || '',
        followers: {
          totalFollowers: data.followerCount || 0
        },
        employeeCount: data.staffCount || 0,
        staffCount: data.staffCount || 0,
        staffCountRange: data.staffCountRange || 'N/A',
        metrics: {
          avgEngagementRate: data.engagementRate || 0
        },
        engagementRate: data.engagementRate || 0,
        fundingData: data.fundingData || {},
        employeeDistribution,
        growth: data.growth || {
          followers: [],
          engagement: [],
          posts: 0
        }
      }
    },
    posts: {
      success: true,
      data: {
        posts: data.recentPosts || [],
        totalPosts: data.recentPosts?.length || 0
      }
    }
  };
}

export async function fetchLinkedInData(username: string, companyName: string, forceRefresh = false) {
  try {
    const cacheKey = `linkedin:${username}`;
    const now = Date.now();
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = await mongoService.findOne('cache', { key: cacheKey });
      if (cachedData && cachedData.expiresAt > now) {
        const transformedData = transformToFrontendFormat(cachedData.data);
        // Calculate 24h change from followersHistory if present
        let followers24hChange = null;
        let followers24hPercent = null;
        let followersHistory: { count: number; timestamp: number }[] = [];
        if (cachedData && cachedData.data && Array.isArray((cachedData.data as any).followersHistory)) {
          followersHistory = (cachedData.data as any).followersHistory;
        }
        let currentFollowers = 0;
        const followersField = transformedData.companyProfile.data.followers;
        if (typeof followersField === 'number') {
          currentFollowers = followersField;
        } else if (followersField && typeof followersField.totalFollowers === 'number') {
          currentFollowers = followersField.totalFollowers;
        }
        if (followersHistory.length > 0) {
          const prev = followersHistory.slice().reverse().find((h: { count: number; timestamp: number }) => now - h.timestamp >= 24 * 60 * 60 * 1000);
          if (prev) {
            followers24hChange = currentFollowers - prev.count;
            followers24hPercent = prev.count ? ((followers24hChange / prev.count) * 100) : null;
          }
        }
        return {
          ...transformedData,
          followers24hChange,
          followers24hPercent,
          _source: 'cache',
          _lastUpdated: new Date(cachedData.lastUpdated || now).toISOString()
        };
      }
    }
    
    // 1. Get company details
    const detailsRes = await axios.get(
      'https://linkedin-data-api.p.rapidapi.com/get-company-details',
      { params: { username }, headers: rapidApiHeaders }
    );
    const details = (detailsRes.data as { data: any }).data;

    // 2. Get employee distribution
    const employeesRes = await axios.post(
      'https://linkedin-data-api.p.rapidapi.com/get-company-employees-count',
      { companyId: details.id, locations: [] },
      { headers: rapidApiHeaders }
    );
    const employees = (employeesRes.data as { data: any }).data;

    // 3. Get recent posts (limit to 20)
    const postsRes = await axios.get(
      'https://linkedin-data-api.p.rapidapi.com/get-company-posts',
      { params: { username, start: 0 }, headers: rapidApiHeaders }
    );
    const postsData: any = postsRes.data;
    console.log('[LinkedIn Service] postsRes.data:', JSON.stringify(postsData, null, 2));
    let posts: any[] = [];
    if (Array.isArray(postsData.data)) {
      posts = postsData.data.slice(0, 20);
    } else if (Array.isArray(postsData.posts)) {
      posts = postsData.posts.slice(0, 20);
    } else if (postsData.data && Array.isArray(postsData.data.posts)) {
      posts = postsData.data.posts.slice(0, 20);
    }

    // Calculate engagement rate for each post and overall
    let totalEngagement = 0;
    posts.forEach((post: any) => {
      const engagement = (post.likeCount || 0) + (post.commentsCount || 0) + (post.repostsCount || 0);
      post.engagement = engagement;
      totalEngagement += engagement;
    });
    const engagementRate = details.followerCount ? (totalEngagement / posts.length) / details.followerCount * 100 : 0;

    // Prepare employee distribution
    const employeeDistribution = {
      function: employees.byGroup?.['Current Function'] || [],
      skill: employees.byGroup?.['Skill Explicit'] || [],
      location: employees.byGroup?.['Locations'] || [],
      rawData: employees // Store raw data for future use
    };

    // Funding data
    const funding = details.fundingData || null;

    // Growth/Change over time
    const growth = {
      followers: [details.followerCount],
      engagement: [engagementRate],
      posts: posts.length
    };

    const result = {
      // Company basic info
      companyId: details.id,
      companyName: details.name,
      linkedinUrl: details.linkedinUrl,
      logo: details.Images?.logo,
      industry: details.industries,
      description: details.description,
      website: details.website,
      
      // Company metrics
      followerCount: details.followerCount,
      staffCount: details.staffCount,
      staffCountRange: details.staffCountRange,
      
      // Employee data
      employeeDistribution,
      
      // Funding data
      fundingData: funding,
      
      // Posts and engagement
      recentPosts: posts.map((post: any) => ({
        ...post,
        engagement: (post.likeCount || 0) + (post.commentsCount || 0) + (post.repostsCount || 0)
      })),
      engagementRate,
      totalEngagement,
      
      // Growth metrics
      growth,
      
      // Metadata
      lastUpdated: Date.now(),
      _source: 'api',
      _lastUpdated: new Date().toISOString(),
      expiresAt: Date.now() + 6 * 60 * 60 * 1000 // 6 hours
    };

    // Store follower history
    let followersHistory: { count: number; timestamp: number }[] = [];
    const cachedData = await mongoService.findOne('cache', { key: cacheKey });
    if (cachedData && cachedData.data && Array.isArray((cachedData.data as any).followersHistory)) {
      followersHistory = (cachedData.data as any).followersHistory;
    }
    followersHistory.push({ count: result.followerCount, timestamp: now });
    // Keep only last 30 days
    followersHistory = followersHistory.filter((h: { count: number; timestamp: number }) => now - h.timestamp <= 30 * 24 * 60 * 60 * 1000);
    (result as any).followersHistory = followersHistory;    // Calculate 24h change
    let followers24hChange = null;
    let followers24hPercent = null;
    const prev = followersHistory.slice().reverse().find((h: { count: number; timestamp: number }) => now - h.timestamp >= 24 * 60 * 60 * 1000);
    if (prev) {
      followers24hChange = result.followerCount - prev.count;
      followers24hPercent = prev.count ? ((followers24hChange / prev.count) * 100) : null;
    }
    // Cache the result
    await mongoService.updateOne(
      'cache',
      { key: cacheKey },
      { 
        key: cacheKey,
        data: result,
        lastUpdated: now,
        expiresAt: now + 6 * 60 * 60 * 1000 // 6 hours
      },
      { upsert: true }
    );
    const transformedData = transformToFrontendFormat(result);
    console.log('[LinkedIn Service] Transformed data posts:', JSON.stringify(transformedData.posts, null, 2));
    // Add followerStats to the returned object, similar to Twitter
    const followerStats = {
      totalFollowers: result.followerCount,
      oneDayChange: {
        count: followers24hChange || 0,
        percentage: followers24hPercent != null ? Number(followers24hPercent.toFixed(2)) : 0
      }
    };
    return {
      ...transformedData,
      followerStats,
      _source: 'api',
      _lastUpdated: new Date().toISOString()
    };
  } catch (error: unknown) {
    console.error(`[LinkedIn Service] Error fetching data for ${username}:`, error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { status?: number; statusText?: string; data?: any } };
      console.error('[LinkedIn Service] API Error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data
      });
    }
    throw error;
  }
} 