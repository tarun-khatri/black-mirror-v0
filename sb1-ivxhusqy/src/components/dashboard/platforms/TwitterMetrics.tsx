import React, { useEffect, useState } from 'react';
import { TwitterData } from '../../../types/index';
import { fetchTwitterMetrics } from '../../../services/twitterApi';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  IconButton, 
  Button, 
  Divider, 
  Tooltip,
  Paper,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat, 
  Twitter, 
  Message, 
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  ChatBubble as MessageIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Tweet {
  id: string;
  text: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
}

interface TwitterMetricsProps {
  companyName: string;
  identifier: string;
  color: string;
}

const TwitterMetrics: React.FC<TwitterMetricsProps> = ({ companyName, identifier, color }) => {
  const [data, setData] = useState<TwitterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [tweetsOpen, setTweetsOpen] = useState(false);
  const theme = useTheme();

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const twitterData = await fetchTwitterMetrics(companyName, identifier);
      if (!twitterData) {
        throw new Error('Failed to fetch Twitter data');
      }
      
      setData(twitterData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Twitter metrics';
      setError(errorMessage);
      console.error('Error loading Twitter data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyName, identifier]);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  };

  const renderTrend = (value: number | undefined) => {
    if (value === undefined) return <TrendingFlat color="action" />;
    if (value > 0) return <TrendingUp color="success" />;
    if (value < 0) return <TrendingDown color="error" />;
    return <TrendingFlat color="action" />;
  };

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    return value.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          onClick={() => loadData(true)}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No Twitter data available</Typography>
      </Box>
    );
  }

  const { profile, followerStats, contentAnalysis } = data;

  // Support both data.posts and data.data.posts for maximum compatibility
  const posts = Array.isArray((data as any)?.posts)
    ? (data as any).posts
    : Array.isArray((data as any)?.data?.posts)
      ? (data as any).data.posts
      : [];

  // Debug: log the posts array
  console.log('Recent tweets posts array:', posts);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        borderBottom: '2px solid',
        borderColor: `${color}20`,
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Twitter sx={{ fontSize: 32, color: color }} />
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${color}, ${color}99)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Twitter Analytics
          </Typography>
        </Box>
        <Tooltip title={`Summary generated from the last ${data?.contentAnalysis?.metrics?.recentTweetsCount || 0} tweets. AI analyzes tweet content, engagement, and recency.`} arrow>
          <IconButton 
            onClick={() => setSummaryOpen(true)}
            sx={{ 
              bgcolor: `${color}10`,
              '&:hover': { bgcolor: `${color}20` }
            }}
          >
            <Sparkles size={22} color={color} />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog open={summaryOpen} onClose={() => setSummaryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Summary of Recent Tweets</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {data.summary ? data.summary : 'No summary available.'}
          </Typography>
        </DialogContent>
      </Dialog>

      <Grid container spacing={3}>
        {/* Profile Summary */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f8fa 100%)',
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  bgcolor: `${color}10`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Twitter sx={{ color: color, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {profile.data.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{profile.data.username}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {profile.data.description}
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={4}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: `${color}05`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Followers
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
                      {profile?.data?.followers?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: `${color}05`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Following
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
                      {profile?.data?.following?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: `${color}05`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tweets
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
                      {profile?.data?.tweets?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Paper>
        </Grid>

        {/* Follower Stats */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f8fa 100%)',
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Follower Growth
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: `${color}05`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      24h Change
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      {renderTrend(followerStats?.oneDayChange?.percentage)}
                      <Typography variant="h5" sx={{ ml: 1, fontWeight: 700 }}>
                        {formatNumber(followerStats?.oneDayChange?.count)}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: (followerStats?.oneDayChange?.percentage || 0) > 0 ? 'success.main' : 'error.main',
                        fontWeight: 600
                      }}
                    >
                      {(followerStats?.oneDayChange?.percentage || 0) > 0 ? '+' : ''}
                      {(followerStats?.oneDayChange?.percentage || 0).toFixed(2)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: `${color}05`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      7d Change
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      {renderTrend(followerStats?.oneWeekChange?.percentage)}
                      <Typography variant="h5" sx={{ ml: 1, fontWeight: 700 }}>
                        {formatNumber(followerStats?.oneWeekChange?.count)}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: (followerStats?.oneWeekChange?.percentage || 0) > 0 ? 'success.main' : 'error.main',
                        fontWeight: 600
                      }}
                    >
                      {(followerStats?.oneWeekChange?.percentage || 0) > 0 ? '+' : ''}
                      {(followerStats?.oneWeekChange?.percentage || 0).toFixed(2)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Paper>
        </Grid>

        {/* Engagement Stats */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f8fa 100%)',
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Engagement Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: `${color}05`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Engagement Rate
                    </Typography>
                    <Tooltip title="Average engagement per post = (Likes + Replies + Shares) / Followers for each post, averaged over the last 7 days." arrow>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: color }}>
                        {contentAnalysis?.metrics?.avgEngagementRate?.toFixed(2) || '0.00'}%
                      </Typography>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      Based on last {contentAnalysis?.metrics?.recentTweetsCount || 0} tweets
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: `${color}05`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Daily Engagement
                    </Typography>
                    <Tooltip title="Daily engagement = (Replies in last 24h / Followers) * 100." arrow>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: color }}>
                        {contentAnalysis?.metrics?.replies24h ? 
                          ((contentAnalysis.metrics.replies24h / profile.data.followers) * 100).toFixed(2) : 
                          '0.00'}%
                      </Typography>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      Last 24 hours
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: `${color}05`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Likes
                    </Typography>
                    <Tooltip title="Total number of likes received across all tweets" arrow>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: color }}>
                        {contentAnalysis?.metrics?.totalLikes?.toLocaleString() || '0'}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    bgcolor: `${color}05`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Replies (24h)
                    </Typography>
                    <Tooltip title="Number of replies received in the last 24 hours" arrow>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: color }}>
                        {contentAnalysis?.metrics?.replies24h?.toLocaleString() || '0'}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<Message />}
                  onClick={() => setTweetsOpen(true)}
                  sx={{
                    color: color,
                    borderColor: color,
                    '&:hover': {
                      borderColor: color,
                      backgroundColor: `${color}10`
                    }
                  }}
                >
                  View Recent Tweets
                </Button>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Tweets Dialog */}
      <Dialog
        open={tweetsOpen}
        onClose={() => setTweetsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Recent Tweets
          <IconButton
            aria-label="close"
            onClick={() => setTweetsOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {posts.length > 0 ? (
            <List>
              {posts.slice(0, 5).map((tweet: Tweet) => (
                <ListItem
                  key={tweet.id}
                  sx={{
                    mb: 2,
                    borderRadius: 1,
                    bgcolor: `${color}05`,
                    '&:hover': {
                      bgcolor: `${color}10`
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={(profile as any).data.profileImage} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {profile.data.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{profile.data.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(tweet.date)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {tweet.text}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Chip
                            icon={<FavoriteIcon />}
                            label={tweet.likes.toLocaleString()}
                            size="small"
                            sx={{ bgcolor: `${color}10` }}
                          />
                          <Chip
                            icon={<MessageIcon />}
                            label={tweet.comments.toLocaleString()}
                            size="small"
                            sx={{ bgcolor: `${color}10` }}
                          />
                          <Chip
                            icon={<ShareIcon />}
                            label={tweet.shares.toLocaleString()}
                            size="small"
                            sx={{ bgcolor: `${color}10` }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No recent tweets available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TwitterMetrics; 