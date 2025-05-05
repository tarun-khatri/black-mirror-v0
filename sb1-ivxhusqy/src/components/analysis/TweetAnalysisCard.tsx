import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Divider,
  Grid,
  Chip,
  useTheme,
  Paper,
} from '@mui/material';
import { 
  MessageCircle, 
  Heart, 
  Repeat, 
  BarChart2, 
  Calendar, 
  Smile, 
  Frown, 
  Meh 
} from 'lucide-react';
import { TweetAnalysis } from '../../types';
import { Doughnut } from 'react-chartjs-2';

// Import Chart.js components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface TweetAnalysisCardProps {
  analysis: TweetAnalysis;
}

const TweetAnalysisCard: React.FC<TweetAnalysisCardProps> = ({ analysis }) => {
  const theme = useTheme();
  
  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          analysis.sentimentBreakdown.positive,
          analysis.sentimentBreakdown.neutral,
          analysis.sentimentBreakdown.negative,
        ],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.grey[500],
          theme.palette.error.main,
        ],
        borderColor: [
          theme.palette.success.main,
          theme.palette.grey[500],
          theme.palette.error.main,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const sentimentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          color: theme.palette.text.primary,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
    },
    cutout: '70%',
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Tweet Analysis
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Most Viral Tweet
            </Typography>
            
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                "{analysis.mostViralTweet.text}"
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Calendar size={14} color={theme.palette.text.secondary} />
                <Typography variant="caption" color="text.secondary">
                  {analysis.mostViralTweet.date}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={2}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Heart size={14} color={theme.palette.error.main} />
                  <Typography variant="body2" color="text.secondary">
                    {analysis.mostViralTweet.likes.toLocaleString()}
                  </Typography>
                </Stack>
                
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Repeat size={14} color={theme.palette.success.main} />
                  <Typography variant="body2" color="text.secondary">
                    {analysis.mostViralTweet.retweets.toLocaleString()}
                  </Typography>
                </Stack>
                
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <MessageCircle size={14} color={theme.palette.primary.main} />
                  <Typography variant="body2" color="text.secondary">
                    {analysis.mostViralTweet.replies.toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
            
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Common Words
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {analysis.frequentWords.slice(0, 10).map((word) => (
                <Chip
                  key={word.word}
                  label={`${word.word} (${word.count})`}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box sx={{ height: 180, mb: 2 }}>
              <Doughnut data={sentimentData} options={sentimentOptions as any} />
            </Box>
            
            <Typography variant="subtitle1" fontWeight="medium" align="center" gutterBottom>
              Tweet Sentiment
            </Typography>
            
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-around"
              sx={{ mt: 2 }}
            >
              <Stack alignItems="center">
                <Smile size={24} color={theme.palette.success.main} />
                <Typography variant="body2" fontWeight="medium">
                  {analysis.sentimentBreakdown.positive}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Positive
                </Typography>
              </Stack>
              
              <Stack alignItems="center">
                <Meh size={24} color={theme.palette.grey[500]} />
                <Typography variant="body2" fontWeight="medium">
                  {analysis.sentimentBreakdown.neutral}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Neutral
                </Typography>
              </Stack>
              
              <Stack alignItems="center">
                <Frown size={24} color={theme.palette.error.main} />
                <Typography variant="body2" fontWeight="medium">
                  {analysis.sentimentBreakdown.negative}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Negative
                </Typography>
              </Stack>
            </Stack>
            
            <Divider sx={{ my: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack alignItems="center">
                  <Typography variant="h5" fontWeight="bold">
                    {analysis.averageEngagement.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Average Engagement
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={6}>
                <Stack alignItems="center">
                  <Typography variant="h5" fontWeight="bold">
                    {analysis.postsPerDay.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Posts per Day
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TweetAnalysisCard;