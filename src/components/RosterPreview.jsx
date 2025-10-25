import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import EditMemberModal from './EditMemberModal';
import AddMemberModal from './AddMemberModal';
import LogoUploadModal from './LogoUploadModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { getRosterPreview } from '../services/rosterApi';

const RosterPreview = ({ sessionId, sessionData, onGeneratePDF, melType = 'initial' }) => {
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentTab, setCurrentTab] = useState(0);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadRosterData();
    }
  }, [sessionId]);

  const loadRosterData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to get roster preview from API if endpoint exists
      // If it fails, fall back to using session data directly
      try {
        const data = await getRosterPreview(sessionId, 'all', page + 1, rowsPerPage);
        setRosterData(data);
      } catch (apiError) {
        // Endpoint might not be implemented yet, use session data
        console.warn('Roster preview API not available, using session data:', apiError);

        // Transform session data into preview format
        const transformedData = transformSessionDataToPreview(sessionData);
        setRosterData(transformedData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load roster data');
    } finally {
      setLoading(false);
    }
  };

  const transformSessionDataToPreview = (data) => {
    if (!data) {
      console.error('No session data provided to transform');
      return null;
    }

    console.log('Transforming session data:', data);

    // NOTE: The current backend upload endpoint doesn't return full roster data
    // It only returns: session_id, pascodes, pascode_unit_map, senior_rater_needed, errors
    // To get full roster preview, we need the /api/roster/preview/{session_id} endpoint
    // For now, we'll show what we have and display a message

    // If we don't have roster data, return a minimal preview structure
    if (!data.eligible_df && !data.dataframe) {
      return {
        session_id: data.session_id || sessionId,
        cycle: data.cycle || 'SSG',
        year: data.year || new Date().getFullYear(),
        edited: false,
        statistics: {
          total_uploaded: 0,
          total_processed: 0,
          eligible: 0,
          ineligible: 0,
          discrepancy: 0,
          btz: 0,
          errors: (data.errors || []).length,
        },
        categories: {
          eligible: [],
          ineligible: [],
          discrepancy: [],
          btz: [],
          small_unit: [],
        },
        errors: data.errors || [],
        pascodes: data.pascodes || [],
        pascode_unit_map: data.pascode_unit_map || {},
        custom_logo: {
          uploaded: false,
          filename: null,
        },
        _note: 'Full roster data requires backend /api/roster/preview endpoint',
      };
    }

    // Convert dataframe arrays to member objects with proper structure
    const convertDataframeToMembers = (df, category) => {
      if (!df || !Array.isArray(df)) return [];

      return df.map((row, index) => ({
        member_id: `row_${category}_${index}`,
        FULL_NAME: row.FULL_NAME || '',
        GRADE: row.GRADE || '',
        SSAN: row.SSAN || '',
        DOR: row.DOR || '',
        ASSIGNED_PAS: row.ASSIGNED_PAS || '',
        ASSIGNED_PAS_CLEARTEXT: row.ASSIGNED_PAS_CLEARTEXT || '',
        DAFSC: row.DAFSC || '',
        PAFSC: row.PAFSC || '',
        TAFMSD: row.TAFMSD || '',
        DATE_ARRIVED_STATION: row.DATE_ARRIVED_STATION || '',
        REENL_ELIG_STATUS: row.REENL_ELIG_STATUS || '',
        UIF_CODE: row.UIF_CODE !== undefined ? row.UIF_CODE : 0,
        GRADE_PERM_PROJ: row.GRADE_PERM_PROJ || '',
        UIF_DISPOSITION_DATE: row.UIF_DISPOSITION_DATE || '',
        '2AFSC': row['2AFSC'] || '',
        '3AFSC': row['3AFSC'] || '',
        '4AFSC': row['4AFSC'] || '',
        REASON: row.REASON || undefined,
        editable: true,
      }));
    };

    // Calculate statistics from the data
    const eligible = data.eligible_df || [];
    const ineligible = data.ineligible_df || [];
    const discrepancy = data.discrepancy_df || [];
    const btz = data.btz_df || [];
    const smallUnit = data.small_unit_df || [];

    const statistics = {
      total_uploaded: (data.dataframe || []).length,
      total_processed: eligible.length + ineligible.length + discrepancy.length + btz.length,
      eligible: eligible.length,
      ineligible: ineligible.length,
      discrepancy: discrepancy.length,
      btz: btz.length,
      errors: (data.errors || data.error_log || []).length,
    };

    return {
      session_id: data.session_id || sessionId,
      cycle: data.cycle || 'SSG',
      year: data.year || new Date().getFullYear(),
      edited: false,
      statistics,
      categories: {
        eligible: convertDataframeToMembers(eligible, 'eligible'),
        ineligible: convertDataframeToMembers(ineligible, 'ineligible'),
        discrepancy: convertDataframeToMembers(discrepancy, 'discrepancy'),
        btz: convertDataframeToMembers(btz, 'btz'),
        small_unit: convertDataframeToMembers(smallUnit, 'small_unit'),
      },
      errors: data.errors || data.error_log || [],
      pascodes: data.pascodes || [],
      pascode_unit_map: data.pascode_unit_map || {},
      custom_logo: {
        uploaded: false,
        filename: null,
      },
    };
  };

  const getCurrentCategoryMembers = () => {
    if (!rosterData) return [];

    // Map tab index to category
    const categories = ['eligible', 'ineligible', 'discrepancy', 'btz', 'small_unit'];
    const category = categories[currentTab];

    return rosterData.categories[category] || [];
  };

  const filteredMembers = getCurrentCategoryMembers().filter((member) =>
    member.FULL_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.ASSIGNED_PAS?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.SSAN?.includes(searchTerm)
  );

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleDeleteMember = (member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleAddMember = () => {
    setAddModalOpen(true);
  };

  const handleTabChange = (_event, newValue) => {
    setCurrentTab(newValue);
    setPage(0); // Reset to first page when switching tabs
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                Roster Review - {rosterData?.cycle} {rosterData?.year}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Session: {sessionId}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadIcon />}
                onClick={() => setLogoModalOpen(true)}
              >
                Logo
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadRosterData}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {/* Backend Integration Notice */}
          {rosterData?._note && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Backend Integration Required</strong>
              </Typography>
              <Typography variant="body2">
                To display full roster data with member details, the backend needs to implement the{' '}
                <code>GET /api/roster/preview/&#123;session_id&#125;</code> endpoint as specified in
                the ROSTER_EDITING_FEATURE_SPEC.md.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Currently showing: Session ID, PASCODEs ({rosterData.pascodes?.length || 0}), and{' '}
                {rosterData.errors?.length || 0} processing errors.
              </Typography>
            </Alert>
          )}

          {/* Statistics Dashboard */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #003594 0%, #002554 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              {/* Eligible */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 120 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(76, 175, 80, 0.2)',
                    borderRadius: '50%',
                    p: 1.5,
                    border: '2px solid rgba(76, 175, 80, 0.5)',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 28, color: '#4caf50' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {rosterData?.statistics.eligible || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Eligible
                  </Typography>
                </Box>
              </Box>

              {/* Ineligible */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 120 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(244, 67, 54, 0.2)',
                    borderRadius: '50%',
                    p: 1.5,
                    border: '2px solid rgba(244, 67, 54, 0.5)',
                  }}
                >
                  <CancelIcon sx={{ fontSize: 28, color: '#f44336' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {rosterData?.statistics.ineligible || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Ineligible
                  </Typography>
                </Box>
              </Box>

              {/* Discrepancy */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 120 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(255, 152, 0, 0.2)',
                    borderRadius: '50%',
                    p: 1.5,
                    border: '2px solid rgba(255, 152, 0, 0.5)',
                  }}
                >
                  <WarningIcon sx={{ fontSize: 28, color: '#ff9800' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {rosterData?.statistics.discrepancy || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Discrepancy
                  </Typography>
                </Box>
              </Box>

              {/* BTZ */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 120 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(33, 150, 243, 0.2)',
                    borderRadius: '50%',
                    p: 1.5,
                    border: '2px solid rgba(33, 150, 243, 0.5)',
                  }}
                >
                  <StarIcon sx={{ fontSize: 28, color: '#2196f3' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {rosterData?.statistics.btz || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    BTZ
                  </Typography>
                </Box>
              </Box>

              {/* Small Unit */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 120 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(156, 39, 176, 0.2)',
                    borderRadius: '50%',
                    p: 1.5,
                    border: '2px solid rgba(156, 39, 176, 0.5)',
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 28, color: '#9c27b0' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {rosterData?.categories.small_unit?.length || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Small Unit
                  </Typography>
                </Box>
              </Box>

              {/* Divider */}
              <Box
                sx={{
                  width: '2px',
                  height: 60,
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  display: { xs: 'none', lg: 'block' },
                }}
              />

              {/* Total */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  minWidth: 140,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  p: 2,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.3)', color: 'white' }}>
                    {rosterData?.statistics.total_processed || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, letterSpacing: 0.5, color: 'white' }}>
                    TOTAL PROCESSED
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Errors */}
          {rosterData?.errors && rosterData.errors.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Processing Warnings ({rosterData.errors.length}):
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {rosterData.errors.slice(0, 3).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
                {rosterData.errors.length > 3 && (
                  <li>... and {rosterData.errors.length - 3} more</li>
                )}
              </ul>
            </Alert>
          )}

          {/* Category Tabs */}
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
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" />
                    Eligible ({rosterData?.statistics.eligible || 0})
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CancelIcon fontSize="small" />
                    Ineligible ({rosterData?.statistics.ineligible || 0})
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon fontSize="small" />
                    Discrepancy ({rosterData?.statistics.discrepancy || 0})
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon fontSize="small" />
                    BTZ ({rosterData?.statistics.btz || 0})
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="small" />
                    Small Unit ({rosterData?.categories.small_unit?.length || 0})
                  </Box>
                }
              />
            </Tabs>
          </Box>

          {/* Search and Add Controls */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by name, PASCODE, or SSAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: 300 }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMember}
            >
              Add Member
            </Button>
          </Box>

          {/* Members Table */}
          <TableContainer component={Paper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Grade</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>PASCODE</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Unit</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status/Reason</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((member) => (
                    <TableRow key={member.member_id} hover>
                      <TableCell>{member.FULL_NAME}</TableCell>
                      <TableCell>{member.GRADE}</TableCell>
                      <TableCell>{member.ASSIGNED_PAS}</TableCell>
                      <TableCell>{member.ASSIGNED_PAS_CLEARTEXT}</TableCell>
                      <TableCell>
                        {member.REASON || (
                          <Chip
                            label="Eligible"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditMember(member)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteMember(member)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No members found matching your search
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredMembers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />

          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={loadRosterData}
            >
              Reprocess All
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={onGeneratePDF}
            >
              Generate PDF
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Modals */}
      <EditMemberModal
        open={editModalOpen}
        member={selectedMember}
        sessionId={sessionId}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMember(null);
        }}
        onSave={() => {
          setEditModalOpen(false);
          setSelectedMember(null);
          loadRosterData();
        }}
      />

      <AddMemberModal
        open={addModalOpen}
        sessionId={sessionId}
        cycle={rosterData?.cycle}
        onClose={() => setAddModalOpen(false)}
        onSave={() => {
          setAddModalOpen(false);
          loadRosterData();
        }}
      />

      <LogoUploadModal
        open={logoModalOpen}
        sessionId={sessionId}
        currentLogo={rosterData?.custom_logo}
        onClose={() => setLogoModalOpen(false)}
        onUpload={() => {
          setLogoModalOpen(false);
          loadRosterData();
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        member={selectedMember}
        sessionId={sessionId}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedMember(null);
        }}
        onConfirm={() => {
          setDeleteDialogOpen(false);
          setSelectedMember(null);
          loadRosterData();
        }}
      />
    </>
  );
};

export default RosterPreview;
