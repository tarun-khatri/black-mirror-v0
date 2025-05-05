import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { formatNumber } from '../../services';

export interface PlatformCardProps {
  title: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  metrics?: any;
  loading?: boolean;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ 
  title, 
  icon: Icon, 
  color, 
  onClick, 
  metrics, 
  loading 
}) => {
  console.log(`PlatformCard rendered for ${title} with metrics:`, metrics);
  
  const getMetricValue = () => {
    if (!metrics) return 0;
    
    console.log(`Getting metric value for ${title}:`, metrics);
    
    switch (title) {
      case 'Twitter':
        return metrics.profile?.followers || 0;
      case 'LinkedIn':
        return metrics.companyProfile?.data?.totalFollowers || 0;
      case 'Medium':
        return metrics.profile?.followers || 0;
      case 'Onchain':
        console.log('Onchain metrics:', metrics);
        return metrics.metrics?.activeWallets || 0;
      case 'GitHub':
        return metrics.profile?.followers || 0;
      default:
        return 0;
    }
  };

  const getMetricLabel = () => {
    switch (title) {
      case 'Twitter':
        return 'Followers';
      case 'LinkedIn':
        return 'Followers';
      case 'Medium':
        return 'Followers';
      case 'Onchain':
        return 'Active Wallets';
      case 'GitHub':
        return 'Followers';
      default:
        return 'Metric';
    }
  };

  const get24hChange = () => {
    if (title === 'LinkedIn' && metrics) {
      const change = metrics.followers24hChange;
      const percent = metrics.followers24hPercent;
      if (typeof change === 'number' && typeof percent === 'number') {
        return { change, percent };
      }
    }
    return null;
  };

  const change24h = get24hChange();

  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: metrics ? 'pointer' : 'not-allowed',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: metrics ? 'translateY(-5px)' : 'none',
          boxShadow: metrics ? 3 : 1,
        },
        borderLeft: `4px solid ${color}`,
        opacity: metrics ? 1 : 0.7,
      }}
      onClick={metrics ? onClick : undefined}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon size={24} color={color} />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : metrics ? (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {formatNumber(getMetricValue())}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getMetricLabel()}
            </Typography>
            {title === 'LinkedIn' && change24h && (
              <Typography variant="body2" sx={{ color: change24h.change === 0 ? 'text.secondary' : change24h.change > 0 ? 'success.main' : 'error.main', display: 'flex', alignItems: 'center', mt: 0.5 }}>
                {change24h.change > 0 ? '+' : ''}{change24h.change} ({change24h.percent.toFixed(2)}%) 24h
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 