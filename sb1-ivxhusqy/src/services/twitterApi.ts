import { TwitterData, SocialProfile, FollowerStats, ContentAnalysis, Post } from '../types/index';
import { fetchSocialMediaDataWithCache } from './socialMediaApi';

export async function fetchTwitterData(identifier: string, companyName: string): Promise<TwitterData | null> {
  if (!identifier) {
    console.warn('No Twitter identifier provided');
    return null;
  }

  try {
    const data = await fetchSocialMediaDataWithCache('Twitter', identifier, companyName);
    
    if (!data) {
      console.warn('Twitter API returned no data');
      return null;
    }

    // Transform the unified data format to Twitter-specific format
    return {
      profile: {
        success: true,
        data: {
          name: data.profile.name || '',
          username: data.profile.username || '',
          description: data.profile.bio || '',
          followers: data.followerStats.totalFollowers || 0,
          following: 0, // This would need to come from a different API
          tweets: data.profile.postCount || 0
        }
      },
      tweets: {
        success: true,
        data: {
          tweets: [], // We would need to fetch tweets separately
          totalTweets: data.profile.postCount || 0
        }
      },
      followerStats: {
        totalFollowers: data.followerStats.totalFollowers || 0,
        oneDayChange: typeof data.followerStats.oneDayChange === 'number' 
          ? { count: data.followerStats.oneDayChange, percentage: 0 }
          : data.followerStats.oneDayChange || { count: 0, percentage: 0 },
        oneWeekChange: typeof data.followerStats.oneWeekChange === 'number'
          ? { count: data.followerStats.oneWeekChange, percentage: 0 }
          : data.followerStats.oneWeekChange || { count: 0, percentage: 0 }
      },
      contentAnalysis: {
        engagementRate: data.contentAnalysis.engagementRate || 0,
        metrics: {
          avgEngagementRate: data.contentAnalysis.metrics?.avgEngagementRate || 0,
          totalLikes: data.contentAnalysis.metrics?.totalLikes || 0,
          totalRetweets: data.contentAnalysis.metrics?.totalRetweets || 0,
          totalReplies: data.contentAnalysis.metrics?.totalReplies || 0,
          replies24h: data.contentAnalysis.metrics?.replies24h || 0,
          replies7d: data.contentAnalysis.metrics?.replies7d || 0,
          recentTweetsCount: data.contentAnalysis.metrics?.recentTweetsCount || 0,
          tweetFrequency7d: data.contentAnalysis.metrics?.tweetFrequency7d || 0,
          replyFrequency7d: data.contentAnalysis.metrics?.replyFrequency7d || 0
        }
      },
      posts: data.posts || [],
      _source: data._source,
      _lastUpdated: data._lastUpdated,
      summary: data.summary
    };
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    return null;
  }
}

export async function fetchTwitterMetrics(companyName: string, identifier: string): Promise<TwitterData | null> {
  return fetchTwitterData(identifier, companyName);
}