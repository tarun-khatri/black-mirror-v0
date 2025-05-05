import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  useTheme,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  HelpCircle, // Icon for missing data
} from 'lucide-react';
import { CryptoData } from '../../types';

interface CryptoCardProps {
  data: CryptoData | null | undefined;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ data }) => {
  const theme = useTheme();

  // --- Handle Missing or Invalid Data ---
  if (!data) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Token Data
            </Typography>
          </Stack>
          <Alert severity="info">
            No token data available. Please ensure a valid CoinMarketCap ID is set for this company.
            <HelpCircle size={16} style={{ marginLeft: 4, verticalAlign: 'bottom' }} />
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const priceChange = data.priceChangePercentage24h;
  const isPositive = priceChange >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Token Data
          </Typography>
          <Chip
            label={data.symbol}
            color="warning"
            size="small"
            icon={<DollarSign size={14} />}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {data.name}
        </Typography>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            ${data.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            {isPositive ? (
              <TrendingUp size={20} color={theme.palette.success.main} />
            ) : (
              <TrendingDown size={20} color={theme.palette.error.main} />
            )}

            <Typography
              variant="body1"
              color={isPositive ? "success.main" : "error.main"}
              fontWeight="medium"
            >
              {isPositive ? '+' : ''}{data.priceChange24h.toFixed(2)} ({isPositive ? '+' : ''}{priceChange.toFixed(2)}%)
            </Typography>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            24h Change
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Market data for {data.name} ({data.symbol}) token.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CryptoCard;
