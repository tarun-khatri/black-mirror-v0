import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Company } from '../../types/index';

interface AddCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  onAddCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateCompany?: (company: Company) => Promise<void>;
  companyToEdit?: Company | null;
}

interface FormData {
  name: string;
  linkedIn: string;
  twitter: string;
  telegram: string;
  medium: string;
  defillama: string;
}

const defaultFormData: FormData = {
  name: '',
  linkedIn: '',
  twitter: '',
  telegram: '',
  medium: '',
  defillama: '',
};

export const AddCompanyDialog: React.FC<AddCompanyDialogProps> = ({
  open,
  onClose,
  onAddCompany,
  onUpdateCompany,
  companyToEdit,
}) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (companyToEdit) {
      console.log('Setting form data for editing company:', companyToEdit);
      setFormData({
        name: companyToEdit.name,
        linkedIn: companyToEdit.identifiers?.linkedIn || '',
        twitter: companyToEdit.identifiers?.twitter || '',
        telegram: companyToEdit.identifiers?.telegram || '',
        medium: companyToEdit.identifiers?.medium || '',
        defillama: companyToEdit.identifiers?.defillama || '',
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [companyToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const companyData = {
        _id: companyToEdit?._id || `company-${Date.now()}`,
        id: companyToEdit?.id || `company-${Date.now()}`,
        name: formData.name,
        identifiers: {
          ...(companyToEdit?.identifiers || {}),
          linkedIn: formData.linkedIn,
          twitter: formData.twitter,
          telegram: formData.telegram,
          medium: formData.medium,
          defillama: formData.defillama,
        },
        createdAt: companyToEdit?.createdAt || Date.now(),
      };

      console.log('Submitting company data:', companyData);
      console.log('Company to edit:', companyToEdit);

      if (companyToEdit && onUpdateCompany) {
        const updatedCompany = {
          ...companyToEdit,
          ...companyData,
        };
        console.log('Calling onUpdateCompany with:', updatedCompany);
        await onUpdateCompany(updatedCompany);
      } else {
        const { id, ...newCompanyData } = companyData;
        await onAddCompany(newCompanyData);
      }

      handleClose();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {companyToEdit ? 'Edit Company' : 'Add New Company'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Company Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="LinkedIn Handle"
            name="linkedIn"
            value={formData.linkedIn}
            onChange={handleChange}
            placeholder="company-name"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Twitter Handle"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange}
            placeholder="company"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Telegram Handle"
            name="telegram"
            value={formData.telegram}
            onChange={handleChange}
            placeholder="company"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Medium Handle"
            name="medium"
            value={formData.medium}
            onChange={handleChange}
            placeholder="company"
          />
          <TextField
            margin="normal"
            fullWidth
            label="DeFi Llama Identifier"
            name="defillama"
            value={formData.defillama}
            onChange={handleChange}
            placeholder="protocol-name"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !formData.name}
        >
          {isSubmitting
            ? 'Saving...'
            : companyToEdit
            ? 'Update Company'
            : 'Add Company'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 