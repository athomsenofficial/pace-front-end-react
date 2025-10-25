# PACE Front-End React

**Promotion and Career Eligibility Management System** - Air Force themed React front-end application.

## Overview

PACE is a sophisticated web application designed to process military personnel roster data and determine promotion eligibility for Air Force enlisted personnel. This front-end application provides an intuitive interface for uploading rosters, managing eligibility data, and generating professional PDF documents.

## Features

### Core Features
- **Air Force Themed UI**: Professional design using official USAF Academy brand colors
- **Initial MEL Processing**: Upload and process Initial Military Eligible Lists
- **Final MEL Processing**: Upload and process Final Military Eligible Lists
- **Senior Rater Management**: Intuitive forms for entering senior rater information
- **PASCODE Support**: Handles multiple PASCODEs and unit information
- **Small Unit Processing**: Special handling for units with 10 or fewer personnel
- **PDF Generation**: Download professionally formatted promotion eligibility PDFs
- **Error Handling**: Comprehensive error display and validation

### Roster Editing Features (NEW)
- **Roster Preview & Review**: View processed roster data before PDF generation
  - Statistics dashboard with eligible/ineligible/discrepancy/BTZ counts
  - Categorized member lists with reasons for ineligibility
  - Error log display for processing warnings
- **Member Editing**: Modify existing member data
  - Edit any field (name, grade, dates, AFSC, unit info)
  - Change eligibility status (eligible ↔ ineligible)
  - Move between categories with manual overrides
  - Audit trail for all changes
- **Add Members**: Manually add missing members to the roster
  - Full member data entry form
  - Optional eligibility validation
  - Reason tracking for additions
- **Delete Members**: Remove members from the roster
  - Soft delete (recoverable) or hard delete (permanent)
  - Confirmation dialogs to prevent accidents
  - Reason tracking for deletions
- **Logo Customization**: Upload custom unit logos
  - Support for PNG, JPG, JPEG formats
  - Image preview before upload
  - Automatic resizing for PDF templates
  - Revert to default logo option
- **Search & Filter**: Find members quickly
  - Search by name, PASCODE, or SSAN
  - Filter by category (eligible, ineligible, discrepancy, BTZ, small unit)
  - Real-time search results
- **Pagination**: Handle large rosters efficiently
  - Configurable page sizes (10, 25, 50, 100)
  - Fast navigation through pages

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - Professional component library
- **Axios** - HTTP client for API calls
- **React Dropzone** - Drag-and-drop file uploads

## Official Air Force Colors

The application uses official USAF Academy brand colors:

- **Academy Blue**: #003594 (Primary)
- **Class Royal**: #002554 (Dark Blue)
- **Academy Grey**: #B2B4B2 (Secondary)
- **Class Red**: #A6192E (Error/Warning)
- **Class Yellow**: #FFC72C (Warning)
- **Grotto Blue**: #00BED6 (Info)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Running instance of the PACE backend API

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd pace-front-end-react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API URL:
   - Copy `.env.example` to `.env`
   - Update `VITE_API_URL` to point to your backend API
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Processing Rosters with Review & Editing

**New Enhanced Workflow:**

1. **Upload Roster**
   - Select "Initial MEL" or "Final MEL" tab
   - Upload your roster file (CSV or Excel)
   - Select the promotion cycle (SRA, SSG, TSG, MSG, SMS, CMS)
   - Enter the promotion year
   - Click "Upload"

2. **Review & Edit Roster** (NEW STEP)
   - View statistics dashboard showing eligible/ineligible counts
   - Review all processed members in categorized tables
   - **Optional Actions:**
     - **Edit Members**: Click edit icon to modify member data or eligibility
     - **Add Members**: Click "Add Member" to manually add missing personnel
     - **Delete Members**: Click delete icon to remove members
     - **Upload Logo**: Click "Logo" to customize the unit logo
     - **Search**: Use search bar to find specific members
     - **Filter**: Select category to view specific member groups
   - Click "Continue to Senior Rater Info" when done reviewing

3. **Enter Senior Rater Information**
   - Fill in senior rater information for each PASCODE
   - If small units exist, provide small unit senior rater info
   - Click "Generate PDF"

4. **Download PDF**
   - Download the generated MEL PDF
   - Process new roster or return to editing

### Editing Member Details

To edit a member's information:
1. Navigate to the "Review & Edit" step
2. Find the member using search or filtering
3. Click the edit (pencil) icon for that member
4. Modify any fields as needed
5. Select the target category (eligible/ineligible/discrepancy/BTZ)
6. Optionally provide a reason for the edit
7. Check "Override validation" to skip eligibility re-checks if needed
8. Click "Save Changes"

