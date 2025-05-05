import express from 'express';
import { 
  fetchLinkedInData, 
  fetchTwitterData, 
  fetchTelegramData, 
  fetchMediumData,
  fetchOnchainData,
  Platform 
} from '../api/socialMedia';

const router = express.Router();

// Define valid platforms as a constant array
const VALID_PLATFORMS = ['linkedin', 'twitter', 'telegram', 'medium', 'onchain'] as const;

// Generic endpoint for fetching social media data
router.get('/:platform/:identifier', async (req, res) => {
  try {
    const { platform, identifier } = req.params;
    const { companyName } = req.query;

    if (!companyName || typeof companyName !== 'string') {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Check if the platform is valid
    if (!VALID_PLATFORMS.includes(platform as any)) {
      return res.status(400).json({ error: `Unsupported platform: ${platform}` });
    }

    let data;
    switch (platform) {
      case 'linkedin':
        data = await fetchLinkedInData(identifier, companyName);
        break;
      case 'twitter':
        data = await fetchTwitterData(identifier, companyName);
        break;
      case 'telegram':
        data = await fetchTelegramData(identifier, companyName);
        break;
      case 'medium':
        data = await fetchMediumData(identifier, companyName);
        break;
      case 'onchain':
        data = await fetchOnchainData(identifier, companyName);
        break;
      default:
        return res.status(400).json({ error: `Unsupported platform: ${platform}` });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.platform} data:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch ${req.params.platform} data`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 