import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
  ListItemButton,
  Tooltip,
  Avatar,
  Badge,
  IconButton,
} from '@mui/material';
import {
  BarChart,
  TrendingUp,
  Users,
  Star,
  Info,
  Settings,
  Building,
  PlusCircle,
  Pencil,
} from 'lucide-react';
import { Company } from '../../types/index';
import { AddCompanyDialog } from '../company/AddCompanyDialog';

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  onSelectCompany: (company: Company) => void;
  selectedCompanyId?: string | null;
}

const drawerWidth = 280;

const Sidebar: React.FC<SidebarProps> = ({ 
  mobileOpen,
  handleDrawerToggle,
  onSelectCompany,
  selectedCompanyId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [companies, setCompanies] = useState<Company[]>([]);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/cache/companies');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleAddCompany = async (newCompany: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Save to backend
      const response = await fetch('/api/cache/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompany),
      });

      if (!response.ok) {
        throw new Error('Failed to save company');
      }

      const savedCompany = await response.json();
      // Update local state with the company returned from the backend (which includes id)
      setCompanies(prevCompanies => [...prevCompanies, savedCompany]);
      setAddCompanyOpen(false);
    } catch (err) {
      console.error('Error adding company:', err);
      setError('Failed to add company');
    }
  };

  const handleUpdateCompany = async (updatedCompany: Company) => {
    try {
      console.log('Updating company with data:', updatedCompany);
      // Update in backend using _id instead of id
      const response = await fetch(`/api/cache/companies/${updatedCompany._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCompany),
      });

      if (!response.ok) {
        throw new Error('Failed to update company');
      }

      const savedCompany = await response.json();
      console.log('Received updated company from backend:', savedCompany);
      
      // Update local state
      setCompanies(prevCompanies => {
        const updatedCompanies = prevCompanies.map(company => 
          company._id === savedCompany._id ? savedCompany : company
        );
        console.log('Updated companies list:', updatedCompanies);
        return updatedCompanies;
      });
      
      // Reset the edit state and close the dialog
      setCompanyToEdit(null);
      setAddCompanyOpen(false);
    } catch (err) {
      console.error('Error updating company:', err);
      setError('Failed to update company');
    }
  };

  const handleEditCompany = (company: Company) => {
    // Set the company to edit and open the dialog
    setCompanyToEdit(company);
    setAddCompanyOpen(true);
  };

  const handleCloseDialog = () => {
    // Reset the edit state and close the dialog
    setCompanyToEdit(null);
    setAddCompanyOpen(false);
  };

  const getLogoURL = (company: Company) => {
    if (!company) return '';
    
    // First try LinkedIn logo from the company data
    if (company.logo) {
      return company.logo;
    }
    
    // Then try Clearbit
    const formattedName = company.name.toLowerCase().replace(/\s+/g, '-');
    return `https://logo.clearbit.com/${formattedName}.com`;
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Companies
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {loading ? (
          <ListItem key="loading">
            <ListItemText primary="Loading companies..." />
          </ListItem>
        ) : (
          companies.map((company) => {
            const logoURL = getLogoURL(company);
            return (
              <ListItem 
                key={company.id} 
                disablePadding
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCompany(company);
                    }}
                  >
                    <Pencil size={16} color={theme.palette.text.secondary} />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={selectedCompanyId === company.id}
                  onClick={() => onSelectCompany(company)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      src={logoURL}
                      alt={company.name.charAt(0)}
                      sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.light, fontSize: '0.8rem' }}
                      imgProps={{ 
                        onError: (e: any) => { 
                          if (e.target.src === company.logo) {
                            const formattedName = company.name.toLowerCase().replace(/\s+/g, '-');
                            e.target.src = `https://logo.clearbit.com/${formattedName}.com`;
                          } else {
                            e.target.src = '';
                          }
                        } 
                      }}
                    >
                      {company.name.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={company.name}
                    primaryTypographyProps={{
                      noWrap: true,
                      variant: 'body2',
                      fontWeight: selectedCompanyId === company.id ? 'bold' : 'medium',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })
        )}
        
        <ListItem key="add-company" disablePadding>
          <ListItemButton
            onClick={() => {
              setCompanyToEdit(null);
              setAddCompanyOpen(true);
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PlusCircle size={22} color={theme.palette.text.secondary} />
            </ListItemIcon>
            <ListItemText
              primary="Add New Company"
              primaryTypographyProps={{
                color: 'textSecondary',
                variant: 'body2',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />
      <List>
        <ListItem key="settings" disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings size={22} color={theme.palette.text.secondary} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>

      <AddCompanyDialog
        open={addCompanyOpen}
        onClose={handleCloseDialog}
        onAddCompany={handleAddCompany}
        onUpdateCompany={handleUpdateCompany}
        companyToEdit={companyToEdit}
      />
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;