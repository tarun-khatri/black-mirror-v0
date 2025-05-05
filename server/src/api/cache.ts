import express from 'express';
import CacheService from '../services/cache.service';

const router = express.Router();
const cacheService = CacheService.getInstance();

// Get all companies
router.get('/companies', async (req, res) => {
    try {
        const companies = await cacheService.mongoDBService.find('companies', {});
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get companies' });
    }
});

// Add a new company
router.post('/companies', async (req, res) => {
    try {
        const company = req.body;
        await cacheService.mongoDBService.insertOne('companies', {
            ...company,
            createdAt: Date.now()
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add company' });
    }
});

// Get all social media data for a company
router.get('/company/:companyName', async (req, res) => {
    try {
        const { companyName } = req.params;
        const data = await cacheService.getCompanyData(companyName);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get company data' });
    }
});

// Get cached data for a specific social media platform
router.get('/:companyName/:platform/:identifier', async (req, res) => {
    try {
        const { companyName, platform, identifier } = req.params;
        const data = await cacheService.getCachedData(companyName, platform, identifier);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get cached data' });
    }
});

// Refresh cached data for a specific social media platform
router.post('/:companyName/:platform/:identifier/refresh', async (req, res) => {
    try {
        const { companyName, platform, identifier } = req.params;
        const { fetchUrl } = req.body;
        
        const fetchData = async () => {
            const response = await fetch(fetchUrl);
            return await response.json();
        };

        await cacheService.refreshData(companyName, platform, identifier, fetchData);
        const data = await cacheService.getCachedData(companyName, platform, identifier);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to refresh cached data' });
    }
});

// Update cache and start refresh interval
router.post('/:companyName/:platform/:identifier', async (req, res) => {
  try {
    const { companyName, platform, identifier } = req.params;
    const { data, fetchFunction } = req.body;
    
    if (fetchFunction) {
      // Start refresh interval with the provided fetch function
      await cacheService.refreshData(companyName, platform, identifier, fetchFunction);
    } else {
      // Just update the cache without refresh interval
      await cacheService.setCachedData(companyName, platform, identifier, data);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating cache:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stop refresh interval
router.delete('/:companyName/:platform/:identifier', async (req, res) => {
  try {
    const { companyName, platform, identifier } = req.params;
    cacheService.clearRefreshInterval(companyName, platform, identifier);
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing refresh interval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 