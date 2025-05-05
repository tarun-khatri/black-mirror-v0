import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { Users, FileText, ThumbsUp, MessageCircle } from 'lucide-react';
import { formatNumber, formatPercentage } from '../../../services';

interface MediumMetricsProps {
  data: any;
  color: string;
}

export const MediumMetrics: React.FC<MediumMetricsProps> = ({ data, color }) => {
  if (!data || !data.metrics) return null;

  // Safely get values with fallbacks to prevent undefined errors
  const followers = data.metrics.followers || 0;
  const stories = data.metrics.stories || 0;
  const claps = data.metrics.claps || 0;
  const responses = data.metrics.responses || 0;
  const engagementRate = data.metrics.engagementRate || 0;
  const totalEngagements = data.metrics.totalEngagements || 0;
  const averageClaps = data.metrics.averageClaps || 0;
  const averageResponses = data.metrics.averageResponses || 0;

  return (
    <>
      {/* Key Metrics Section */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        Key Metrics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Users size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Followers
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: color }}>
              {formatNumber(followers)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatPercentage(engagementRate)} engagement rate
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FileText size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Stories
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: color }}>
              {formatNumber(stories)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total published
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ThumbsUp size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Claps
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: color }}>
              {formatNumber(claps)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatNumber(averageClaps)} avg. per story
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MessageCircle size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Responses
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: color }}>
              {formatNumber(responses)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatNumber(averageResponses)} avg. per story
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Engagement Metrics Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
        Engagement Metrics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            height: '100%'
          }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Engagement Rate
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
              {formatPercentage(engagementRate)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Based on {formatNumber(totalEngagements)} total engagements
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            height: '100%'
          }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Average Claps
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
              {formatNumber(averageClaps)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Per story
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}; 