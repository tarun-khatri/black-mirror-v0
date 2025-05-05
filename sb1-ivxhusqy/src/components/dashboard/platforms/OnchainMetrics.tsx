import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Paper, ToggleButtonGroup, ToggleButton, CircularProgress, IconButton, Button, Tooltip } from '@mui/material';
import { BarChart, Users, TrendingUp, TrendingDown, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { formatNumber, formatPercentage } from '../../../services';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import type { OnchainMetrics, SocialMediaData } from '../../../types/index';
import apiConfig from '../../../api/api';

// Format helper for compact numbers
const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

interface OnchainMetricsProps {
  companyName: string;
  companyId?: string;
  identifiers: {
    defillama?: string;
  };
  timeRange?: '7d' | '30d';
  chartType?: 'line' | 'bar';
  color: string;
  onTimeRangeChange?: (timeRange: '7d' | '30d') => void;
  onChartTypeChange?: (chartType: 'line' | 'bar') => void;
  data?: SocialMediaData | null;
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Helper function to calculate weekly growth
const calculateWeeklyGrowth = (dataChart: [number, number][] | undefined): number => {
  if (!dataChart || dataChart.length < 7) return 0;
  
  const currentValue = dataChart[dataChart.length - 1][1];
  const weekAgoValue = dataChart[dataChart.length - 7][1];
  
  return weekAgoValue ? ((currentValue - weekAgoValue) / weekAgoValue) * 100 : 0;
};

const OnchainMetrics: React.FC<OnchainMetricsProps> = ({
  companyName,
  companyId,
  identifiers,
  timeRange: initialTimeRange = '7d',
  chartType: initialChartType = 'line',
  color,
  onTimeRangeChange,
  onChartTypeChange,
  data: propData
}) => {
  const [data, setData] = useState<SocialMediaData | null>(propData || null);
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>(initialTimeRange);
  const [chartType, setChartType] = useState<'line' | 'bar'>(initialChartType);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch from backend only if no data is provided
  useEffect(() => {
    if (!propData && identifiers.defillama && companyName) {
      setLoading(true);
      setError(null);
      
      // First try to get data from cache
      fetch(`${apiConfig.endpoints.cache}/${companyName}/onchain/${identifiers.defillama}`)
        .then(async (res) => {
          const result = await res.json();
          if (res.ok && result.success) {
            setData(result.data);
            setLoading(false);
          } else {
            throw new Error(result.error || 'Failed to fetch onchain data');
          }
        })
        .catch((err) => {
          console.error('Error fetching onchain data:', err);
          setError(err.message);
          setLoading(false);
        });
    } else if (propData) {
      setData(propData);
      setLoading(false);
    }
  }, [propData, identifiers.defillama, companyName]);

  // Force refresh handler
  const handleRefresh = () => {
    if (!identifiers.defillama || !companyName) return;
    setRefreshing(true);
    setError(null);
    fetch(`${apiConfig.endpoints.socialMedia}/onchain/${identifiers.defillama}?companyName=${encodeURIComponent(companyName)}&force=true`)
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to fetch onchain data');
        setData(result.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setRefreshing(false));
  };

  const handleTimeRangeChange = (event: React.MouseEvent<HTMLElement>, newTimeRange: '7d' | '30d' | null) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
      if (onTimeRangeChange) {
        onTimeRangeChange(newTimeRange);
      }
    }
  };

  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newChartType: 'line' | 'bar' | null) => {
    if (newChartType !== null) {
      setChartType(newChartType);
      if (onChartTypeChange) {
        onChartTypeChange(newChartType);
      }
    }
  };

  // Helper to extract metrics from SocialMediaData
  const getMetrics = (data: SocialMediaData | null) => {
    if (!data) return null;

    // Calculate 7d and previous 7d sums from feesHistory
    let last7d = 0, prev7d = 0;
    if (Array.isArray(data.feesHistory) && data.feesHistory.length >= 14) {
      const len = data.feesHistory.length;
      last7d = data.feesHistory.slice(len - 7, len).reduce((sum, d) => sum + (d.fees || 0), 0);
      prev7d = data.feesHistory.slice(len - 14, len - 7).reduce((sum, d) => sum + (d.fees || 0), 0);
    }

    return {
      totalDailyFees: data.totalDailyFees ?? data.total24h ?? 0,
      weeklyFees: data.weeklyFees ?? data.total7d ?? 0,
      averageDailyFees: data.averageDailyFees ?? (data.total7d ? data.total7d / 7 : 0),
      transactionGrowth24h: data.change_1d ?? 0,
      transactionGrowth7d: prev7d > 0 ? ((last7d - prev7d) / prev7d) * 100 : 0,
      activeWallets: data.activeWallets ?? 0,
      feesHistory: data.feesHistory ?? []
    };
  };
  const getRecentActivity = (data: SocialMediaData | null) => {
    if (!data) return null;
    return {
      transactions24h: data.transactions24h ?? 0,
      uniqueAddresses24h: data.uniqueAddresses24h ?? 0
    };
  };
  const getDefiLlamaData = (data: SocialMediaData | null) => {
    if (!data) return null;
    return {
      total24h: data.total24h ?? 0,
      total7d: data.total7d ?? 0,
      totalAllTime: data.totalAllTime ?? 0,
      change_1d: data.change_1d ?? 0
    };
  };
  const getProfile = (data: SocialMediaData | null) => {
    if (!data) return null;
    return {
      name: data.profile?.name ?? '',
      website: data.profile?.website ?? ''
    };
  };
  const getChartData = (data: SocialMediaData | null) => {
    if (!data) return [];
    if (Array.isArray((data as any).feesHistory)) {
      return (data as any).feesHistory.map((item: { date: string; fees: number }) => ({ date: new Date(item.date), value: item.fees }));
    }
    return [];
  };

  // Use helpers for rendering
  const metrics = getMetrics(data);
  const recentActivity = getRecentActivity(data);
  const defiLlamaData = getDefiLlamaData(data);
  const profile = getProfile(data);
  const chartData = getChartData(data);

  const renderGrowthChip = (value: number | undefined, label: string) => {
    if (value === undefined) return null;
    const isPositive = value >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Icon size={16} color={isPositive ? '#4caf50' : '#f44336'} style={{ marginRight: 4 }} />
        <Typography 
          variant="body2" 
          sx={{ 
            color: isPositive ? '#4caf50' : '#f44336',
            fontWeight: 'medium'
          }}
        >
          {label}: {formatPercentage(value)}
        </Typography>
      </Box>
    );
  };

  const prepareChartData = () => {
    if (!chartData || chartData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    // Filter data based on time range
    const now = new Date();
    const filteredData = chartData.filter((item: { date: Date; value: number }) => {
      const itemDate = item.date;
      const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (timeRange) {
        case '7d':
          return daysDiff <= 7;
        case '30d':
          return daysDiff <= 30;
        default:
          return true;
      }
    });
    
    const labels = filteredData.map((item: { date: Date; value: number }) =>
      item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
    );
    
    const values = filteredData.map((item: { date: Date; value: number }) => item.value || 0);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: values,
          borderColor: color,
          backgroundColor: chartType === 'bar' ? color : 'rgba(63, 81, 181, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.3,
          fill: chartType === 'line',
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `$${formatNumber(context.raw)}`;
          }
        }
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        }
      },
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return `$${formatCompactNumber(value)}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  // Show loading state
  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <AlertCircle size={48} color="#f44336" style={{ marginBottom: 16 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Data
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRefresh}
          disabled={refreshing}
          startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshCw size={20} />}
        >
          {refreshing ? 'Refreshing...' : 'Try Again'}
        </Button>
      </Box>
    );
  }

  // Show no data state
  if (!data || !metrics) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No onchain data available. Please check the DeFi Llama identifier.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={handleRefresh}
          disabled={refreshing}
          startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshCw size={20} />}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>
    );
  }

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
        <Typography variant="h5" sx={{ 
          fontWeight: 700,
          background: `linear-gradient(45deg, ${color}, ${color}99)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Protocol Analytics
        </Typography>
        <IconButton 
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ 
            bgcolor: `${color}10`,
            '&:hover': { bgcolor: `${color}20` }
          }}
        >
          <RefreshCw size={20} color={color} />
        </IconButton>
      </Box>

      {/* Key Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Daily Revenue Card */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            height: '100%',
            border: '1px solid',
            borderColor: `${color}20`,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: `${color}15`, 
                mr: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                <BarChart size={24} color={color} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Daily Revenue</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color }}>
                  ${formatNumber(metrics.totalDailyFees)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              {renderGrowthChip(metrics.transactionGrowth24h, '24h')}
              {renderGrowthChip(metrics.transactionGrowth7d, '7d')}
            </Box>
          </Box>
        </Grid>
        {/* Active Wallets Card */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            height: '100%',
            border: '1px solid',
            borderColor: `${color}20`,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: `${color}15`, 
                mr: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Users size={24} color={color} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Active Wallets</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color }}>
                  {formatNumber(metrics.activeWallets)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Revenue Chart Section */}
      {defiLlamaData && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ 
            p: 3, 
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid',
            borderColor: `${color}20`
          }}>
            {/* Revenue Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">24h Revenue</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                    ${formatNumber(defiLlamaData.total24h || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">7D Revenue</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                    ${formatNumber(defiLlamaData.total7d || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">All Time Revenue</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                    ${formatNumber(defiLlamaData.totalAllTime || 0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Chart Controls */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: defiLlamaData.change_1d && defiLlamaData.change_1d > 0 ? 'success.main' : 'error.main'
                }}>
                  {defiLlamaData.change_1d ? `${defiLlamaData.change_1d.toFixed(2)}%` : '0%'}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    24h Change
                  </Typography>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <ToggleButtonGroup
                  value={timeRange}
                  exclusive
                  onChange={handleTimeRangeChange}
                  size="small"
                  sx={{ 
                    '& .MuiToggleButton-root.Mui-selected': {
                      bgcolor: `${color}20`,
                      color: color,
                      '&:hover': {
                        bgcolor: `${color}30`
                      }
                    }
                  }}
                >
                  <ToggleButton value="7d">7D</ToggleButton>
                  <ToggleButton value="30d">30D</ToggleButton>
                </ToggleButtonGroup>

                <ToggleButtonGroup
                  value={chartType}
                  exclusive
                  onChange={handleChartTypeChange}
                  size="small"
                  sx={{ 
                    '& .MuiToggleButton-root.Mui-selected': {
                      bgcolor: `${color}20`,
                      color: color,
                      '&:hover': {
                        bgcolor: `${color}30`
                      }
                    }
                  }}
                >
                  <ToggleButton value="line">Line</ToggleButton>
                  <ToggleButton value="bar">Bar</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            {/* Chart */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ color }} />
              </Box>
            ) : chartData && chartData.length > 0 ? (
              <Box sx={{ height: 400, position: 'relative' }}>
                {chartType === 'line' ? (
                  <Line data={prepareChartData()} options={chartOptions} />
                ) : (
                  <Bar data={prepareChartData()} options={chartOptions} />
                )}
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No revenue data available
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Cache Info */}
      {data && (
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          borderRadius: 2, 
          bgcolor: `${color}10`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            Data Source: <span style={{ color, fontWeight: 600 }}>{data._source === 'cache' ? 'Cache' : 'API'}</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last Updated: {data._lastUpdated ? new Date(data._lastUpdated).toLocaleString() : 'N/A'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OnchainMetrics;