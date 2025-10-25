import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { uploadLogo, deleteLogo, getLogo } from '../services/rosterApi';

const LogoUploadModal = ({ open, sessionId, currentLogo, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadLogo(sessionId, selectedFile);
      setSelectedFile(null);
      setPreview(null);
      onUpload();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      await deleteLogo(sessionId);
      onUpload();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete logo');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" color="primary">
          Custom Logo
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Current Logo */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Logo:
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            {currentLogo?.uploaded ? (
              <Box>
                <ImageIcon sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2">{currentLogo.filename}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Custom logo uploaded
                </Typography>
              </Box>
            ) : (
              <Box>
                <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Default Logo (fiftyonefss.jpeg)
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Upload New Logo */}
        <Typography variant="subtitle2" gutterBottom>
          Upload New Logo:
        </Typography>

        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.400',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
            mb: 2,
          }}
        >
          <input {...getInputProps()} />
          {preview ? (
            <Box>
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: '200px', maxHeight: '200px', marginBottom: '8px' }}
              />
              <Typography variant="body2">{selectedFile?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {(selectedFile?.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          ) : (
            <Box>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                or click to select
              </Typography>
            </Box>
          )}
        </Box>

        <Alert severity="info" variant="outlined">
          <Typography variant="caption">
            <strong>Supported formats:</strong> PNG, JPG, JPEG
            <br />
            <strong>Max size:</strong> 5MB
            <br />
            <strong>Recommended:</strong> 100x100 to 300x300 pixels (will be resized to fit 1 inch
            square in PDF)
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {currentLogo?.uploaded && (
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleting || uploading}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Removing...' : 'Remove Custom Logo'}
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleClose} disabled={uploading || deleting}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || uploading || deleting}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoUploadModal;
