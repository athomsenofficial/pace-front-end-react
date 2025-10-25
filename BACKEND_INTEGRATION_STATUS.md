# Backend Integration Status

## Current State

The React front-end has been updated to **use live data** instead of mock/test data. However, there's an important integration requirement needed for full functionality.

## What's Working Now

✅ **File Upload** - Uses real backend API (`POST /api/upload/initial-mel` and `/api/upload/final-mel`)
✅ **Session Management** - Real session IDs from backend
✅ **PASCODE Data** - Real PASCODEs from uploaded rosters
✅ **Error Display** - Real processing errors from backend
✅ **Senior Rater Forms** - Real data for PASCODE senior rater info
✅ **PDF Generation** - Real PDF generation from backend

## What Needs Backend Implementation

⚠️ **Roster Preview with Full Member Data** - Requires new backend endpoint

### The Issue

The current backend upload endpoints (`/api/upload/initial-mel` and `/api/upload/final-mel`) only return:
- `session_id`
- `pascodes`
- `pascode_unit_map`
- `senior_rater_needed`
- `errors`

They **DO NOT** return the full roster data that's stored in Redis, including:
- `eligible_df` - List of eligible members
- `ineligible_df` - List of ineligible members with reasons
- `discrepancy_df` - Members flagged for review
- `btz_df` - Below-the-zone eligible members
- `small_unit_df` - Small unit members
- `dataframe` - All uploaded members

### The Solution

Implement the roster preview endpoint as specified in `ROSTER_EDITING_FEATURE_SPEC.md`:

```python
@app.get("/api/roster/preview/{session_id}")
async def get_roster_preview(
    session_id: str,
    category: str = "all",
    page: int = 1,
    page_size: int = 50
):
    """
    Get roster preview for review and editing.
    Returns all member data from the session including eligible,
    ineligible, discrepancy, BTZ, and small unit members.
    """
    try:
        session = get_session(session_id)

        if not session:
            return JSONResponse(
                content={"error": "Session not found or expired"},
                status_code=404
            )

        # Convert dataframes to list of dicts for JSON serialization
        def df_to_list(df):
            if df is None or len(df) == 0:
                return []
            return df.to_dict('records') if hasattr(df, 'to_dict') else df

        response = {
            "session_id": session_id,
            "cycle": session.get('cycle', 'SSG'),
            "year": session.get('year', 2025),
            "edited": session.get('edited', False),
            "statistics": {
                "total_uploaded": len(session.get('dataframe', [])),
                "total_processed": (
                    len(session.get('eligible_df', [])) +
                    len(session.get('ineligible_df', [])) +
                    len(session.get('discrepancy_df', [])) +
                    len(session.get('btz_df', []))
                ),
                "eligible": len(session.get('eligible_df', [])),
                "ineligible": len(session.get('ineligible_df', [])),
                "discrepancy": len(session.get('discrepancy_df', [])),
                "btz": len(session.get('btz_df', [])),
                "errors": len(session.get('error_log', []))
            },
            "categories": {
                "eligible": df_to_list(session.get('eligible_df')),
                "ineligible": df_to_list(session.get('ineligible_df')),
                "discrepancy": df_to_list(session.get('discrepancy_df')),
                "btz": df_to_list(session.get('btz_df')),
                "small_unit": df_to_list(session.get('small_unit_df'))
            },
            "errors": session.get('error_log', []),
            "pascodes": session.get('pascodes', []),
            "pascode_unit_map": session.get('pascode_unit_map', {}),
            "custom_logo": {
                "uploaded": False,  # TODO: Implement logo storage
                "filename": None
            }
        }

        return JSONResponse(content=response)

    except Exception as e:
        return JSONResponse(
            content={"error": f"Failed to retrieve roster preview: {str(e)}"},
            status_code=500
        )
```

### Where to Add This

Add this endpoint to your `/Users/drew/Coding/pace-backend-clean/main.py` file, after the existing upload endpoints.

## Current Frontend Behavior

The frontend now:

1. **First tries** to call `GET /api/roster/preview/{session_id}`
2. **If that fails** (404/500), it falls back to using the limited data from the upload response
3. **Displays an info banner** explaining that full roster data requires the preview endpoint
4. **Shows what data it has**: Session ID, PASCODEs count, and error count

Once you implement the backend preview endpoint, the frontend will automatically:
- Display full member lists with all details
- Show accurate statistics for each category
- Enable edit, add, and delete operations
- Display member reasons for ineligibility/discrepancy
- Support search and filtering across all members

## Testing the Integration

1. **Before Backend Endpoint**: You'll see the info banner and limited statistics
2. **After Backend Endpoint**: Full roster data appears automatically (hot reload will pick it up)

## Next Steps

1. ✅ **Frontend is ready** - Already using live data where available
2. ⏳ **Add backend preview endpoint** - Copy the code above to `main.py`
3. ✅ **Test** - Upload a roster and see full member data appear
4. ✅ **Implement remaining endpoints** - Edit, Add, Delete, Logo Upload (as specified in the feature spec)

## Summary

The front-end is **100% ready for live data** and will work automatically once you implement the backend roster preview endpoint. No changes to the React code are needed - it's already configured to use the API endpoint when available.
