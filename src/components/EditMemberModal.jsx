import { useState, useEffect } from 'react';
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
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { editMember } from '../services/rosterApi';

const GRADES = ['AB', 'AMN', 'A1C', 'SRA', 'SSG', 'TSG', 'MSG', 'SMS', 'CMS'];

const EditMemberModal = ({ open, member, sessionId, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (member) {
      // Auto-populate ALL available data from the member
      console.log('EditMemberModal - member data:', member);
      setFormData({
        FULL_NAME: member.FULL_NAME || '',
        GRADE: member.GRADE || 'SSG',
        DOR: member.DOR || '',
        TAFMSD: member.TAFMSD || '',
        DATE_ARRIVED_STATION: member.DATE_ARRIVED_STATION || '',
        PAFSC: member.PAFSC || '',
        DAFSC: member.DAFSC || '',
        ASSIGNED_PAS: member.ASSIGNED_PAS || '',
        ASSIGNED_PAS_CLEARTEXT: member.ASSIGNED_PAS_CLEARTEXT || '',
        REENL_ELIG_STATUS: member.REENL_ELIG_STATUS || member.REENLISTMENT_ELIGIBILITY_STATUS || '',
        UIF_CODE: member.UIF_CODE !== undefined ? member.UIF_CODE : 0,
        GRADE_PERM_PROJ: member.GRADE_PERM_PROJ || member.GRADE_PERMANENT_PROJECTED || '',
        UIF_DISPOSITION_DATE: member.UIF_DISPOSITION_DATE || '',
        '2AFSC': member['2AFSC'] || '',
        '3AFSC': member['3AFSC'] || '',
        '4AFSC': member['4AFSC'] || '',
      });

      setError(null);
    }
  }, [member]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await editMember(sessionId, member.member_id, formData);
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update member');
    } finally {
      setSaving(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" color="primary">
          Edit Member: {member.FULL_NAME}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Info */}
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              label="Full Name"
              value={formData.FULL_NAME || ''}
              onChange={(e) => handleChange('FULL_NAME', e.target.value)}
              disabled={saving}
              placeholder="LAST, FIRST M"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Grade</InputLabel>
              <Select
                value={formData.GRADE || 'SSG'}
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
              label="Primary AFSC"
              value={formData.PAFSC || ''}
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
              value={formData.DOR || ''}
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
              value={formData.TAFMSD || ''}
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
              value={formData.DATE_ARRIVED_STATION || ''}
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
              value={formData.ASSIGNED_PAS || ''}
              onChange={(e) => handleChange('ASSIGNED_PAS', e.target.value)}
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              label="Unit Name"
              value={formData.ASSIGNED_PAS_CLEARTEXT || ''}
              onChange={(e) => handleChange('ASSIGNED_PAS_CLEARTEXT', e.target.value)}
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Desired AFSC (DAFSC)"
              value={formData.DAFSC || ''}
              onChange={(e) => handleChange('DAFSC', e.target.value)}
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Reenlistment Status"
              value={formData.REENL_ELIG_STATUS || ''}
              onChange={(e) => handleChange('REENL_ELIG_STATUS', e.target.value)}
              disabled={saving}
              placeholder="e.g., 1A"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="UIF Code"
              type="number"
              value={formData.UIF_CODE || 0}
              onChange={(e) => handleChange('UIF_CODE', parseInt(e.target.value) || 0)}
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Projected Grade</InputLabel>
              <Select
                value={formData.GRADE_PERM_PROJ || ''}
                label="Projected Grade"
                onChange={(e) => handleChange('GRADE_PERM_PROJ', e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {GRADES.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMemberModal;
