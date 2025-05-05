import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip, Grid } from '@mui/material';
import { OnchainData } from '../types';
import { formatNumber, formatPercentage } from '../utils/formatters';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PeopleIcon from '@mui/icons-material/People';

interface OnchainCardProps {
  data: OnchainData;
}

const OnchainCard: React.FC<OnchainCardProps> = ({ data }) => {
  const { profile, metrics, recentActivity } = data;

  const renderGrowthChip = (value: number) => {
    const isPositive = value >= 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
        <Chip
          icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
          label={`${isPositive ? '+' : ''}${formatPercentage(value)}`}
          color={isPositive ? 'success' : 'error'}
          size="small"
        />
      </Box>
    );
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profile.logo}
            alt={profile.name}
            sx={{ 
              width: 48, 
              height: 48,
              mr: 2,
              backgroundColor: 'primary.main'
            }}
          >
            <AccountBalanceWalletIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {profile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.description}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Total Transactions */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SwapHorizIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Transactions
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatNumber(metrics.totalTransactions)}
              </Typography>
              {renderGrowthChip(metrics.transactionGrowth24h)}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {formatNumber(recentActivity.transactions24h)} in last 24h
              </Typography>
            </Box>
          </Grid>

          {/* Active Wallets */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Active Wallets
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatNumber(metrics.activeWallets)}
              </Typography>
              {renderGrowthChip(metrics.activeWalletsGrowth24h)}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {formatNumber(recentActivity.uniqueAddresses24h)} unique in 24h
              </Typography>
            </Box>
          </Grid>

          {/* Average Transaction Value */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWalletIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Avg Transaction Value
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${formatNumber(metrics.averageTransactionValue)}
              </Typography>
              {renderGrowthChip(metrics.transactionGrowth7d)}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                7-day average
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OnchainCard; 