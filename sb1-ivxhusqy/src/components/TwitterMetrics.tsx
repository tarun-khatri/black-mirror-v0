import React, { useEffect, useState } from 'react';
import { TwitterData } from '../types';
import { fetchTwitterMetrics } from '../services/twitterApi';
import { Card, CardContent, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface TwitterMetricsProps {
  companyName: string;
}

const TwitterMetrics: React.FC<TwitterMetricsProps> = ({ companyName }) => {
  const [data, setData] = useState<TwitterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const twitterData = await fetchTwitterMetrics(companyName);
        setData(twitterData);
      } catch (err) {
        setError('Failed to load Twitter metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [companyName]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error || 'No data available'}</Typography>
        </CardContent>
      </Card>
    );
  }

  const { profile, followerStats, contentAnalysis } = data;

  const renderTrend = (value: number) => {
    if (value > 0) return <TrendingUp color="success" />;
    if (value < 0) return <TrendingDown color="error" />;
    return <TrendingFlat color="action" />;
  };

  return (
    <Grid container spacing={3}>
      {/* Profile Summary */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {profile.data.name} (@{profile.data.username})
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {profile.data.description}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2">Followers</Typography>
                <Typography variant="h6">{profile.data.followers.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2">Following</Typography>
                <Typography variant="h6">{profile.data.following.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2">Tweets</Typography>
                <Typography variant="h6">{profile.data.tweets.toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Follower Stats */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Follower Growth
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">24h Change</Typography>
                <Box display="flex" alignItems="center">
                  {renderTrend(followerStats.oneDayChange.percentage)}
                  <Typography variant="h6" ml={1}>
                    {followerStats.oneDayChange.count.toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {followerStats.oneDayChange.percentage > 0 ? '+' : ''}
                  {followerStats.oneDayChange.percentage.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">7d Change</Typography>
                <Box display="flex" alignItems="center">
                  {renderTrend(followerStats.oneWeekChange.percentage)}
                  <Typography variant="h6" ml={1}>
                    {followerStats.oneWeekChange.count.toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {followerStats.oneWeekChange.percentage > 0 ? '+' : ''}
                  {followerStats.oneWeekChange.percentage.toFixed(2)}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Engagement Stats */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Engagement Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Avg. Engagement Rate</Typography>
                <Typography variant="h6">
                  {contentAnalysis.metrics.avgEngagementRate.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Recent Tweets</Typography>
                <Typography variant="h6">
                  {contentAnalysis.metrics.recentTweetsCount}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2">Total Likes</Typography>
                <Typography variant="h6">
                  {contentAnalysis.metrics.totalLikes.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2">Total Retweets</Typography>
                <Typography variant="h6">
                  {contentAnalysis.metrics.totalRetweets.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2">Total Replies</Typography>
                <Typography variant="h6">
                  {contentAnalysis.metrics.totalReplies.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TwitterMetrics; 