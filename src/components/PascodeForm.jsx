import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Divider,
  Alert,
  Paper,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import BusinessIcon from '@mui/icons-material/Business';

const PascodeForm = ({ sessionData, onSubmit, melType = 'initial' }) => {
  const [pascodeInfo, setPascodeInfo] = useState({});
  const [smallUnitSR, setSmallUnitSR] = useState({
    srid: '',
    senior_rater_name: '',
    senior_rater_rank: '',
    senior_rater_title: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    if (sessionData?.pascodes) {
      const initialPascodeInfo = {};
      sessionData.pascodes.forEach((pascode) => {
        initialPascodeInfo[pascode] = {
          srid: '',
          senior_rater_name: '',
          senior_rater_rank: '',
          senior_rater_title: '',
        };
      });
      setPascodeInfo(initialPascodeInfo);
    }
  }, [sessionData]);

  const handlePascodeChange = (pascode, field, value) => {
    setPascodeInfo((prev) => ({
      ...prev,
      [pascode]: {
        ...prev[pascode],
        [field]: value,
      },
    }));
  };

  const handleSmallUnitChange = (field, value) => {
    setSmallUnitSR((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = { ...pascodeInfo };

      // Add small unit senior rater if needed
      if (sessionData?.senior_rater_needed && smallUnitSR.srid) {
        payload.small_unit_sr = smallUnitSR;
      }

      await onSubmit(sessionData.session_id, payload);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    // Check all pascodes have complete info
    const pascodeValid = Object.values(pascodeInfo).every(
      (info) =>
        info.srid && info.senior_rater_name && info.senior_rater_rank && info.senior_rater_title
    );

    // If small unit SR needed, check it's complete
    const smallUnitValid =
      !sessionData?.senior_rater_needed ||
      (smallUnitSR.srid &&
        smallUnitSR.senior_rater_name &&
        smallUnitSR.senior_rater_rank &&
        smallUnitSR.senior_rater_title);

    return pascodeValid && smallUnitValid;
  };

  const handleTabChange = (_event, newValue) => {
    setCurrentTab(newValue);
  };

  const melTypeLabel = melType === 'initial' ? 'Initial' : 'Final';
  const pascodes = sessionData?.pascodes || [];
  const hasMultiplePascodes = pascodes.length > 1;
  const hasSmallUnit = sessionData?.senior_rater_needed;

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
            Enter Senior Rater Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Session ID: <Chip label={sessionData?.session_id} size="small" />
          </Typography>
        </Box>

        {sessionData?.errors && sessionData.errors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Processing Warnings:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {sessionData.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Tabs for Multiple PASCODEs or Small Unit */}
          {(hasMultiplePascodes || hasSmallUnit) && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 600,
                  },
                }}
              >
                {pascodes.map((pascode) => (
                  <Tab
                    key={pascode}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        {pascode}
                        {sessionData?.pascode_unit_map?.[pascode] && (
                          <Chip
                            label={sessionData.pascode_unit_map[pascode]}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                  />
                ))}
                {hasSmallUnit && (
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" />
                        Small Unit SR
                      </Box>
                    }
                  />
                )}
              </Tabs>
            </Box>
          )}

          {/* PASCODE Forms */}
          {pascodes.map((pascode, index) => (
            <Box
              key={pascode}
              sx={{ display: currentTab === index ? 'block' : 'none' }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary">
                    PASCODE: {pascode}
                  </Typography>
                  {sessionData?.pascode_unit_map?.[pascode] && (
                    <Chip
                      label={sessionData.pascode_unit_map[pascode]}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Senior Rater ID"
                    value={pascodeInfo[pascode]?.srid || ''}
                    onChange={(e) => handlePascodeChange(pascode, 'srid', e.target.value)}
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Senior Rater Rank"
                    value={pascodeInfo[pascode]?.senior_rater_rank || ''}
                    onChange={(e) =>
                      handlePascodeChange(pascode, 'senior_rater_rank', e.target.value)
                    }
                    disabled={submitting}
                    placeholder="e.g., Col, Lt Col, etc."
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Senior Rater Name"
                    value={pascodeInfo[pascode]?.senior_rater_name || ''}
                    onChange={(e) =>
                      handlePascodeChange(pascode, 'senior_rater_name', e.target.value)
                    }
                    disabled={submitting}
                    placeholder="e.g., John A. Smith"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Senior Rater Title"
                    value={pascodeInfo[pascode]?.senior_rater_title || ''}
                    onChange={(e) =>
                      handlePascodeChange(pascode, 'senior_rater_title', e.target.value)
                    }
                    disabled={submitting}
                    placeholder="e.g., Commander, Chief, etc."
                  />
                </Grid>
              </Grid>
              </Paper>
            </Box>
          ))}

          {/* Small Unit Senior Rater */}
          {sessionData?.senior_rater_needed && (
            <Box
              sx={{
                display: currentTab === pascodes.length ? 'block' : 'none',
              }}
            >
              {hasMultiplePascodes && <Divider sx={{ my: 3 }} />}
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  mb: 3,
                  border: '2px solid',
                  borderColor: 'info.main',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="info.main" gutterBottom>
                  Small Unit Senior Rater
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This roster includes small units (10 or fewer personnel) that require a designated
                  senior rater.
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Senior Rater ID"
                      value={smallUnitSR.srid}
                      onChange={(e) => handleSmallUnitChange('srid', e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Senior Rater Rank"
                      value={smallUnitSR.senior_rater_rank}
                      onChange={(e) => handleSmallUnitChange('senior_rater_rank', e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Senior Rater Name"
                      value={smallUnitSR.senior_rater_name}
                      onChange={(e) => handleSmallUnitChange('senior_rater_name', e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Senior Rater Title"
                      value={smallUnitSR.senior_rater_title}
                      onChange={(e) => handleSmallUnitChange('senior_rater_title', e.target.value)}
                      disabled={submitting}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Progress Bar */}
          {submitting && <LinearProgress sx={{ mb: 2 }} />}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={submitting || !isFormValid()}
            startIcon={<SendIcon />}
            sx={{ mt: 2 }}
          >
            {submitting ? `Generating ${melTypeLabel} MEL PDF...` : `Generate ${melTypeLabel} MEL`}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PascodeForm;
