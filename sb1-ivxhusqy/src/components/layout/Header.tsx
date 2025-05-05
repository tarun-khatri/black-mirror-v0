import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Button,
  useTheme,
  alpha,
  Avatar,
  Paper,
} from '@mui/material';
import { Menu, Search, Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../../theme/ThemeProvider';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import CircularProgress from '@mui/material/CircularProgress';

interface HeaderProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ mobileOpen, handleDrawerToggle, onSearch }) => {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const { mode, toggleColorMode } = useThemeContext();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    setLoading(true);
    fetch('/api/cache/companies')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCompanies = searchValue
    ? companies.filter((c) => c.name.toLowerCase().includes(searchValue.toLowerCase()))
    : companies;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setDropdownOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (company: any) => {
    setSearchValue(company.name);
    setDropdownOpen(false);
    setHighlightedIndex(-1);
    onSearch(company.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredCompanies.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      handleSelect(filteredCompanies[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setDropdownOpen(false), 100);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
      elevation={1}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left section with menu and title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <Menu />
          </IconButton>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Black Mirror v0
          </Typography>
        </Box>

        {/* Center section with custom dropdown search */}
        <Box sx={{ position: 'relative', width: { xs: '100%', sm: 400 }, mx: 'auto' }}>
          <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
            <Box>
              <InputBase
                placeholder="Search companies..."
                value={searchValue}
                onChange={handleInputChange}
                onFocus={() => setDropdownOpen(true)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                sx={{
                  color: 'inherit',
                  width: '100%',
                  background: theme.palette.background.default,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  boxShadow: dropdownOpen ? 3 : 0,
                  border: `1.5px solid ${theme.palette.divider}`,
                  fontSize: 16,
                  fontWeight: 500,
                }}
                startAdornment={<Search size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />}
                endAdornment={loading ? <CircularProgress color="inherit" size={18} sx={{ ml: 1 }} /> : null}
              />
              {dropdownOpen && filteredCompanies.length > 0 && (
                <Paper sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  mt: 1,
                  zIndex: 10,
                  maxHeight: 320,
                  overflowY: 'auto',
                  borderRadius: 2,
                  boxShadow: 6,
                }}>
                  {filteredCompanies.slice(0, 10).map((company, idx) => (
                    <Box
                      key={company.id}
                      onMouseDown={() => handleSelect(company)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.2,
                        cursor: 'pointer',
                        bgcolor: idx === highlightedIndex ? theme.palette.action.hover : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <Avatar src={company.logo} alt={company.name?.charAt(0)} sx={{ width: 28, height: 28, mr: 1 }}>
                        {company.name?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" noWrap>{company.name}</Typography>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </ClickAwayListener>
        </Box>

        {/* Right section - dark mode toggle */}
        <Box sx={{ width: { xs: 'auto', sm: '100px' }, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ ml: 1 }}>
              {mode === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;