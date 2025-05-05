import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  Chip, 
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Divider
} from '@mui/material';
import { TwitterData } from '../types';
import { formatNumber, formatPercentage } from '../utils/formatters';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TwitterIcon from '@mui/icons-material/Twitter';
import CloseIcon from '@mui/icons-material/Close';

interface TwitterCardProps {
  data: TwitterData;
}

const TwitterCard: React.FC<TwitterCardProps> = ({ data }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { profile, metrics, recentActivity } = data;

  const renderGrowthChip = (value: number, percentage: number) => {
    const isPositive = value >= 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
        <Chip
          icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
          label={`${isPositive ? '+' : ''}${formatNumber(value)}`}
          color={isPositive ? 'success' : 'error'}
          size="small"
        />
        <Typography 
          variant="body2" 
          color={isPositive ? 'success.main' : 'error.main'}
          sx={{ fontWeight: 500 }}
        >
          ({isPositive ? '+' : ''}{percentage.toFixed(2)}%)
        </Typography>
      </Box>
    );
  };

  // Simplified card view
  const cardContent = (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(145deg, #ffffff 0%, #f5f8fa 100%)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
        }
      }}
      onClick={() => setIsDialogOpen(true)}
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
            {formatNumber(metrics.followers)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color: '#536471', mb: 1 }}>
            Followers
          </Typography>
          {metrics.followersGrowth24h !== undefined && (
            <Box sx={{ mt: 1 }}>
              {renderGrowthChip(
                metrics.followersGrowth24h,
                (metrics.followersGrowth24h / metrics.followers) * 100
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1DA1F2' }}>
            {formatPercentage(metrics.engagementRate)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Engagement Rate
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Detailed dialog view
  const dialogContent = (
    <Dialog 
      open={isDialogOpen} 
      onClose={() => setIsDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={profile.profileImage}
            alt={profile.name}
            sx={{ 
              width: 40, 
              height: 40,
              border: '2px solid #1DA1F2',
              mr: 2
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {profile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{profile.username}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={() => setIsDialogOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 3,
            color: '#536471',
            lineHeight: 1.5,
          }}
        >
          {profile.bio}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                {formatNumber(metrics.followers)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Followers
                {metrics.followersGrowth24h !== undefined && (
                  <Box sx={{ mt: 1 }}>
                    {renderGrowthChip(
                      metrics.followersGrowth24h,
                      (metrics.followersGrowth24h / metrics.followers) * 100
                    )}
                  </Box>
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                {formatNumber(metrics.following)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Following
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
            Engagement Metrics
          </Typography>
          <Box sx={{ 
            backgroundColor: 'rgba(29,161,242,0.05)', 
            borderRadius: 1,
            p: 2
          }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1DA1F2' }}>
                  {formatPercentage(metrics.engagementRate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Engagement Rate
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatNumber(recentActivity.engagement24h)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Engagements (24h)
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
            Tweet Activity
          </Typography>
          <Box sx={{ 
            backgroundColor: 'rgba(29,161,242,0.05)', 
            borderRadius: 1,
            p: 2
          }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatNumber(metrics.tweets)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tweets
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatNumber(recentActivity.tweets24h)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tweets (24h)
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {cardContent}
      {dialogContent}
    </>
  );
};

export default TwitterCard; 