import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  Button,
  useTheme,
  Divider,
} from '@mui/material';
import { MapPin, Calendar, Link as LinkIcon, Users, Star, BarChart, DollarSign } from 'lucide-react';
import { TwitterProfile } from '../../types';
import { isAccountTracked, trackAccount, untrackAccount } from '../../mock/data';

interface ProfileCardProps {
  profile: TwitterProfile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const theme = useTheme();
  const [tracked, setTracked] = React.useState(isAccountTracked(profile.username));

  const handleTrackToggle = () => {
    if (tracked) {
      untrackAccount(profile.username);
    } else {
      trackAccount(profile.username);
    }
    setTracked(!tracked);
  };

  return (
    <Card sx={{ 
      overflow: 'visible',
      position: 'relative',
      mb: 3,
    }}>
      <Box 
        sx={{
          height: '100px',
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
        }}
      />
      <CardContent sx={{ pt: 0, pb: 2 }}>
        <Avatar
          src={profile.profileImage}
          alt={profile.displayName}
          sx={{
            width: 84,
            height: 84,
            border: `4px solid ${theme.palette.background.paper}`,
            marginTop: '-42px',
            backgroundColor: theme.palette.primary.main,
          }}
        />
        
        <Box sx={{ mt: 1.5, mb: 2 }}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            {profile.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            @{profile.username}
          </Typography>
          
          {profile.isCrypto && (
            <Chip 
              icon={<DollarSign size={14} />} 
              label={`Crypto: ${profile.cryptoToken}`}
              size="small"
              color="warning"
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" paragraph>
              {profile.bio}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ mt: 1.5, mb: 2 }}>
            {profile.location && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <MapPin size={16} color={theme.palette.text.secondary} />
                <Typography variant="body2" color="text.secondary">
                  {profile.location}
                </Typography>
              </Stack>
            )}
          </Stack>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
            <Stack>
              <Typography variant="h6" fontWeight="bold">
                {profile.followers.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Followers
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="h6" fontWeight="bold">
                {profile.following.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Following
              </Typography>
            </Stack>
          </Stack>
        </Box>
        
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant={tracked ? "outlined" : "contained"}
            color={tracked ? "secondary" : "primary"}
            startIcon={tracked ? <Star size={16} /> : <BarChart size={16} />}
            onClick={handleTrackToggle}
            fullWidth
          >
            {tracked ? "Untrack Account" : "Track Account"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;