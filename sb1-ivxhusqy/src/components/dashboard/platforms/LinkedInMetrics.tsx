import React, { useState } from 'react';
import {
  Grid, Typography, Box, Card, CardContent, Avatar, Chip, Link, Divider, Tooltip, Paper, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Button, CardMedia, Stack
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { SocialMediaData, LinkedInData } from '../../../types/index';
import LaunchIcon from '@mui/icons-material/Launch';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import LanguageIcon from '@mui/icons-material/Language';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface LinkedInMetricsProps {
  data: LinkedInData | null;
}

const COLORS = ["#0077b5", "#00bfae", "#fbbc05", "#ea4335", "#34a853", "#a142f4", "#ff7043", "#29b6f6", "#cddc39", "#ab47bc"];

export const LinkedInMetrics: React.FC<LinkedInMetricsProps> = ({ data }) => {
  console.log('LinkedInMetrics data prop:', data);
  if (!data) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Typography variant="h5" fontWeight={700} color="#0077b5" gutterBottom>
          LinkedIn Metrics
        </Typography>
        <Typography color="text.secondary">No LinkedIn data available</Typography>
      </Box>
    );
  }

  const { companyProfile, posts } = data;
  const companyData = companyProfile?.data;
  console.log('LinkedInMetrics companyData:', companyData);
  console.log('LinkedInMetrics posts data:', posts);

  // Company Overview
  const logo = companyData?.profileImage || '';
  const name = companyData?.displayName || companyData?.companyName || 'N/A';
  const industry = companyData?.industry || 'N/A';
  const description = companyData?.bio || 'N/A';
  const website = companyData?.website || '';
  const linkedinUrl = companyData?.linkedinUrl || '';

  // Stats
  const followers = typeof companyData?.followers === 'number' 
    ? companyData.followers 
    : companyData?.followers?.totalFollowers ?? 0;
  const staffCount = companyData?.staffCount ?? 'N/A';
  const staffCountRange = companyData?.staffCountRange ?? 'N/A';
  console.log('LinkedInMetrics followers:', followers, 'staffCount:', staffCount, 'industry:', industry);

  // Engagement Rate
  const engagementRate = companyData?.metrics?.avgEngagementRate ?? companyData?.engagementRate ?? 'N/A';
  console.log('LinkedInMetrics engagementRate:', engagementRate);

  // Funding
  const funding = companyData?.fundingData || {};
  const lastFunding = funding.lastFundingRound || {};
  const fundingAmount = lastFunding.moneyRaised?.amount;
  const fundingCurrency = lastFunding.moneyRaised?.currencyCode;
  const fundingType = lastFunding.fundingType;
  const fundingDate = lastFunding.announcedOn ? `${lastFunding.announcedOn.year}-${String(lastFunding.announcedOn.month).padStart(2, '0')}-${String(lastFunding.announcedOn.day).padStart(2, '0')}` : '';
  const leadInvestors = lastFunding.leadInvestors || [];
  const fundingUrl = lastFunding.fundingRoundCrunchbaseUrl;
  console.log('LinkedInMetrics funding:', funding);

  // Employee Distribution
  const empDist = companyData?.employeeDistribution || {};
  console.log('LinkedInMetrics empDist:', empDist);
  const topFunctions = empDist.byFunction?.slice(0, 5) || [];
  const topSkills = empDist.bySkill?.slice(0, 5) || [];
  const topLocations = empDist.byLocation?.slice(0, 5) || [];
  console.log('LinkedInMetrics topFunctions:', topFunctions, 'topSkills:', topSkills, 'topLocations:', topLocations);

  // Growth
  const growth = companyData?.growth || {};
  const followerGrowth = Array.isArray(growth.followers) ? growth.followers[0] : null;
  console.log('LinkedInMetrics growth:', growth);

  // 24h Follower Change (from followerStats)
  const followerStats = (data as any).followerStats || {};
  const followers24hChange = followerStats.oneDayChange?.count ?? 0;
  const followers24hPercent = followerStats.oneDayChange?.percentage ?? 0;

  // Minimal, modern stat card
  const StatCard = ({ icon, label, value, subValue, color }: any) => (
    <Paper elevation={0} sx={{
      p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #eaf4fb 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, boxShadow: '0 2px 12px #0077b510',
      mb: 2
    }}>
      <Box sx={{ mb: 1, color }}>{icon}</Box>
      <Typography variant="h4" fontWeight={700} color="#222" sx={{ mb: 0.5 }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
      {subValue && <Typography variant="caption" color={color} sx={{ mt: 0.5 }}>{subValue}</Typography>}
    </Paper>
  );

  // Company profile card
  const ProfileCard = () => (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(120deg, #eaf4fb 60%, #fff 100%)', display: 'flex', alignItems: 'center', gap: 3, mb: 3, boxShadow: '0 2px 12px #0077b510' }}>
      {logo && <Avatar src={logo} alt={name} sx={{ width: 72, height: 72, mr: 3, border: '3px solid #0077b5', boxShadow: '0 2px 8px #0077b520' }} />}
      <Box>
        <Typography variant="h5" fontWeight={800} color="#0077b5" sx={{ mb: 0.5 }}>{name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>{industry}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>{description}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {website && <Link href={website} target="_blank" rel="noopener" underline="hover" color="#0077b5" fontWeight={600}>Website</Link>}
          {linkedinUrl && <Link href={linkedinUrl} target="_blank" rel="noopener" underline="hover" color="#0077b5" fontWeight={600}>LinkedIn</Link>}
        </Box>
      </Box>
    </Paper>
  );

  // Stat grid
  const statGrid = (
    <Grid container spacing={3} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          icon={<PeopleIcon fontSize="large" />} 
          label="Followers" 
          value={followers.toLocaleString()} 
          subValue={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {followers24hChange > 0 ? <TrendingUpIcon fontSize="small" color="success" /> : followers24hChange < 0 ? <TrendingDownIcon fontSize="small" color="error" /> : null}
              <span style={{ color: followers24hChange > 0 ? '#4caf50' : followers24hChange < 0 ? '#f44336' : undefined, marginLeft: 4 }}>
                {followers24hChange > 0 ? '+' : ''}{followers24hChange} ({followers24hPercent > 0 ? '+' : ''}{followers24hPercent.toFixed(2)}%)
              </span>
            </span>
          }
          color="#0077b5"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<BusinessIcon fontSize="large" />} label="Employees" value={staffCount} subValue={staffCountRange !== 'N/A' ? staffCountRange : null} color="#00bfae" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<TrendingUpIcon fontSize="large" />} label="Engagement Rate" value={engagementRate !== 'N/A' ? `${(engagementRate * 100).toFixed(2)}%` : 'N/A'} color="#fbbc05" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<LanguageIcon fontSize="large" />} label="Industry" value={industry} color="#ab47bc" />
      </Grid>
    </Grid>
  );

  // Employee Distribution Card
  const EmployeeDistCard = () => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: '#f5faff', boxShadow: '0 2px 12px #0077b510', mb: 3 }}>
      <Typography variant="h6" fontWeight={700} color="#0077b5" sx={{ mb: 2 }}>Employee Distribution</Typography>
      <Grid container spacing={2}>
        {topFunctions.length > 0 && (
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="#0077b5" fontWeight={700} sx={{ mb: 1 }}>By Function</Typography>
            <List dense>
              {topFunctions.map((item, idx) => (
                <ListItem key={idx} sx={{ pl: 0 }}>
                  <ListItemText primary={item.name} secondary={`${item.count} employees`} />
                </ListItem>
              ))}
            </List>
          </Grid>
        )}
        {topSkills.length > 0 && (
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="#0077b5" fontWeight={700} sx={{ mb: 1 }}>By Skill</Typography>
            <List dense>
              {topSkills.map((item, idx) => (
                <ListItem key={idx} sx={{ pl: 0 }}>
                  <ListItemText primary={item.name} secondary={`${item.count} employees`} />
                </ListItem>
              ))}
            </List>
          </Grid>
        )}
        {topLocations.length > 0 && (
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="#0077b5" fontWeight={700} sx={{ mb: 1 }}>By Location</Typography>
            <List dense>
              {topLocations.map((item, idx) => (
                <ListItem key={idx} sx={{ pl: 0 }}>
                  <ListItemText primary={item.name} secondary={`${item.count} employees`} />
                </ListItem>
              ))}
            </List>
          </Grid>
        )}
      </Grid>
    </Paper>
  );

  // Funding Card
  const FundingCard = () => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: '#fff8e1', boxShadow: '0 2px 12px #fbbc0550', mb: 3 }}>
      <Typography variant="h6" fontWeight={700} color="#fbbc05" sx={{ mb: 2 }}>Funding</Typography>
      {fundingType && <Typography variant="body2" sx={{ mb: 0.5 }}><b>Type:</b> {fundingType}</Typography>}
      {fundingAmount && <Typography variant="body2" sx={{ mb: 0.5 }}><b>Amount:</b> {fundingCurrency} {Number(fundingAmount).toLocaleString()}</Typography>}
      {fundingDate && <Typography variant="body2" sx={{ mb: 0.5 }}><b>Date:</b> {fundingDate}</Typography>}
      {leadInvestors.length > 0 && <Typography variant="body2" sx={{ mb: 0.5 }}><b>Lead Investors:</b> {leadInvestors.map((inv: any) => inv.name).join(', ')}</Typography>}
      {fundingUrl && <Link href={fundingUrl} target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', mt: 1, color: '#fbbc05', fontWeight: 600 }}>View on Crunchbase <LaunchIcon sx={{ fontSize: 16, ml: 0.5 }} /></Link>}
    </Paper>
  );

  // Acquisitions Card
  const AcquisitionsCard = () => data.acquisitions && data.acquisitions.length > 0 && (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: '#f3e5f5', boxShadow: '0 2px 12px #ab47bc50', mb: 3 }}>
      <Typography variant="h6" fontWeight={700} color="#ab47bc" sx={{ mb: 2 }}>Recent Acquisitions</Typography>
      <List dense>
        {data.acquisitions.map((acquisition, idx) => (
          <ListItem key={idx} sx={{ pl: 0 }}>
            <ListItemText primary={acquisition.company} secondary={`${acquisition.date}${acquisition.amount ? ` - $${acquisition.amount.toLocaleString()}` : ''}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  // Updates Card
  const UpdatesCard = () => data.recentUpdates && data.recentUpdates.length > 0 && (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: '#e3f2fd', boxShadow: '0 2px 12px #0077b510', mb: 3 }}>
      <Typography variant="h6" fontWeight={700} color="#0077b5" sx={{ mb: 2 }}>Recent Updates</Typography>
      <List dense>
        {data.recentUpdates.map((update, idx) => (
          <ListItem key={idx} sx={{ pl: 0 }}>
            <ListItemText primary={update.type} secondary={`${update.date} - ${update.description}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  // Posts Card
  const PostsCard = () => {
    const recentPosts = posts?.data?.posts || [];
    console.log('PostsCard recentPosts:', recentPosts);
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: '#e3f2fd', boxShadow: '0 2px 12px #0077b510', mb: 3 }}>
        <Typography variant="h6" fontWeight={700} color="#0077b5" sx={{ mb: 2 }}>Recent Posts</Typography>
        {recentPosts.length > 0 ? (
          <List dense>
            {recentPosts.map((post: any, idx: number) => (
              <ListItem key={idx} sx={{ pl: 0 }}>
                <ListItemText 
                  primary={post.text} 
                  secondary={`Posted on ${new Date(post.postedAt).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No recent posts available
          </Typography>
        )}
      </Paper>
    );
  };

  const [postsOpen, setPostsOpen] = useState(false);
  const recentPosts = data?.posts?.data?.posts || [];
  const top5Posts = recentPosts.slice(0, 5);

  // Recent Posts Dialog
  const RecentPostsDialog = () => (
    <Dialog open={postsOpen} onClose={() => setPostsOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Recent LinkedIn Posts</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {top5Posts.length === 0 && (
            <Typography color="text.secondary">No recent posts available.</Typography>
          )}
          {top5Posts.map((post: any, idx: number) => (
            <Card key={idx} variant="outlined" sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                  {post.company?.companyLogo?.[0]?.url && (
                    <Avatar src={post.company.companyLogo[0].url} alt={post.company.name} sx={{ width: 40, height: 40 }} />
                  )}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{post.company?.name || 'Company'}</Typography>
                    {post.company?.url && (
                      <Link href={post.company.url} target="_blank" rel="noopener" color="primary" underline="hover">
                        View on LinkedIn
                      </Link>
                    )}
                  </Box>
                </Stack>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 1 }}>{post.text}</Typography>
                {post.image && Array.isArray(post.image) && post.image.length > 0 && (
                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    {post.image.map((img: any, i: number) => (
                      <CardMedia
                        key={i}
                        component="img"
                        image={img.url}
                        alt={`Post image ${i + 1}`}
                        sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 2 }}
                      />
                    ))}
                  </Stack>
                )}
                {post.video && Array.isArray(post.video) && post.video.length > 0 && (
                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    {post.video.map((vid: any, i: number) => (
                      <video key={i} controls width="200" poster={vid.poster} style={{ borderRadius: 8 }}>
                        <source src={vid.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ))}
                  </Stack>
                )}
                {post.article && post.article.title && (
                  <Card variant="outlined" sx={{ mt: 1, mb: 1, p: 1, bgcolor: '#f5f5f5' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {post.article.smallImage && post.article.smallImage[0]?.url && (
                        <CardMedia
                          component="img"
                          image={post.article.smallImage[0].url}
                          alt={post.article.title}
                          sx={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1 }}
                        />
                      )}
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{post.article.title}</Typography>
                        {post.article.subtitle && <Typography variant="caption" color="text.secondary">{post.article.subtitle}</Typography>}
                        {post.article.link && (
                          <Link href={post.article.link} target="_blank" rel="noopener" color="primary" underline="hover">
                            Read Article
                          </Link>
                        )}
                      </Box>
                    </Stack>
                  </Card>
                )}
                <Stack direction="row" spacing={1} alignItems="center" mt={1} mb={1}>
                  <Chip label={`👍 ${post.likeCount || 0}`} size="small" />
                  <Chip label={`💬 ${post.commentsCount || 0}`} size="small" />
                  <Chip label={`🔁 ${post.repostsCount || 0}`} size="small" />
                  <Chip label={`❤️ ${post.appreciationCount || 0}`} size="small" />
                  <Chip label={`👏 ${post.praiseCount || 0}`} size="small" />
                  <Chip label={`😢 ${post.empathyCount || 0}`} size="small" />
                  <Chip label={`👀 ${post.InterestCount || 0}`} size="small" />
                  <Chip label={`Engagement: ${post.engagement || 0}`} size="small" />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {post.postedDate ? new Date(post.postedDate).toLocaleString() : post.postedAt}
                </Typography>
                <Stack direction="row" spacing={2} mt={1}>
                  {post.postUrl && (
                    <Link href={post.postUrl} target="_blank" rel="noopener" color="primary" underline="hover">
                      View Post
                    </Link>
                  )}
                  {post.shareUrl && (
                    <Link href={post.shareUrl} target="_blank" rel="noopener" color="primary" underline="hover">
                      Share
                    </Link>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPostsOpen(false)} color="primary" variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 3, md: 5 }, background: 'linear-gradient(120deg, #f8fafc 60%, #eaf4fb 100%)', borderRadius: 5 }}>
      {ProfileCard()}
      {statGrid}
      {topFunctions.length + topSkills.length + topLocations.length > 0 && EmployeeDistCard()}
      {fundingType && FundingCard()}
      {AcquisitionsCard()}
      {UpdatesCard()}
      {top5Posts.length > 0 && (
        <Button variant="contained" color="primary" sx={{ mt: 2, mb: 2 }} onClick={() => setPostsOpen(true)}>
          View Recent Posts
        </Button>
      )}
      {RecentPostsDialog()}
    </Box>
  );
};

export default LinkedInMetrics; 