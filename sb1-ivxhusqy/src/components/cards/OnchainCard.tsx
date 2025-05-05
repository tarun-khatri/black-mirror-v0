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
  Chip,
} from '@mui/material';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import { formatNumber, formatPercentage } from '../../services/onchainApi';
import { useNavigate } from 'react-router-dom';

interface OnchainCardProps {
  data: {
    profile: {
      name: string;
      logo: string;
      website?: string;
      description: string;
    };
    metrics: {
      totalTransactions: number;
      activeWallets: number;
      averageTransactionValue: number;
      transactionGrowth24h: number;
      activeWalletsGrowth24h: number;
      transactionGrowth7d: number;
    };
    recentActivity: {
      transactions24h: number;
      uniqueAddresses24h: number;
    };
  };
}

const OnchainCard: React.FC<OnchainCardProps> = ({ data }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { profile, metrics } = data;

  const renderGrowthChip = (value: number) => {
    const isPositive = value >= 0;
    return (
      <Chip
        icon={isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        label={formatPercentage(Math.abs(value))}
        color={isPositive ? 'success' : 'error'}
        size="small"
      />
    );
  };

  const handleClick = () => {
    navigate(`/metrics/${profile.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
      onClick={handleClick}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={profile.logo}
              alt={profile.name}
              sx={{ width: 48, height: 48 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {profile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.description}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          {/* Key Metrics */}
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Users size={16} color={theme.palette.text.secondary} />
                <Typography variant="body2" color="text.secondary">
                  Active Wallets
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">
                  {formatNumber(metrics.activeWallets)}
                </Typography>
                {renderGrowthChip(metrics.activeWalletsGrowth24h)}
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Transaction Growth (24h)
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">
                  {formatPercentage(metrics.transactionGrowth24h)}
                </Typography>
                {renderGrowthChip(metrics.transactionGrowth24h)}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OnchainCard; 