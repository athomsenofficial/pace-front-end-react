import { useState } from 'react';
import {
  Container,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import FileUpload from './FileUpload';
import RosterPreview from './RosterPreview';
import PascodeForm from './PascodeForm';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  uploadInitialMEL,
  uploadFinalMEL,
  submitInitialMELPascodes,
  submitFinalMELPascodes,
  downloadBlob,
} from '../services/api';

const steps = ['Upload Roster', 'Review & Edit', 'Senior Rater Info', 'Download PDF'];

const MELWorkflow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [sessionData, setSessionData] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [melType, setMelType] = useState('initial'); // 'initial' or 'final'

  const handleFileUpload = async (file, cycle, year) => {
    try {
      const uploadFunc = melType === 'initial' ? uploadInitialMEL : uploadFinalMEL;
      const data = await uploadFunc(file, cycle, year);
      setSessionData({ ...data, cycle, year });
      setActiveStep(1);
    } catch (error) {
      throw error;
    }
  };

  const handleContinueToSeniorRater = () => {
    setActiveStep(2);
  };

  const handlePascodeSubmit = async (sessionId, pascodeInfo) => {
    try {
      const submitFunc =
        melType === 'initial' ? submitInitialMELPascodes : submitFinalMELPascodes;
      const blob = await submitFunc(sessionId, pascodeInfo);
      setPdfBlob(blob);
      setActiveStep(3);
    } catch (error) {
      throw error;
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const filename = `${melType}_mel_${sessionData.session_id}.pdf`;
      downloadBlob(pdfBlob, filename);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSessionData(null);
    setPdfBlob(null);
  };

  const handleMelTypeChange = (event, newValue) => {
    setMelType(newValue);
    handleReset();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* MEL Type Selection */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs
          value={melType}
          onChange={handleMelTypeChange}
          centered
          sx={{
            '& .MuiTab-root': {
              fontSize: '1.1rem',
              fontWeight: 600,
              py: 2,
            },
          }}
        >
          <Tab label="Initial MEL" value="initial" />
          <Tab label="Final MEL" value="final" />
        </Tabs>
      </Paper>

      {/* Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Step Content */}
      <Box sx={{ minHeight: '400px' }}>
        {activeStep === 0 && (
          <FileUpload onUploadSuccess={handleFileUpload} melType={melType} />
        )}

        {activeStep === 1 && sessionData && (
          <Box>
            <RosterPreview
              sessionId={sessionData.session_id}
              sessionData={sessionData}
              onGeneratePDF={handleContinueToSeniorRater}
              melType={melType}
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<NavigateNextIcon />}
                onClick={handleContinueToSeniorRater}
              >
                Continue to Senior Rater Info
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && sessionData && (
          <PascodeForm sessionData={sessionData} onSubmit={handlePascodeSubmit} melType={melType} />
        )}

        {activeStep === 3 && (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                PDF Generated Successfully!
              </Typography>
              <Typography variant="body2">
                Your {melType === 'initial' ? 'Initial' : 'Final'} MEL has been generated and is
                ready to download.
              </Typography>
            </Alert>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                Process New Roster
              </Button>
            </Box>

            {sessionData && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Session Details:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Session ID: {sessionData.session_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PASCODEs Processed: {sessionData.pascodes?.join(', ')}
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default MELWorkflow;
