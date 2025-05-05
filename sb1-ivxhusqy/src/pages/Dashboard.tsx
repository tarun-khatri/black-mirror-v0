import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { CompetitorData, Company, CryptoData } from '../types/index';
import { fetchAllCompetitorData } from '../services/competitorApi';
import { CryptoCard, TwitterCard } from '../components/cards';

interface DashboardProps {
  selectedCompany: Company | null;
  onUpdateCompany: (company: Company) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedCompany, onUpdateCompany }) => {
  const [competitorData, setCompetitorData] = useState<CompetitorData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editCmcIdOpen, setEditCmcIdOpen] = useState(false);
  const [cmcIdInput, setCmcIdInput] = useState('');

  // --- Data Fetching Function (moved outside useEffect) ---
  const fetchData = useCallback(async () => {
    if (!selectedCompany) {
      setCompetitorData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setCompetitorData(null);

    try {
      const data = await fetchAllCompetitorData(selectedCompany);
      setCompetitorData(data);
    } catch (err) {
      console.error('Error fetching competitor data:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to fetch data for ${selectedCompany.name}: ${message}. Please try again.`);
      setCompetitorData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCompany]); // Dependency: selectedCompany

  // --- Initial Data Fetching ---
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependency: fetchData ( useCallback makes this safe)

  // --- CMC ID Edit Handlers ---
  const handleEditCmcIdOpen = () => {
    setCmcIdInput(selectedCompany?.cmcSymbolOrId || '');
    setEditCmcIdOpen(true);
  };

  const handleEditCmcIdClose = () => {
    setEditCmcIdOpen(false);
  };

  const handleCmcIdInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCmcIdInput(event.target.value);
  };

  const handleUpdateCmcId = () => {
    if (!selectedCompany) return;

    // Create a new company object with the updated CMC ID
    const updatedCompany: Company = { ...selectedCompany, cmcSymbolOrId: cmcIdInput };

    // Call the onUpdateCompany handler to update the company data
    onUpdateCompany(updatedCompany);

    // Close the dialog
    handleEditCmcIdClose();

    // Re-fetch data to update the dashboard
    fetchData();
  };

  // --- Render Logic ---

  if (!selectedCompany) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 64px - 48px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Competitor Analysis Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 3 }}>
          Select a company from the sidebar to analyze their social media presence across Twitter, LinkedIn, and Medium.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
        <CircularProgress sx={{ mr: 2 }} />
        <Typography variant="body1">Loading data for {selectedCompany.name}...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!competitorData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No data could be fetched for {selectedCompany.name}. Ensure identifiers are correct or try again later.</Typography>
      </Box>
    );
  }

  const hasAnyData = competitorData.twitter || competitorData.linkedIn || competitorData.medium || competitorData.cryptoData;

  return (
    <Box>
      {!hasAnyData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No social media data could be retrieved for the configured identifiers for {selectedCompany.name}.
        </Alert>
      )}

      {/* --- Crypto Section --- */}
      {competitorData.cryptoData && (
        <CryptoCard data={competitorData.cryptoData} />
      )}

      {hasAnyData && (
        <Grid container spacing={3}>
          {/* --- Twitter Section (Beautiful Card) --- */}
          {competitorData.twitter && (
            <Grid item xs={12}>
              <TwitterCard data={competitorData.twitter} />
            </Grid>
          )}

          {/* --- LinkedIn Section (Example) --- */}
          {competitorData.linkedIn && (
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>LinkedIn</Typography>
                <Typography variant="subtitle1">{competitorData.linkedIn.companyProfile.data.name}</Typography>
                <Typography variant="body2">Followers: {competitorData.linkedIn.companyProfile.data.followers.toLocaleString() || 'N/A'}</Typography>
                <Typography variant="body2">Bio: {competitorData.linkedIn.companyProfile.data.description || 'N/A'}</Typography>
              </Paper>
            </Grid>
          )}

          {/* --- Medium Section (Example) --- */}
          {competitorData.medium && (
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Medium</Typography>
                <Typography variant="subtitle1">{competitorData.medium.profile.data.name}</Typography>
                <Typography variant="body2">Followers: {competitorData.medium.profile.data.followers.toLocaleString() || 'N/A'}</Typography>
                <Typography variant="body2">Bio: {competitorData.medium.profile.data.description || 'N/A'}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* --- Edit CMC ID Dialog --- */}
      <Dialog open={editCmcIdOpen} onClose={handleEditCmcIdClose}>
        <DialogTitle>Edit CoinMarketCap ID</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="cmcId"
            label="CoinMarketCap Symbol or ID"
            type="text"
            fullWidth
            value={cmcIdInput}
            onChange={handleCmcIdInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCmcIdClose}>Cancel</Button>
          <Button onClick={handleUpdateCmcId}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
