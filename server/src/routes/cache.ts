import express from 'express';
import { getDatabase } from '../config/database';
import { fetchLinkedInData, fetchTwitterData, fetchTelegramData, fetchMediumData, fetchOnchainData, SocialMediaData } from '../api/socialMedia';
import MongoDBService from '../services/mongodb.service';
import { OnchainMetrics } from '../types';
import { ObjectId } from 'mongodb';

const router = express.Router();
const mongoService = MongoDBService.getInstance();

// Get all companies
router.get('/companies', async (req, res) => {
    try {
        const companies = await mongoService.find('companies', {});
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get companies' });
    }
});

// Add a new company
router.post('/companies', async (req, res) => {
    try {
        const company = req.body;
        await mongoService.insertOne('companies', {
            ...company,
            createdAt: Date.now()
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add company' });
    }
});

// Update a company
router.put('/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const company = req.body;
        
        // Convert string ID to MongoDB ObjectId
        const objectId = new ObjectId(id);
        
        // Remove _id from the update data as it's immutable
        const { _id, ...updateData } = company;
        
        // Update the company in MongoDB
        const result = await mongoService.updateOne(
            'companies',
            { _id: objectId },
            { 
                ...updateData,
                updatedAt: Date.now()
            }
        );

        if (!result) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Return the updated company
        const updatedCompany = await mongoService.findOne('companies', { _id: objectId });
        res.json(updatedCompany);
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ error: 'Failed to update company' });
    }
});

