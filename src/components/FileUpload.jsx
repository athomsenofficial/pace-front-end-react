import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';

const PROMOTION_CYCLES = [
  { value: 'A1C', label: 'A1C - Airman First Class' },
  { value: 'SRA', label: 'SRA - Senior Airman' },
  { value: 'SSG', label: 'SSG - Staff Sergeant' },
  { value: 'TSG', label: 'TSG - Technical Sergeant' },
  { value: 'MSG', label: 'MSG - Master Sergeant' },
  { value: 'SMS', label: 'SMS - Senior Master Sergeant' },
  { value: 'CMS', label: 'CMS - Chief Master Sergeant' },
];

const FileUpload = ({ onUploadSuccess, melType = 'initial' }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cycle, setCycle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!cycle) {
      setError('Please select a promotion cycle');
      return;
    }

    if (!year || year < 2000 || year > 2100) {
      setError('Please enter a valid year');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await onUploadSuccess(selectedFile, cycle, year);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const melTypeLabel = melType === 'initial' ? 'Initial' : 'Final';

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600, mb: 3 }}>
          Upload {melTypeLabel} MEL Roster
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* File Drop Zone */}
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.400',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" fontSize="large" />
                <Typography variant="body1">{selectedFile.name}</Typography>
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a roster file'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select a file (CSV or Excel)
                </Typography>
              </Box>
            )}
          </Box>

          {/* Cycle Selection */}
          <FormControl fullWidth required>
            <InputLabel>Promotion Cycle</InputLabel>
            <Select
              value={cycle}
              label="Promotion Cycle"
              onChange={(e) => setCycle(e.target.value)}
              disabled={uploading}
            >
              {PROMOTION_CYCLES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Year Input */}
          <TextField
            fullWidth
            required
            label="Promotion Year"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            disabled={uploading}
            inputProps={{ min: 2000, max: 2100 }}
          />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Upload Progress */}
          {uploading && <LinearProgress />}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={uploading || !selectedFile || !cycle}
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2 }}
          >
            {uploading ? 'Processing...' : `Upload ${melTypeLabel} MEL`}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
