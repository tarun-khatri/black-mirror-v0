import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Dialog, DialogTitle, DialogContent, IconButton, Alert, Box, Divider, Button } from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import { fetchAllSocialMediaData } from '../../services/socialMediaApi';
import { Company, SocialMediaData, Post } from '../../types/index';
import OnchainMetrics from './platforms/OnchainMetrics';
import TwitterMetrics from './platforms/TwitterMetrics';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { LinkedInMetrics } from './platforms/LinkedInMetrics';

interface CompanyMetricsProps {
  company: Company;
}

export const CompanyMetrics: React.FC<CompanyMetricsProps> = ({ company }) => {
  const [socialMediaData, setSocialMediaData] = useState<{
    linkedIn: SocialMediaData | null;
    twitter: SocialMediaData | null;
    telegram: SocialMediaData | null;
    medium: SocialMediaData | null;
    onchain: SocialMediaData | null;
  }>({
    linkedIn: null,
    twitter: null,
    telegram: null,
    medium: null,
    onchain: null
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformErrors, setPlatformErrors] = useState<Record<string, string>>({});
  const [refreshingOnchain, setRefreshingOnchain] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setPlatformErrors({});

        // Fetch onchain data first
        let onchainData = null;
        if (company.identifiers?.defillama) {
          try {
            const onchainResponse = await fetch(`/api/cache/${company.name}/onchain/${company.identifiers.defillama}`);
            if (!onchainResponse.ok) {
              throw new Error('Failed to fetch onchain data');
            }
            const onchainResult = await onchainResponse.json();
            if (onchainResult.success) {
              onchainData = onchainResult.data;
            } else {
              throw new Error(onchainResult.error || 'Failed to fetch onchain data');
            }
          } catch (error) {
            console.error('Error fetching onchain data:', error);
            setPlatformErrors(prev => ({
              ...prev,
              onchain: error instanceof Error ? error.message : 'Failed to fetch onchain data'
            }));
          }
        }

        // Fetch other social media data
        const data = await fetchAllSocialMediaData(
          {
            linkedIn: company.identifiers.linkedIn,
            twitter: company.identifiers.twitter,
            telegram: company.identifiers.telegram,
            medium: company.identifiers.medium,
            defillama: company.identifiers.defillama
          },
          company.name
        );

        setSocialMediaData({
          ...data,
          onchain: onchainData || data.onchain
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch social media data';
        setError(errorMessage);
        console.error('Error fetching social media data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [company]);

  const handlePlatformClick = (platform: string) => {
    console.log(`Platform clicked: ${platform}`);
    setSelectedPlatform(platform);
  };

  const handleCloseDialog = () => {
    setSelectedPlatform(null);
  };

  const handleForceRefreshOnchain = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!company.identifiers.defillama) {
      console.error('No DeFi Llama identifier provided');
      return;
    }
    
    try {
      setRefreshingOnchain(true);
      
      // Call the refresh endpoint with force refresh
      const response = await fetch(`/api/cache/${company.name}/onchain/${company.identifiers.defillama}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force: true })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to refresh Onchain data: ${data.details || data.error}`);
      }
      
      console.log('Received refreshed onchain data:', data);
      
      // Update the onchain data in state
      setSocialMediaData(prev => ({
        ...prev,
        onchain: data
      }));
      
    } catch (error) {
      console.error('Error refreshing Onchain data:', error);
      setPlatformErrors(prev => ({
        ...prev,
        onchain: error instanceof Error ? error.message : 'Failed to refresh Onchain data'
      }));
    } finally {
      setRefreshingOnchain(false);
    }
  };

  const renderPlatformCard = (platform: string, data: SocialMediaData | null) => {
    const platformError = platformErrors[platform];
    
    if (!data) {
      return (
        <Card 
          sx={{ 
            cursor: 'pointer', 
            '&:hover': { boxShadow: 6 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={() => handlePlatformClick(platform)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                {platform}
              </Typography>
              {platform === 'onchain' && company.identifiers.defillama && (
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleForceRefreshOnchain}
                  disabled={refreshingOnchain}
                  sx={{ minWidth: 'auto' }}
                >
                  {refreshingOnchain ? 'Refreshing...' : 'Force Refresh'}
                </Button>
              )}
            </Box>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : platformError ? (
              <Alert severity="error" sx={{ mt: 1 }}>
                {platformError}
              </Alert>
            ) : (
              <Typography color="textSecondary">No data available</Typography>
            )}
          </CardContent>
        </Card>
      );
    }

    const stats = data.followerStats;
    const profile = data.profile;

    // Special handling for onchain data
    if (platform === 'onchain') {
      // Use the same logic as OnchainMetrics
      const dailyRevenue = (typeof data.totalDailyFees === 'number' ? data.totalDailyFees : (typeof data.total24h === 'number' ? data.total24h : null));
      const dailyChange = (typeof data.change_1d === 'number' ? data.change_1d : null);
      const isPositive = dailyChange !== null && dailyChange >= 0;
      return (
        <Card 
          sx={{ 
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e3e9ff 100%)',
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(63,81,181,0.08)',
            border: '1.5px solid #3f51b520',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-6px) scale(1.03)',
              boxShadow: '0 8px 32px rgba(63,81,181,0.15)',
            },
            p: 0
          }}
          onClick={() => handlePlatformClick(platform)}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#3f51b5' }}>
                Onchain
              </Typography>
              {company.identifiers.defillama && (
                <IconButton
                  onClick={handleForceRefreshOnchain}
                  disabled={refreshingOnchain}
                  sx={{ minWidth: 'auto', fontWeight: 600 }}
                >
                  <RefreshIcon />
                </IconButton>
              )}
            </Box>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Daily Revenue
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#222', mb: 1 }}>
                {dailyRevenue !== null && dailyRevenue !== 0 ? `$${dailyRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : 'N/A'}
              </Typography>
              {dailyChange !== null && dailyRevenue !== null && dailyRevenue !== 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  {isPositive ? (
                    <TrendingUpIcon sx={{ color: '#4caf50', mr: 1 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: '#f44336', mr: 1 }} />
                  )}
                  <Typography variant="h6" sx={{ color: isPositive ? '#4caf50' : '#f44336', fontWeight: 700 }}>
                    {isPositive ? '+' : ''}{dailyChange.toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    today
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Twitter Card
    if (platform === 'twitter') {
      // Followers and 24h change
      const followers = stats?.totalFollowers ?? stats?.current ?? null;
      const changeObj = stats?.oneDayChange;
      const changeCount = changeObj?.count ?? null;
      const changePercent = changeObj?.percentage ?? null;
      const isPositive = changePercent !== null && changePercent >= 0;
      return (
        <Card 
          sx={{ 
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f8fa 100%)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            }
          }}
          onClick={() => handlePlatformClick(platform)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TwitterIcon sx={{ color: '#1DA1F2', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                Twitter
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                {followers !== null ? followers.toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: '#536471', mb: 1 }}>
                Followers
              </Typography>
            </Box>
            {changePercent !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {isPositive ? (
                  <TrendingUpIcon sx={{ color: '#4caf50', mr: 1 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: '#f44336', mr: 1 }} />
                )}
                <Typography variant="h6" sx={{ color: isPositive ? '#4caf50' : '#f44336', fontWeight: 700 }}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </Typography>
                {changeCount !== null && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({isPositive ? '+' : ''}{changeCount.toLocaleString()})
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  24h
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      );
    }

    // Medium Card
    if (platform === 'medium') {
      return (
        <Card 
          sx={{ 
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(145deg, #ffffff 0%, #e6f9f2 100%)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            }
          }}
          onClick={() => handlePlatformClick(platform)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MenuBookIcon sx={{ color: '#00ab6c', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                Medium
              </Typography>
            </Box>
            {(!data || !stats?.totalFollowers) ? (
              <Typography color="textSecondary">No data available</Typography>
            ) : (
              <>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                    {stats?.totalFollowers?.toLocaleString() || stats?.current?.toLocaleString() || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: '#00ab6c', mb: 1 }}>
                    Followers
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#00ab6c' }}>
                    {data.contentAnalysis?.metrics?.avgEngagementRate ? 
                      (data.contentAnalysis.metrics.avgEngagementRate * 100).toFixed(2) + '%' : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Engagement Rate
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      );
    }

    // LinkedIn Card
    if (platform === 'linkedIn') {
      // Use the same extraction logic as LinkedInMetrics
      const companyProfile = (data as any)?.companyProfile;
      const stats = data.followerStats;
      let followers = null;
      if (companyProfile && companyProfile.data) {
        const companyData = companyProfile.data;
        followers = typeof companyData?.followers === 'number'
          ? companyData.followers
          : companyData?.followers?.totalFollowers ?? 0;
      }
      const changeObj = stats?.oneDayChange;
      const changeCount = changeObj?.count ?? null;
      const changePercent = changeObj?.percentage ?? null;
      const isPositive = changePercent !== null && changePercent >= 0;
      return (
        <Card 
          sx={{ 
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(145deg, #ffffff 0%, #eaf4fb 100%)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            }
          }}
          onClick={() => handlePlatformClick(platform)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LinkedInIcon sx={{ color: '#0077b5', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                LinkedIn
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                {followers !== null ? followers.toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: '#0077b5', mb: 1 }}>
                Followers
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              {isPositive ? (
                <TrendingUpIcon sx={{ color: '#4caf50', mr: 1 }} />
              ) : (
                <TrendingDownIcon sx={{ color: '#f44336', mr: 1 }} />
              )}
              <Typography variant="h6" sx={{ color: isPositive ? '#4caf50' : '#f44336', fontWeight: 700 }}>
                {isPositive ? '+' : ''}{(changePercent ?? 0).toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({isPositive ? '+' : ''}{(changeCount ?? 0).toLocaleString()})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                24h
              </Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Telegram Card
    if (platform === 'telegram') {
      return (
        <Card 
          sx={{ 
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(145deg, #ffffff 0%, #e3f2fd 100%)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            }
          }}
          onClick={() => handlePlatformClick(platform)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TelegramIcon sx={{ color: '#229ED9', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                Telegram
              </Typography>
            </Box>
            {(!data || !stats?.totalFollowers) ? (
              <Typography color="textSecondary">No data available</Typography>
            ) : (
              <>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                    {stats?.totalFollowers?.toLocaleString() || stats?.current?.toLocaleString() || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: '#229ED9', mb: 1 }}>
                    Followers
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#229ED9' }}>
                    {data.contentAnalysis?.metrics?.avgEngagementRate ? 
                      (data.contentAnalysis.metrics.avgEngagementRate * 100).toFixed(2) + '%' : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Engagement Rate
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card 
        sx={{ 
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f8fa 100%)',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.15)'
          }
        }}
        onClick={() => handlePlatformClick(platform)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TwitterIcon sx={{ color: '#1DA1F2', fontSize: 28, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              Twitter
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              {stats?.totalFollowers?.toLocaleString() || stats?.current?.toLocaleString() || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: '#536471', mb: 1 }}>
              Followers
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1DA1F2' }}>
              {data.contentAnalysis?.metrics?.avgEngagementRate ? 
                (data.contentAnalysis.metrics.avgEngagementRate * 100).toFixed(2) + '%' : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Engagement Rate
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderPlatformDetails = (platform: string, data: SocialMediaData | null) => {
    if (!data) return null;

    // Special handling for onchain data
    if (platform === 'onchain') {
      return (
        <Dialog
          open={!!selectedPlatform}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {platform} Metrics
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <OnchainMetrics 
              companyName={company.name}
              companyId={company.id} 
              identifiers={{ defillama: company.identifiers.defillama }}
              timeRange="7d"
              chartType="line"
              color="#3f51b5"
              onTimeRangeChange={() => {}}
              onChartTypeChange={() => {}}
            />
          </DialogContent>
        </Dialog>
      );
    }

    // Special handling for Twitter data
    if (platform === 'twitter') {
      return (
        <Dialog
          open={!!selectedPlatform}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {platform} Metrics
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TwitterMetrics 
              companyName={company.name}
              identifier={company.identifiers.twitter || ''}
              color="#1DA1F2"
            />
          </DialogContent>
        </Dialog>
      );
    }

    // Special handling for LinkedIn data
    if (platform === 'linkedIn') {
      return (
        <Dialog
          open={!!selectedPlatform}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            LinkedIn Metrics
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <LinkedInMetrics 
              data={socialMediaData.linkedIn || data}
              color="#0077b5"
            />
          </DialogContent>
        </Dialog>
      );
    }

    const { profile, followerStats, contentAnalysis, posts } = data;

    return (
      <Dialog
        open={!!selectedPlatform}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {platform} Metrics
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Profile Information</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography><strong>Name:</strong> {profile?.displayName || profile?.name || 'N/A'}</Typography>
                <Typography><strong>Username:</strong> {profile?.username || profile?.handle || 'N/A'}</Typography>
                <Typography><strong>Bio:</strong> {profile?.bio || 'N/A'}</Typography>
                <Typography><strong>Location:</strong> {profile?.location || 'N/A'}</Typography>
                <Typography><strong>Website:</strong> {profile?.url || profile?.website || 'N/A'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Follower Statistics</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography><strong>Total Followers:</strong> {followerStats?.totalFollowers?.toLocaleString() || followerStats?.current?.toLocaleString() || 'N/A'}</Typography>
                <Typography><strong>Followers Growth (1 week):</strong> {followerStats?.oneWeekChange?.percentage?.toFixed(2) || followerStats?.followersChange?.percentage?.toFixed(2) || 'N/A'}%</Typography>
                <Typography><strong>Engagement Rate:</strong> {contentAnalysis?.metrics?.avgEngagementRate ? 
                  (contentAnalysis.metrics.avgEngagementRate * 100).toFixed(2) + '%' : 'N/A'}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Content Analysis</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography><strong>Average Engagement Rate:</strong> {contentAnalysis?.metrics?.avgEngagementRate ? 
                  (contentAnalysis.metrics.avgEngagementRate * 100).toFixed(2) + '%' : 'N/A'}</Typography>
                <Typography><strong>Total Likes:</strong> {contentAnalysis?.metrics?.totalLikes?.toLocaleString() || 'N/A'}</Typography>
                <Typography><strong>Total Retweets:</strong> {contentAnalysis?.metrics?.totalRetweets?.toLocaleString() || 'N/A'}</Typography>
                <Typography><strong>Recent Posts:</strong> {contentAnalysis?.metrics?.recentTweetsCount?.toLocaleString() || 'N/A'}</Typography>
              </Box>
            </Grid>

            {posts && posts.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Recent Posts</Typography>
                <Box sx={{ mt: 1 }}>
                  {posts.slice(0, 3).map((post: Post, index: number) => (
                    <Box key={post.id || index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">{new Date(post.date).toLocaleDateString()}</Typography>
                      <Typography variant="body1" sx={{ my: 1 }}>{post.text}</Typography>
                      <Typography variant="body2">
                        <strong>Likes:</strong> {post.likes?.toLocaleString() || 'N/A'} | 
                        <strong> Comments:</strong> {post.comments?.toLocaleString() || 'N/A'} | 
                        <strong> Shares:</strong> {post.shares?.toLocaleString() || 'N/A'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div>
      {error && !Object.keys(platformErrors).length && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          {renderPlatformCard('linkedIn', socialMediaData.linkedIn)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderPlatformCard('twitter', socialMediaData.twitter)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderPlatformCard('telegram', socialMediaData.telegram)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderPlatformCard('medium', socialMediaData.medium)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderPlatformCard('onchain', socialMediaData.onchain)}
        </Grid>
      </Grid>

      {selectedPlatform && (
        renderPlatformDetails(
          selectedPlatform,
          socialMediaData[selectedPlatform as keyof typeof socialMediaData]
        )
      )}
    </div>
  );
}; 