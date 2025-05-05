export interface OnchainProfile {
  name: string;
  logo: string;
  website?: string;
  description: string;
}

export interface OnchainMetrics {
  totalTransactions: number;
  activeWallets: number;
  averageTransactionValue: number;
  transactionGrowth24h: number;
  activeWalletsGrowth24h: number;
  transactionGrowth7d: number;
}

export interface OnchainRecentActivity {
  transactions24h: number;
  uniqueAddresses24h: number;
}

export interface OnchainData {
  profile: OnchainProfile;
  metrics: OnchainMetrics;
  recentActivity: OnchainRecentActivity;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  identifiers?: {
    twitter?: string;
    linkedin?: string;
    medium?: string;
    defillama?: string;
  };
  cmcSymbolOrId?: string;
  onchainAddress?: string;
}

export interface TwitterMetrics {
  followers: number;
  following: number;
  tweets: number;
  engagementRate: number;
  followersGrowth24h?: number;
} 