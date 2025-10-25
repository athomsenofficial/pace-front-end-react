import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addMember } from '../services/rosterApi';

const GRADES = ['AB', 'AMN', 'A1C', 'SRA', 'SSG', 'TSG', 'MSG', 'SMS', 'CMS'];
const CATEGORIES = [
  { value: 'eligible', label: 'Eligible' },
  { value: 'ineligible', label: 'Ineligible' },
  { value: 'discrepancy', label: 'Discrepancy' },
  { value: 'btz', label: 'BTZ (Below The Zone)' },
];

const AddMemberModal = ({ open, sessionId, cycle, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    FULL_NAME: '',
    GRADE: cycle || 'SSG',
    SSAN: '',
    DOR: '',
    TAFMSD: '',
    DATE_ARRIVED_STATION: '',
    PAFSC: '',
    DAFSC: '',
    ASSIGNED_PAS: '',
    ASSIGNED_PAS_CLEARTEXT: '',
    REENL_ELIG_STATUS: '1A',
    UIF_CODE: 0,
  });
  const [category, setCategory] = useState('eligible');
  const [reason, setReason] = useState('');
  const [runEligibilityCheck, setRunEligibilityCheck] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      FULL_NAME: '',
      GRADE: cycle || 'SSG',
      SSAN: '',
      DOR: '',
      TAFMSD: '',
      DATE_ARRIVED_STATION: '',
      PAFSC: '',
      DAFSC: '',
      ASSIGNED_PAS: '',
      ASSIGNED_PAS_CLEARTEXT: '',
      REENL_ELIG_STATUS: '1A',
      UIF_CODE: 0,
    });
    setCategory('eligible');
    setReason('');
    setRunEligibilityCheck(false);
    setError(null);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.FULL_NAME || !formData.DOR || !formData.TAFMSD || !formData.PAFSC ||
        !formData.ASSIGNED_PAS || !formData.ASSIGNED_PAS_CLEARTEXT) {
      setError('Please fill in all required fields');
      return;
    }

    if (!reason) {
      setError('Please provide a reason for adding this member');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await addMember(sessionId, {
        category,
        data: formData,
        reason,
        run_eligibility_check: runEligibilityCheck,
      });

      handleReset();
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" color="primary">
          Add New Member
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Category Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Add to Category</InputLabel>
              <Select
                value={category}
                label="Add to Category"
                onChange={(e) => setCategory(e.target.value)}
                disabled={saving}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Basic Info */}
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              label="Full Name"
              value={formData.FULL_NAME}
              onChange={(e) => handleChange('FULL_NAME', e.target.value)}
              disabled={saving}
              placeholder="LAST, FIRST M"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Grade</InputLabel>
              <Select
                value={formData.GRADE}
                label="Grade"
                onChange={(e) => handleChange('GRADE', e.target.value)}
                disabled={saving}
              >
                {GRADES.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SSAN (Last 4)"
              value={formData.SSAN}
              onChange={(e) => handleChange('SSAN', e.target.value)}
              disabled={saving}
              inputProps={{ maxLength: 4 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Primary AFSC"
              value={formData.PAFSC}
              onChange={(e) => handleChange('PAFSC', e.target.value)}
              disabled={saving}
              placeholder="e.g., 3D1X7"
            />
          </Grid>

          {/* Dates */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Date of Rank (DOR)"
              value={formData.DOR}
              onChange={(e) => handleChange('DOR', e.target.value)}
              disabled={saving}
              placeholder="DD-MMM-YYYY"
              helperText="Format: 01-JAN-2022"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="TAFMSD"
              value={formData.TAFMSD}
              onChange={(e) => handleChange('TAFMSD', e.target.value)}
              disabled={saving}
              placeholder="DD-MMM-YYYY"
              helperText="Total Active Service Date"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Date Arrived Station (DAS)"
              value={formData.DATE_ARRIVED_STATION}
              onChange={(e) => handleChange('DATE_ARRIVED_STATION', e.target.value)}
              disabled={saving}
              placeholder="DD-MMM-YYYY"
            />
          </Grid>

          {/* Unit Info */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="PASCODE"
              value={formData.ASSIGNED_PAS}
              onChange={(e) => handleChange('ASSIGNED_PAS', e.target.value)}
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              label="Unit Name"
              value={formData.ASSIGNED_PAS_CLEARTEXT}
              onChange={(e) => handleChange('ASSIGNED_PAS_CLEARTEXT', e.target.value)}
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Desired AFSC (DAFSC)"
              value={formData.DAFSC}
              onChange={(e) => handleChange('DAFSC', e.target.value)}
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Reenlistment Status"
              value={formData.REENL_ELIG_STATUS}
              onChange={(e) => handleChange('REENL_ELIG_STATUS', e.target.value)}
              disabled={saving}
              placeholder="e.g., 1A, 2B"
            />
          </Grid>

          {/* Reason for Addition */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={2}
              label="Reason for Addition"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={saving}
              placeholder="e.g., Member missing from original MILPDS export"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={runEligibilityCheck}
                  onChange={(e) => setRunEligibilityCheck(e.target.checked)}
                  disabled={saving}
                />
              }
              label="Run eligibility check (recommended - validates dates and requirements)"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {saving ? 'Adding...' : 'Add Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberModal;
