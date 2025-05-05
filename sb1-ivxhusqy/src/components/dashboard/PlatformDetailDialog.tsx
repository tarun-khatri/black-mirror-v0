import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, formatPercentage } from '../../services';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TwitterMetrics } from './platforms/TwitterMetrics';
import { GitHubMetrics } from './platforms/GitHubMetrics';
import { LinkedInMetrics } from './platforms/LinkedInMetrics';
import { MediumMetrics } from './platforms/MediumMetrics';
import { OnchainMetrics } from './platforms/OnchainMetrics';
import axios from 'axios';
import apiConfig from '../../api/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface PlatformDetailDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ElementType;
  color: string;
  data: any;
  loading: boolean;
}

export const PlatformDetailDialog: React.FC<PlatformDetailDialogProps> = ({ 
  open, 
  onClose, 
  title, 
  icon: Icon, 
  color, 
  data, 
  loading 
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [onchainData, setOnchainData] = useState<any>(null);
  const [onchainLoading, setOnchainLoading] = useState(false);
  
  // Reset state when dialog opens with a new title
  useEffect(() => {
    if (open) {
      console.log(`Dialog opened for ${title} with data:`, data);
    }
  }, [open, title, data]);
  
  // Fetch onchain data when dialog opens for Onchain platform
  useEffect(() => {
    if (open && title === 'Onchain' && data?.profile?.name) {
      setOnchainLoading(true);
      
      // Fetch data from the backend API
      axios.get(`${apiConfig.endpoints.socialMedia}/onchain/${data.profile.name}?companyName=${data.profile.name}`)
        .then(response => {
          if (response.data && response.data.success) {
            setOnchainData(response.data.data);
          } else {
            console.error('Failed to fetch onchain data:', response.data);
          }
        })
        .catch(error => {
          console.error('Error fetching onchain data:', error);
        })
        .finally(() => {
          setOnchainLoading(false);
        });
    }
  }, [open, title, data?.profile?.name]);

  const handleTimeRangeChange = (event: React.MouseEvent<HTMLElement>, newTimeRange: '7d' | '30d' | '90d' | null) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newChartType: 'line' | 'bar' | null) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const renderPlatformContent = () => {
    console.log('Rendering platform content for:', title);
    console.log('Platform data:', data);

    if (!data) {
      console.log('No data available for platform');
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    switch (title) {
      case 'Twitter':
        return <TwitterMetrics data={data} color={color} />;
      case 'GitHub':
        return <GitHubMetrics data={data} color={color} />;
      case 'LinkedIn':
        return <LinkedInMetrics data={data} color={color} />;
      case 'Medium':
        return <MediumMetrics data={data} color={color} />;
      case 'Onchain':
        return (
          <OnchainMetrics 
            data={onchainData || data}
            loading={onchainLoading || loading}
            timeRange={timeRange}
            chartType={chartType}
            color={color}
            onTimeRangeChange={handleTimeRangeChange}
            onChartTypeChange={handleChartTypeChange}
          />
        );
      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Platform not supported</Typography>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: `1px solid ${color}20`,
        pb: 2
      }}>
        <Icon size={24} color={color} style={{ marginRight: 12 }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          {title} Metrics
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderPlatformContent()
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 