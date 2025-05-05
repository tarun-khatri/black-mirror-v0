import { SocialProfile, FollowerStats, ContentAnalysis, Post, LinkedInData, TwitterData, MediumData, Company } from '../types/index';
import axios from 'axios';
import { fetchSocialMediaDataWithCache as fetchFromCache } from './apiCacheWrapper';
import api from './api';
import apiConfig from '../api/api';

const API_BASE_URL = 'http://localhost:3001/api'; // Update with your actual API URL

export type Platform = 'linkedIn' | 'Twitter' | 'Telegram' | 'Medium' | 'Onchain';

export interface SocialMediaData {
  success: boolean;
  error?: string;
  profile: SocialProfile;
  followerStats: FollowerStats;
  contentAnalysis: ContentAnalysis;
  posts: Post[];
  _source?: 'cache' | 'api';
  _lastUpdated?: string;
  summary?: string;
}

export async function fetchSocialMediaData(
  platform: Platform,
  identifier: string,
  companyName: string
): Promise<SocialMediaData | null> {
  if (!identifier) {
    console.warn(`No ${platform} identifier provided`);
    return null;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/social-media/${platform.toLowerCase()}/${identifier}`, {
      params: { companyName }
    });

    if (!response.data?.success) {
      console.warn(`${platform} API returned unsuccessful response:`, response.data);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${platform} data:`, error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    return null;
  }
}

export async function fetchSocialMediaDataWithCache(
  platform: Platform,
  identifier: string,
  companyName: string,
  forceRefresh = false
): Promise<SocialMediaData | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/social-media/${platform.toLowerCase()}/${identifier}`, {
      params: { 
        companyName,
        force: forceRefresh
      }
    });

    if (!response.data?.success) {
      console.warn(`${platform} API returned unsuccessful response:`, response.data);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${platform} data:`, error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    return null;
  }
}

// Helper function to fetch data for all platforms
export async function fetchAllSocialMediaData(
  identifiers: {
    linkedIn?: string;
    twitter?: string;
    telegram?: string;
    medium?: string;
    onchain?: string;
    defillama?: string;
  },
  companyName: string
): Promise<{
  linkedIn: SocialMediaData | null;
  twitter: SocialMediaData | null;
  telegram: SocialMediaData | null;
  medium: SocialMediaData | null;
  onchain: SocialMediaData | null;
}> {
  const promises = {
    linkedIn: identifiers.linkedIn
      ? fetchSocialMediaDataWithCache('linkedIn', identifiers.linkedIn, companyName)
      : Promise.resolve(null),
    twitter: identifiers.twitter
      ? fetchSocialMediaDataWithCache('Twitter', identifiers.twitter, companyName)
      : Promise.resolve(null),
    telegram: identifiers.telegram
      ? fetchSocialMediaDataWithCache('Telegram', identifiers.telegram, companyName)
      : Promise.resolve(null),
    medium: identifiers.medium
      ? fetchSocialMediaDataWithCache('Medium', identifiers.medium, companyName)
      : Promise.resolve(null),
    onchain: identifiers.defillama
      ? fetchSocialMediaDataWithCache('Onchain', identifiers.defillama, companyName)
      : Promise.resolve(null)
  };

  const [linkedIn, twitter, telegram, medium, onchain] = await Promise.all([
    promises.linkedIn,
    promises.twitter,
    promises.telegram,
    promises.medium,
    promises.onchain
  ]);

  return { linkedIn, twitter, telegram, medium, onchain };
} 