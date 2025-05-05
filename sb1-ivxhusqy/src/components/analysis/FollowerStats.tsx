import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { FollowerStats as FollowerStatsType } from '../../types';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FollowerStatsProps {
  stats: FollowerStatsType;
}

const FollowerStats: React.FC<FollowerStatsProps> = ({ stats }) => {
  const theme = useTheme();

  const labels = stats.history.map(item => item.date);
  const data = stats.history.map(item => item.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Followers',
        data,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(29, 161, 242, 0.1)'
          : 'rgba(29, 161, 242, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (context: any) => {
            return `Date: ${context[0].label}`;
          },
          label: (context: any) => {
            return `Followers: ${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
          color: theme.palette.text.secondary,
        },
      },
      y: {
        grid: {
          color: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value;
          },
        },
      },
    },
  };

  const ChangeIndicator = ({ change }: { change: { count: number; percentage: number } }) => {
    const isPositive = change.count >= 0;
    
    return (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {isPositive ? (
          <TrendingUp size={16} color={theme.palette.success.main} />
        ) : (
          <TrendingDown size={16} color={theme.palette.error.main} />
        )}
        <Typography 
          variant="body2" 
          color={isPositive ? "success.main" : "error.main"}
          fontWeight="medium"
        >
          {isPositive ? '+' : ''}{change.count.toLocaleString()} ({(isPositive ? '+' : '')}{change.percentage.toFixed(2)}%)
        </Typography>
      </Stack>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Follower Growth
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {stats.current.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current followers
          </Typography>
        </Box>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} divider={<Divider orientation="vertical" flexItem />} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              24 Hours
            </Typography>
            <ChangeIndicator change={stats.oneDayChange} />
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              7 Days
            </Typography>
            <ChangeIndicator change={stats.oneWeekChange} />
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              30 Days
            </Typography>
            <ChangeIndicator change={stats.oneMonthChange} />
          </Box>
        </Stack>
        
        <Box sx={{ height: 300, mt: 2 }}>
          <Line data={chartData} options={options as any} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FollowerStats;