import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Divider,
  useTheme,
  Avatar,
  Grid,
  Tooltip,
} from '@mui/material';
import { Twitter, Users, TrendingUp, TrendingDown, MessageCircle, BarChart2, Calendar, User } from 'lucide-react';
import { TwitterData } from '../../types';

interface TwitterCardProps {
  data: TwitterData;
}

const TwitterCard: React.FC<TwitterCardProps> = ({ data }) => {
  const theme = useTheme();
  const { profile, followerStats, contentAnalysis } = data;

  const followers = profile.followers || 0;
  const following = profile.following || 0;
  const postsCount = profile.postsCount || 0;
  const bio = profile.bio || '';
  const username = profile.username || '';
  const displayName = profile.displayName || '';
  const joinedDate = profile.joinedDate || '';

  const followerChange = followerStats.oneDayChange?.count || 0;
  const followerChangePercent = followerStats.oneDayChange?.percentage || 0;
  const isFollowerUp = followerChange >= 0;

  // Get metrics from contentAnalysis
  const metrics = contentAnalysis.metrics || {
    engagementRate: 0,
    avgEngagementRate: 0,
    replies24h: 0,
    replies7d: 0,
    totalLikes: 0,
    totalRetweets: 0,
    totalReplies: 0,
    recentTweetsCount: 0
  };

  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        maxWidth: '100%',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header Section */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={profile.profileImage}
              alt={displayName}
              sx={{
                width: 56,
                height: 56,
                border: `2px solid ${theme.palette.divider}`,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight="bold">
                  {displayName}
                </Typography>
                <Twitter size={20} color={theme.palette.text.secondary} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                @{username}
              </Typography>
            </Box>
          </Stack>

          {/* Bio Section */}
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {bio}
          </Typography>

          <Divider />

          {/* Metrics Grid */}
          <Grid container spacing={2}>
            {/* Followers */}
            <Grid item xs={6} sm={4}>
              <Tooltip title="Total number of followers" arrow placement="top">
                <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Users size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">Followers</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="bold">
                      {followers.toLocaleString()}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {isFollowerUp ? (
                        <TrendingUp size={14} color={theme.palette.success.main} />
                      ) : (
                        <TrendingDown size={14} color={theme.palette.error.main} />
                      )}
                      <Typography
                        variant="caption"
                        color={isFollowerUp ? "success.main" : "error.main"}
                      >
                        {isFollowerUp ? '+' : ''}{followerChangePercent.toFixed(2)}%
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Tooltip>
            </Grid>

            {/* Following */}
            <Grid item xs={6} sm={4}>
              <Tooltip title="Number of accounts being followed" arrow placement="top">
                <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <User size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">Following</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="bold">
                      {following.toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
              </Tooltip>
            </Grid>

            {/* Engagement Rate */}
            <Grid item xs={6} sm={4}>
              <Tooltip 
                title={`Engagement rate = (Total engagements / Number of tweets / Followers) × 100
                Based on ${metrics.recentTweetsCount} recent tweets`}
                arrow 
                placement="top"
              >
                <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BarChart2 size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">Engagement Rate</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="bold">
                      {metrics.engagementRate.toFixed(2)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Per post average
                    </Typography>
                  </Stack>
                </Box>
              </Tooltip>
            </Grid>

            {/* Replies */}
            <Grid item xs={6} sm={4}>
              <Tooltip 
                title={`Replies in last 24h: ${metrics.replies24h.toLocaleString()}
                Replies in last 7 days: ${metrics.replies7d.toLocaleString()}
                Based on ${metrics.recentTweetsCount} recent tweets`}
                arrow 
                placement="top"
              >
                <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MessageCircle size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">Replies</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="bold">
                      {metrics.replies24h.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      7d: {metrics.replies7d.toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
              </Tooltip>
            </Grid>

            {/* Total Interactions */}
            <Grid item xs={6} sm={4}>
              <Tooltip 
                title={`Total interactions received on recent tweets
                Likes: ${metrics.totalLikes.toLocaleString()}
                Retweets: ${metrics.totalRetweets.toLocaleString()}
                Based on ${metrics.recentTweetsCount} recent tweets`}
                arrow 
                placement="top"
              >
                <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MessageCircle size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">Received Likes</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="bold">
                      {metrics.totalLikes.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      RT: {metrics.totalRetweets.toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TwitterCard;
