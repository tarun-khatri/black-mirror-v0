import express from 'express';
import { fetchOnchainData } from './socialMedia';
import { OnchainMetrics } from '../types';

const router = express.Router();

// Direct endpoint to fetch onchain metrics without MongoDB lookup
router.post('/onchain/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { companyName = 'Unknown Company' } = req.body;
    
    console.log(`Direct fetch onchain data for identifier: ${identifier}, company: ${companyName}`);
    
    if (!identifier) {
      return res.status(400).json({ error: 'No identifier provided' });
    }
    
    // Fetch data directly from DeFi Llama
    const data = await fetchOnchainData(identifier, companyName);
    
    if (!data) {
      return res.status(500).json({ error: 'Failed to fetch data from DeFi Llama' });
    }
    
    // Transform the data to match OnchainMetrics interface
    const onchainMetrics: OnchainMetrics = {
      metrics: {
        totalDailyFees: data.total24h || 0,
        weeklyFees: data.total7d || 0,
        averageDailyFees: data.total24h || 0,
        totalTransactions: data.transactions24h || 0,
        transactionGrowth24h: data.change_1d || 0,
        transactionGrowth7d: data.total7d && data.total24h ? 
          ((data.total7d - data.total24h) / data.total24h) * 100 : 0,
        activeWallets: data.activeWallets || 0,
        activeWalletsGrowth24h: data.activeWalletsGrowth24h || 0,
        averageTransactionValue: data.total24h && data.transactions24h ? 
          data.total24h / data.transactions24h : 0,
        feesHistory: data.feesHistory || []
      },
      recentActivity: {
        transactions24h: data.transactions24h || 0,
        uniqueAddresses24h: data.uniqueAddresses24h || 0
      },
      defiLlamaData: {
        total24h: data.total24h || 0,
        total7d: data.total7d || 0,
        totalAllTime: data.totalAllTime || 0,
        change_1d: data.change_1d || 0
      },
      chartData: data.feesHistory?.map(item => ({
        date: new Date(item.date),
        value: item.fees
      })) || [],
      profile: data.profile || {
        category: '',
        chains: [],
        twitter: '',
        github: '',
        audit_links: [],
        methodology: '',
        methodologyURL: '',
        tvl: 0,
        mcap: 0,
        staking: 0,
        fdv: 0
      },
      protocolType: data.protocolType || ''
    };
    
    res.json(onchainMetrics);
  } catch (error) {
    console.error('Error in direct onchain fetch:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 