import React from 'react';
import { Grid, Typography, Box, Paper } from '@mui/material';
import { GitBranch, Star, GitPullRequest, Users } from 'lucide-react';
import { formatNumber } from '../../../services';

interface GitHubMetricsProps {
  data: any;
  color: string;
}

export const GitHubMetrics: React.FC<GitHubMetricsProps> = ({ data, color }) => {
  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No GitHub data available
        </Typography>
      </Box>
    );
  }

  // Safely get values with fallbacks to prevent undefined errors
  const totalRepositories = data.metrics?.totalRepositories || 0;
  const publicRepositories = data.metrics?.publicRepositories || 0;
  const totalStars = data.metrics?.totalStars || 0;
  const averageStarsPerRepo = data.metrics?.averageStarsPerRepo || 0;
  const totalForks = data.metrics?.totalForks || 0;
  const averageForksPerRepo = data.metrics?.averageForksPerRepo || 0;
  const totalContributors = data.metrics?.totalContributors || 0;
  const activeContributors = data.metrics?.activeContributors || 0;
  const pullRequests30d = data.recentActivity?.pullRequests30d || 0;
  const commits30d = data.recentActivity?.commits30d || 0;

  return (
    <>
      {/* Key Metrics Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
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
              <GitBranch size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Total Repositories
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: color }}>
              {formatNumber(totalRepositories)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatNumber(publicRepositories)} public
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
              <Star size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Total Stars
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: color }}>
              {formatNumber(totalStars)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatNumber(averageStarsPerRepo)} avg. per repo
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
              <GitPullRequest size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Total Forks
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: color }}>
              {formatNumber(totalForks)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatNumber(averageForksPerRepo)} avg. per repo
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
              <Users size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Contributors
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: color }}>
              {formatNumber(totalContributors)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatNumber(activeContributors)} active
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
        Recent Activity
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GitPullRequest size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Recent Pull Requests
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
              {formatNumber(pullRequests30d)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Last 30 days
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GitBranch size={20} color={color} style={{ marginRight: 8 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Recent Commits
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
              {formatNumber(commits30d)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Last 30 days
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Top Repositories Section */}
      {data.topRepositories && data.topRepositories.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            Top Repositories
          </Typography>
          <Grid container spacing={3}>
            {data.topRepositories.map((repo: any, index: number) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                        {repo.name || 'Unnamed Repository'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {repo.description || 'No description available'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star size={16} color={color} style={{ marginRight: 4 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {formatNumber(repo.stars || 0)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GitBranch size={16} color={color} style={{ marginRight: 4 }} />
                      <Typography variant="body2">
                        {formatNumber(repo.forks || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GitPullRequest size={16} color={color} style={{ marginRight: 4 }} />
                      <Typography variant="body2">
                        {formatNumber(repo.pullRequests || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Users size={16} color={color} style={{ marginRight: 4 }} />
                      <Typography variant="body2">
                        {formatNumber(repo.contributors || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </>
  );
}; 