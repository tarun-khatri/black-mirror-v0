import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { Company } from '../../types/index';

interface LayoutProps {
  children: React.ReactNode;
  onSearch: (query: string) => void;
  onSelectCompany: (company: Company) => void;
  selectedCompanyId?: string | null; // Add selectedCompanyId to LayoutProps
}

const Layout: React.FC<LayoutProps> = ({ children, onSearch, onSelectCompany, selectedCompanyId }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        onSearch={onSearch}
      />
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        onSelectCompany={onSelectCompany}
        selectedCompanyId={selectedCompanyId}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 280px)` },
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