### Adding Missing Members

To add a member who was missing from the upload:
1. Navigate to the "Review & Edit" step
2. Click "Add Member" button
3. Fill in all required member information
4. Select the target category
5. Provide a reason for adding the member
6. Optionally check "Run eligibility check" to validate
7. Click "Add Member"

### Uploading Custom Logos

To use a custom unit logo:
1. Navigate to the "Review & Edit" step
2. Click "Logo" button
3. Drag & drop or select an image file (PNG/JPG, max 5MB)
4. Preview the image
5. Click "Upload"
6. The custom logo will appear on all generated PDFs

To remove a custom logo:
1. Open the logo modal
2. Click "Remove Custom Logo"
3. The default logo will be restored

## API Integration

The application connects to the PACE backend API with the following endpoints:

### Core Workflow Endpoints
- `POST /api/upload/initial-mel` - Upload Initial MEL roster
- `POST /api/upload/final-mel` - Upload Final MEL roster
- `POST /api/initial-mel/submit/pascode-info` - Submit Initial MEL data
- `POST /api/final-mel/submit/pascode-info` - Submit Final MEL data
- `GET /api/download/initial-mel/{session_id}` - Download Initial MEL PDF
- `GET /api/download/final-mel/{session_id}` - Download Final MEL PDF

### Roster Editing Endpoints (NEW)
- `GET /api/roster/preview/{session_id}` - Get roster preview for review
- `PUT /api/roster/member/{session_id}/{member_id}` - Edit existing member
- `POST /api/roster/member/{session_id}` - Add new member
- `DELETE /api/roster/member/{session_id}/{member_id}` - Delete member
- `POST /api/roster/logo/{session_id}` - Upload custom logo
- `GET /api/roster/logo/{session_id}` - Get custom logo preview
- `DELETE /api/roster/logo/{session_id}` - Delete custom logo
- `POST /api/roster/reprocess/{session_id}` - Reprocess roster with new data

## Project Structure

```
pace-front-end-react/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # App header with PACE branding
│   │   ├── FileUpload.jsx          # File upload component
│   │   ├── RosterPreview.jsx       # Roster review & editing (NEW)
│   │   ├── EditMemberModal.jsx     # Edit member modal (NEW)
│   │   ├── AddMemberModal.jsx      # Add member modal (NEW)
│   │   ├── LogoUploadModal.jsx     # Logo upload modal (NEW)
│   │   ├── DeleteConfirmDialog.jsx # Delete confirmation (NEW)
│   │   ├── PascodeForm.jsx         # Senior rater information form
│   │   └── MELWorkflow.jsx         # Main workflow orchestrator
│   ├── services/
│   │   ├── api.js                  # Core API integration
│   │   └── rosterApi.js            # Roster editing API (NEW)
│   ├── theme.js                    # Air Force MUI theme
│   ├── App.jsx                     # Main application component
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Global styles
├── .env                            # Environment configuration
├── .env.example                    # Example environment file
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

## Backend Requirements

This front-end requires the `pace-backend-clean` API to be running. Ensure:

1. Backend is running on the configured URL
2. CORS is properly configured to allow requests from this frontend
3. Redis is running for session management
4. All required environment variables are set in the backend

## Deployment

### Deploying to Production

1. Update `.env` with production API URL
2. Build the application: `npm run build`
3. Deploy the `dist/` folder to your web server or hosting platform

### Recommended Hosting Platforms

- **DigitalOcean App Platform**
- **Vercel**
- **Netlify**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses ESLint for code quality. Run `npm run lint` before committing.

## Troubleshooting

### CORS Errors

If you encounter CORS errors, ensure the backend's `cors_origins` list includes your frontend URL.

### API Connection Issues

1. Verify `VITE_API_URL` is correct in `.env`
2. Check that the backend is running
3. Verify Redis is running for session management
4. Check browser console for detailed error messages

### File Upload Failures

1. Ensure the file is in CSV or Excel format
2. Verify all required columns exist in the roster
3. Check file size limits (typically 10MB max)
4. Review backend logs for processing errors

## Support

For issues related to:
- **Frontend**: Check this README and frontend logs
- **Backend API**: Refer to `pace-backend-clean` documentation
- **Deployment**: Consult your hosting platform's documentation

## License

U.S. Government Work - Not subject to copyright in the United States.

## Acknowledgments

Design based on official U.S. Air Force Academy brand guidelines and colors.
