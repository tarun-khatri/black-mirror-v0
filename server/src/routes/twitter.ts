import express from 'express';
import { fetchTwitterData } from '../api/socialMedia';
import MongoDBService from '../services/mongodb.service';
import { Request, Response } from 'express';


const router = express.Router();

router.get('/metrics/:companyName/:identifier', async (req: Request, res: Response) => {
  try {
    const { companyName, identifier } = req.params;
    const forceRefresh = req.query.forceRefresh === 'true';
    
    console.log(`[Twitter Route] Fetching data for ${identifier} (${companyName}), forceRefresh: ${forceRefresh}`);
    
    const data = await fetchTwitterData(identifier, companyName, forceRefresh);
    console.log('[Twitter Route] Data fetched:', {
      success: data.success,
      followerCount: data.profile.followersCount,
      postCount: data.profile.postCount,
      tweetsCount: data.posts.length,
      following: data.profile.following,
      favorites: data.profile.favorites,
      listedCount: data.profile.listedCount,
      engagementRate: data.contentAnalysis.engagementRate,
      totalLikes: data.contentAnalysis.metrics.totalLikes,
      totalShares: data.contentAnalysis.metrics.totalShares,
      totalReplies: data.contentAnalysis.metrics.totalReplies,
      totalFavorites: data.contentAnalysis.metrics.totalFavorites
    });
    
    res.json(data);
  } catch (error) {
    console.error('[Twitter Route] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch Twitter data' 
    });
  }
});

router.get('/history/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const mongoService = MongoDBService.getInstance();
    const historicalKey = `twitter_history:${identifier}`;
    
    const historicalData = await mongoService.findOne('cache', { key: historicalKey });
    
    if (!historicalData) {
      return res.json({ success: true, data: [] });
    }
    
    res.json({ 
      success: true, 
      data: historicalData.data.map((d: any) => ({
        ...d,
        date: new Date(d.timestamp).toISOString()
      }))
    });
  } catch (error) {
    console.error('[Twitter History] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch historical data' 
    });
  }
});

export default router; 