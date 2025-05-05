export interface OnchainMetrics {
  metrics: {
    totalDailyFees: number;
    weeklyFees: number;
    averageDailyFees: number;
    totalTransactions: number;
    transactionGrowth24h: number;
    transactionGrowth7d: number;
    activeWallets: number;
    activeWalletsGrowth24h: number;
    averageTransactionValue: number;
    feesHistory: Array<{
      date: string;
      fees: number;
    }>;
  };
  recentActivity: {
    transactions24h: number;
    uniqueAddresses24h: number;
  };
  defiLlamaData: {
    total24h: number;
    total7d: number;
    totalAllTime: number;
    change_1d: number;
  };
  chartData: Array<{
    date: Date;
    value: number;
  }>;
  profile: {
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
  };
  protocolType?: string;
}

export interface SocialMediaData {
  // ... existing code ...
  summary?: string;
  // ... existing code ...
}

export interface LinkedInData {
  companyProfile: {
    success: boolean;
    data: {
      name: string;
      description: string;
      website: string;
      followers: {
        totalFollowers: number;
      } | number;
      employeeCount: number;
      industry: string;
      profileImage?: string;
      displayName?: string;
      companyName?: string;
      bio?: string;
      linkedinUrl?: string;
      staffCount?: number;
      staffCountRange?: string;
      metrics?: {
        avgEngagementRate?: number;
      };
      engagementRate?: number;
      fundingData?: any;
      employeeDistribution?: {
        byFunction?: Array<{ name: string; count: number }>;
        bySkill?: Array<{ name: string; count: number }>;
        byLocation?: Array<{ name: string; count: number }>;
      };
      growth?: {
        followers?: any[];
      };
      companySize?: {
        range: string;
      };
      specialties?: string[];
      companyType?: string;
      revenue?: {
        range: string;
        year: number;
      };
    };
  };
  posts: {
    success: boolean;
    data: {
      posts: any[];
      totalPosts: number;
    };
  };
  acquisitions?: Array<{
    company: string;
    date: string;
    amount?: number;
  }>;
  recentUpdates?: Array<{
    type: string;
    date: string;
    description: string;
  }>;
  followersHistory?: { count: number; timestamp: number }[];
  followers24hChange?: number | null;
  followers24hPercent?: number | null;
  _source?: 'cache' | 'api';
  _lastUpdated?: string;
} 