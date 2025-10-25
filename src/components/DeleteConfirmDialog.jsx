import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteMember } from '../services/rosterApi';

const DeleteConfirmDialog = ({ open, member, sessionId, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [hardDelete, setHardDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!reason) {
      setError('Please provide a reason for deleting this member');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteMember(sessionId, member.member_id, reason, hardDelete);
      setReason('');
      setHardDelete(false);
      onConfirm();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete member');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setHardDelete(false);
    setError(null);
    onClose();
  };

  if (!member) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          <Typography variant="h6" color="error">
            Delete Member
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            You are about to remove <strong>{member.FULL_NAME}</strong> from the roster.
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Member Details:
          </Typography>
          <Typography variant="body2">
            <strong>Grade:</strong> {member.GRADE}
          </Typography>
          <Typography variant="body2">
            <strong>PASCODE:</strong> {member.ASSIGNED_PAS}
          </Typography>
          <Typography variant="body2">
            <strong>Unit:</strong> {member.ASSIGNED_PAS_CLEARTEXT}
          </Typography>
        </Box>

        <TextField
          fullWidth
          required
          multiline
          rows={3}
          label="Reason for Deletion"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={deleting}
          placeholder="e.g., Duplicate entry - member already processed elsewhere"
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={hardDelete}
              onChange={(e) => setHardDelete(e.target.checked)}
              disabled={deleting}
            />
          }
          label={
            <Box>
              <Typography variant="body2">Hard delete (permanent removal)</Typography>
              <Typography variant="caption" color="text.secondary">
                If unchecked, member will be soft-deleted (marked as removed but recoverable)
              </Typography>
            </Box>
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={!reason || deleting}
          startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
        >
          {deleting ? 'Deleting...' : 'Delete Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
