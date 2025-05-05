// --- Generic Types ---

export interface SocialProfile {
  id?: string;
  name?: string;
  displayName?: string;
  username?: string;
  handle?: string;
  bio?: string;
  location?: string;
  url?: string;
  website?: string;
  profileImage?: string;
  postCount?: number;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  staffCount?: number;
  staffCountRange?: string;
}

export interface FollowerHistory {
  date: string;
  count: number;
}

export interface FollowerStats {
  current?: number;
  totalFollowers?: number;
  oneWeekChange?: {
    count: number;
    percentage: number;
  };
  followersChange?: {
    count: number;
    percentage: number;
  };
  oneMonthChange?: {
    count: number;
    percentage: number;
  };
  oneYearChange?: {
    count: number;
    percentage: number;
  };
  history?: FollowerHistory[];
  oneDayChange: {
    count: number;
    percentage: number;
  };
}

export interface Post {
  id?: string;
  text: string;
  date: string;
  likes?: number;
  comments?: number;
  shares?: number;
  retweets?: number;
  url?: string;
  media?: {
    type: string;
    url: string;
  }[];
  created_at: string;
  replies: number;
  engagement_rate: number;
}

export interface ContentAnalysis {
  engagementRate: number;
  metrics: {
    avgEngagementRate: number;
    totalLikes: number;
    totalRetweets: number;
    totalReplies: number;
    replies24h: number;
    replies7d: number;
    recentTweetsCount: number;
    tweetFrequency7d: number;
    replyFrequency7d: number;
  };
}

// --- Platform Specific Types ---

export interface TwitterData {
  profile: {
    success: boolean;
    data: {
      name: string;
      username: string;
      description: string;
      followers: number;
      following: number;
      tweets: number;
    };
  };
  tweets: {
    success: boolean;
    data: {
      tweets: Post[];
      totalTweets: number;
    };
  };
  followerStats: FollowerStats;
  contentAnalysis: ContentAnalysis;
  _source?: 'cache' | 'api';
  _lastUpdated?: string;
  summary?: string;
  posts?: any[];
}

export interface LinkedInPost {
  text: string;
  totalReactionCount: number;
  likeCount: number;
  appreciationCount?: number;
  empathyCount?: number;
  InterestCount?: number;
  praiseCount?: number;
  commentsCount: number;
  repostsCount: number;
  postUrl: string;
  postedAt: string;
  urn: string;
  author?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    url?: string;
  };
  company?: {
    name: string;
    url: string;
    urn: string;
  };
}

export interface LinkedInCompanyData {
  id: string;
  name: string;
  universalName: string;
  linkedinUrl: string;
  tagline: string;
  description: string;
  Images: {
    logo: string;
    cover: string;
  };
  staffCount: number;
  headquarter: {
    countryCode: string;
    geographicArea: string;
    country: string;
    city: string;
    description: string;
    headquarter: boolean;
  };
  locations: Array<{
    countryCode: string;
    geographicArea: string;
    country: string;
    city: string;
    description: string;
    headquarter: boolean;
  }>;
  industries: string[];
  website: string;
  founded: {
    year: number;
  };
  followerCount: number;
  staffCountRange: string;
  employeeDistribution?: {
    byFunction?: Array<{ name: string; count: number }>;
    bySkill?: Array<{ name: string; count: number }>;
    byLocation?: Array<{ name: string; count: number }>;
  };
  funding?: {
    totalFunding?: number;
    lastFundingRound?: {
      amount: number;
      date: string;
      round: string;
      investors: string[];
    };
    fundingRounds?: Array<{
      amount: number;
      date: string;
      round: string;
      investors: string[];
    }>;
  };
  companySize?: {
    min: number;
    max: number;
    range: string;
  };
  specialties?: string[];
  companyType?: string;
  revenue?: {
    range?: string;
    year?: number;
  };
  acquisitions?: Array<{
    company: string;
    date: string;
    amount?: number;
  }>;
  similarCompanies?: Array<{
    name: string;
    url: string;
    industry: string;
  }>;
  recentUpdates?: Array<{
    type: string;
    date: string;
    description: string;
  }>;
}

export interface LinkedInApiResponse {
  success: boolean;
  message: string;
  data: LinkedInCompanyData | LinkedInPost[];
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
}

export interface MediumData {
  profile: {
    success: boolean;
    data: {
      name: string;
      username: string;
      description: string;
      followers: number;
      stories: number;
    };
  };
  stories: {
    success: boolean;
    data: {
      stories: any[];
      totalStories: number;
    };
  };
}

// --- GitHub Data Type ---
export interface GitHubData {
  profile: {
    username: string;
    name: string;
    followers: number;
    following: number;
    publicRepos: number;
    avatarUrl: string;
  };
  metrics?: {
    stars: number;
    forks: number;
    watchers: number;
  };
}

// --- Onchain Data Type ---
export interface OnchainData {
  profile: {
    name: string;
    description: string;
    logo?: string;
    website?: string;
  };
  metrics: {
    totalTransactions: number;
    transactionGrowth24h: number;
    transactionGrowth7d: number;
    activeWallets: number;
    activeWalletsGrowth24h: number;
    averageTransactionValue: number;
  };
  recentActivity: {
    transactions24h: number;
    uniqueAddresses24h: number;
  };
}

// --- Crypto Data Type ---
export interface CryptoData {
  id: string | number; // CMC ID or Symbol
  name: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap?: number;
  volume24h?: number;
}

// --- Dashboard State & Props ---

export interface Company {
  _id: string;
  id: string;
  name: string;
  logo?: string;
  identifiers: {
    linkedIn?: string;
    twitter?: string;
    telegram?: string;
    medium?: string;
    defillama?: string;
  };
  createdAt?: number;
  updatedAt?: number;
}

export interface CompetitorData {
  twitter?: TwitterData | null;
  linkedIn?: LinkedInData | null;
  medium?: MediumData | null;
  cryptoData?: CryptoData | null; // Added field for crypto data
  onchainData?: OnchainData | null; // Added field for onchain data
  github?: GitHubData | null; // Added field for GitHub data
}

export interface SocialMediaData {
  success: boolean;
  error?: string;
  platform?: string;
  identifier?: string;
  companyName?: string;
  profile: SocialProfile;
  followerStats: FollowerStats;
  contentAnalysis: ContentAnalysis;
  posts: Post[];
  feesHistory?: Array<{
    date: string;
    fees: number;
  }>;
  totalDailyFees?: number;
  weeklyFees?: number;
  averageDailyFees?: number;
  protocolType?: string;
  total24h?: number;
  total48hto24h?: number;
  total7d?: number;
  totalAllTime?: number;
  change_1d?: number;
  activeWallets?: number;
  activeWalletsGrowth24h?: number;
  transactions24h?: number;
  uniqueAddresses24h?: number;
  expiresAt?: number;
  _source?: 'cache' | 'api';
  _lastUpdated?: string;
  summary?: string;
  employeeDistribution?: {
    byFunction?: Array<{ name: string; count: number }>;
    bySkill?: Array<{ name: string; count: number }>;
    byLocation?: Array<{ name: string; count: number }>;
  };
}

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
    feesHistory: {
      date: Date;
      value: number;
    }[];
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
  chartData: {
    date: Date;
    value: number;
  }[];
  profile: {
    category: string;
    chains: string[];
    twitter: string;
    github: string;
    audit_links: string[];
    methodology: string;
    methodologyURL: string;
    tvl: number;
    mcap: number;
    staking: number;
    fdv: number;
  };
  protocolType: string;
}