// Get cached data
router.get('/:companyName/:platform/:identifier', async (req, res) => {
  try {
    const { companyName, platform, identifier } = req.params;
    
    // Special handling for onchain data
    if (platform.toLowerCase() === 'onchain') {
      const cacheKey = `onchain:${identifier}`;
      const cachedData = await mongoService.findOne('cache', { key: cacheKey });
      
      if (cachedData && cachedData.expiresAt > Date.now()) {
        console.log(`[CACHE HIT] Returning cached onchain data for ${identifier}`);
        return res.json({
          success: true,
          data: {
            ...cachedData.data,
            _source: 'cache',
            _lastUpdated: new Date(cachedData.lastUpdated || Date.now()).toISOString()
          }
        });
      }
      
      // If no cache or expired, fetch fresh data
      console.log(`[CACHE MISS] Fetching fresh onchain data for ${identifier}`);
      const freshData = await fetchOnchainData(identifier, companyName);
      
      if (freshData) {
        // Store in cache
        const now = Date.now();
        await mongoService.updateOne(
          'cache',
          { key: cacheKey },
          { 
            key: cacheKey,
            data: freshData,
            lastUpdated: now,
            expiresAt: now + 6 * 60 * 60 * 1000 // 6 hours
          },
          { upsert: true }
        );
        
        return res.json({
          success: true,
          data: {
            ...freshData,
            _source: 'api',
            _lastUpdated: new Date(now).toISOString()
          }
        });
      }
    }
    
    // For other platforms
    const cacheKey = `${companyName}:${platform}:${identifier}`;
    const cachedData = await mongoService.findOne('cache', { key: cacheKey });
    
    if (cachedData && cachedData.expiresAt > Date.now()) {
      return res.json({
        success: true,
        data: {
          ...cachedData.data,
          _source: 'cache',
          _lastUpdated: new Date(cachedData.lastUpdated || Date.now()).toISOString()
        }
      });
    }
    
    return res.status(404).json({ 
      success: false,
      error: 'Cache miss' 
    });
  } catch (error) {
    console.error('Cache retrieval error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve cached data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refresh cache
router.post('/:companyName/:platform/:identifier/refresh', async (req, res) => {
  try {
    const { companyName, platform, identifier } = req.params;
    const { force = false } = req.body;
    console.log(`Cache refresh requested for ${companyName}/${platform}/${identifier}${force ? ' (force refresh)' : ''}`);

    let data;
    switch (platform.toLowerCase()) {
      case 'onchain':
        console.log('Fetching fresh onchain data');
        data = await fetchOnchainData(identifier, companyName, force);
        break;
      case 'linkedin':
        console.log('Fetching fresh LinkedIn data');
        data = await fetchLinkedInData(identifier, companyName, force);
        break;
      case 'twitter':
        console.log('Fetching fresh Twitter data');
        data = await fetchTwitterData(identifier, companyName, force);
        break;
      case 'telegram':
        console.log('Fetching fresh Telegram data');
        data = await fetchTelegramData(identifier, companyName);
        break;
      case 'medium':
        console.log('Fetching fresh Medium data');
        data = await fetchMediumData(identifier, companyName, force);
        break;
      default:
        console.error(`Unknown platform: ${platform}`);
        return res.status(400).json({ error: 'Invalid platform' });
    }

    if (!data) {
      console.error('No data returned from fetch function');
      return res.status(500).json({ error: 'Failed to fetch data' });
    }

    console.log('Successfully fetched fresh data, updating cache');
    const cacheKey = `${platform.toLowerCase()}:${identifier}`;
    
    await mongoService.updateOne(
      'cache',
      { key: cacheKey },
      { 
        key: cacheKey,
        data,
        lastUpdated: Date.now(),
        expiresAt: Date.now() + 6 * 60 * 60 * 1000 // 6 hours
      },
      { upsert: true }
    );

    console.log('Cache updated successfully');
    res.json(data);
  } catch (error) {
    console.error('Error in cache refresh:', error);
    if (error && typeof error === 'object' && 'message' in error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.post('/refresh', async (req, res) => {
  const { companyId, platform } = req.body;
  
  if (!companyId || !platform) {
    return res.status(400).json({ error: 'Missing required parameters: companyId and platform' });
  }

  try {
    console.log(`Refreshing cache for company ${companyId}, platform ${platform}`);
    
    // Get company details from MongoDB
    const company = await mongoService.findOne('companies', { _id: companyId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    let data;
    if (platform === 'onchain') {
      if (!company.defillama) {
        return res.status(400).json({ error: 'No DeFi Llama identifier found for this company' });
      }
      data = await fetchOnchainData(company.defillama, company.name);
    } else {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    if (!data) {
      return res.status(500).json({ error: 'Failed to fetch data' });
    }

    // Update cache in MongoDB
    const updateResult = await mongoService.updateOne(
      'companies',
      { _id: companyId },
      { [`${platform}Data`]: data }
    );

    if (!updateResult) {
      return res.status(500).json({ error: 'Failed to update cache' });
    }

    console.log(`Successfully refreshed cache for ${companyId}, ${platform}`);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cached onchain metrics
router.get('/onchain/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Get company details from MongoDB
    const company = await mongoService.findOne('companies', { _id: companyId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if we have cached data
    const cachedData = await mongoService.findOne('onchainMetrics', { companyId });
    if (cachedData && cachedData.expiresAt > Date.now()) {
      return res.json(cachedData.data);
    }

    return res.status(404).json({ error: 'Cache miss' });
  } catch (error) {
    console.error('Cache retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve cached data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refresh onchain metrics
router.post('/:companyName/onchain/:identifier/refresh', async (req, res) => {
  try {
    const { companyName, identifier } = req.params;
    console.log(`Refreshing onchain metrics for ${companyName} with identifier ${identifier}`);
    
    // Fetch fresh data from DeFi Llama
    const data = await fetchOnchainData(identifier, companyName);
    if (!data) {
      return res.status(500).json({ error: 'Failed to fetch data from DeFi Llama' });
    }

    // Return the transformed data directly - it's already being cached in fetchOnchainData
    console.log(`Successfully refreshed onchain metrics for ${companyName}`);
    res.json(data);
  } catch (error) {
    console.error('Error refreshing onchain metrics:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cached onchain data for a specific company
router.get('/onchain/:companyName/:identifier', async (req, res) => {
  try {
    const { companyName, identifier } = req.params;
    const cacheKey = `onchain:${identifier}`;
    
    // Get cached data from MongoDB
    const cachedData = await mongoService.findOne('cache', { key: cacheKey });
    
    if (cachedData && cachedData.expiresAt > Date.now()) {
      console.log(`[CACHE HIT] Returning cached data for ${identifier}`);
      return res.json({
        success: true,
        data: {
          ...cachedData.data,
          _source: 'cache',
          _lastUpdated: new Date(cachedData.expiresAt - 6 * 60 * 60 * 1000).toISOString()
        }
      });
    }
    
    // If no cache or expired, fetch fresh data
    console.log(`[CACHE MISS] No valid cache for ${identifier}, fetching fresh data`);
    const freshData = await fetchOnchainData(identifier, companyName);
    
    if (!freshData) {
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch onchain data'
      });
    }
    
    res.json({
      success: true,
      data: freshData
    });
  } catch (error) {
    console.error('Error getting cached onchain data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve onchain data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:companyName/onchain/:identifier', async (req, res) => {
  try {
    const { companyName, identifier } = req.params;
    const forceRefresh = req.query.forceRefresh === 'true';
    
    console.log(`[Onchain Route] Fetching data for ${identifier} (${companyName}), forceRefresh: ${forceRefresh}`);
    
    const data = await fetchOnchainData(identifier, companyName, forceRefresh);
    console.log('[Onchain Route] Data fetched:', {
      success: data.success,
      totalDailyFees: data.totalDailyFees,
      weeklyFees: data.weeklyFees,
      totalAllTime: data.totalAllTime,
      change_1d: data.change_1d
    });
    
    res.json(data);
  } catch (error) {
    console.error('[Onchain Route] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch onchain data' 
    });
  }
});

// Get cached LinkedIn data
router.get('/:companyName/linkedin/:identifier', async (req, res) => {
  try {
    const { companyName, identifier } = req.params;
    const cacheKey = `${companyName}:linkedin:${identifier}`;
    console.log(`[LinkedIn Route] Checking cache for key: ${cacheKey}`);
    
    const cachedData = await mongoService.findOne('cache', { key: cacheKey });

    if (cachedData && cachedData.expiresAt > Date.now()) {
      console.log(`[CACHE HIT] Returning cached LinkedIn data for ${identifier}`);
      return res.json({
        success: true,
        data: {
          ...cachedData.data,
          _source: 'cache',
          _lastUpdated: new Date(cachedData.lastUpdated || Date.now()).toISOString()
        }
      });
    }

    // If no cache or expired, fetch fresh data
    console.log(`[CACHE MISS] Fetching fresh LinkedIn data for ${identifier}`);
    const { fetchLinkedInData } = await import('../services/linkedin.service');
    const freshData = await fetchLinkedInData(identifier, companyName);

    if (freshData) {
      // Store in cache
      const now = Date.now();
      await mongoService.updateOne(
        'cache',
        { key: cacheKey },
        {
          key: cacheKey,
          data: freshData,
          lastUpdated: now,
          expiresAt: now + 12 * 60 * 60 * 1000 // 12 hours
        },
        { upsert: true }
      );
      console.log(`[CACHE] Successfully cached LinkedIn data for ${identifier}`);
      return res.json({
        success: true,
        data: {
          ...freshData,
          _source: 'api',
          _lastUpdated: new Date(now).toISOString()
        }
      });
    }
    console.log(`[LinkedIn Route] No data returned for ${identifier}`);
    return res.status(404).json({ success: false, error: 'LinkedIn data not found' });
  } catch (error) {
    console.error('[LinkedIn Route] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch LinkedIn data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 