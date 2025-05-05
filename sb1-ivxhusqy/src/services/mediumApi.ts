import { MediumData, SocialProfile, FollowerStats, ContentAnalysis, Post, SocialMediaData } from '../types/index';
import { fetchSocialMediaDataWithCache } from './socialMediaApi';

// Mock data for Medium metrics
const mockMediumData: SocialMediaData = {
  success: true,
  profile: {
    name: 'Phantom Blog',
    username: 'phantom-blog',
    displayName: 'Phantom Blog',
    bio: 'Official blog of Phantom - The friendly crypto wallet',
    profileImage: 'https://via.placeholder.com/150',
    postCount: 45,
    followersCount: 2000
  },
  followerStats: {
    current: 2000,
    totalFollowers: 2000,
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
      recentTweetsCount: 10
    }
  },
  posts: [
    {
      id: '1',
      text: 'Introducing New Security Features in Phantom Wallet',
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      likes: 150,
      comments: 25,
      shares: 45
    }
  ]
};

export const fetchMediumData = async (identifier: string, companyName: string): Promise<SocialMediaData> => {
  if (!identifier) {
    throw new Error('Medium identifier is required');
  }

  try {
    // For now, return mock data since API is not subscribed
    console.log(`Using mock data for Medium (${identifier})`);
    return mockMediumData;
  } catch (error) {
    console.error('Error fetching Medium data:', error);
    throw error;
  }
};

export const fetchMediumMetrics = async (companyName: string): Promise<MediumData> => {
  try {
    const data = await fetchMediumData('phantom-blog', companyName);
    
    // Transform the unified data format to Medium-specific format
    return {
      profile: {
        success: data.success,
        data: {
          name: data.profile.name || '',
          username: data.profile.username || '',
          description: data.profile.bio || '',
          followers: data.followerStats.totalFollowers || 0,
          stories: data.profile.postCount || 0
        }
      },
      stories: {
        success: data.success,
        data: {
          stories: data.posts.map(post => ({
            id: post.id || '',
            title: post.text,
            date: post.date,
            url: post.url || '',
            likes: post.likes || 0,
            comments: post.comments || 0,
            reposts: post.shares || 0
          })),
          totalStories: data.profile.postCount || 0
        }
      }
    };
  } catch (error) {
    console.error('Error fetching Medium metrics:', error);
    throw error;
  }
};
