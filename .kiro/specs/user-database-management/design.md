# Design Document

## Overview

The User Database Management feature adds a new page accessible from the Pathway Completion page (CompletionSummary component) that allows users to upload, select, and delete files and folders. The feature integrates with the existing navigation system and follows the application's established patterns for UI components and IPC communication.

## Architecture

### Navigation Flow
```
CompletionSummary → UserDatabase Page → Back to CompletionSummary
```

The feature extends the existing page-based navigation system used in the application, adding a new page type `user-database` to the App.jsx routing logic.

### Component Structure
```
UserDatabase (Main Page Component)
├── UserDatabaseHeader (Navigation & Title)
├── UserDatabaseToolbar (Upload, Select, Delete buttons)
├── UserDatabaseContent (File/Folder listing)
├── UserDatabaseModals (Confirmation dialogs)
└── UserDatabaseEmptyState (When no files exist)
```

### Data Flow
```
Frontend (React) ↔ IPC Bridge (preload.js) ↔ Main Process (Electron) ↔ File System
```

## Components and Interfaces

### 1. CompletionSummary Component Updates
**File:** `src/renderer/components/research/CompletionSummary.jsx`

Add a "User Database" button to the existing action buttons section:
- Position: Between "Start New Pathway" and "Back to Research" buttons
- Style: Consistent with existing button styling
- Action: Navigate to user-database page

### 2. UserDatabase Component
**File:** `src/renderer/components/UserDatabase.jsx`

Main page component with the following sections:
- Header with title and back navigation
- Toolbar with Upload, Select, Delete buttons
- Content area displaying files/folders in a list or grid
- Empty state when no files exist
- Loading states during operations

**Props:**
```javascript
{
  onBack: () => void // Navigation back to completion summary
}
```

### 3. UserDatabaseModals Component
**File:** `src/renderer/components/UserDatabaseModals.jsx`

Modal dialogs for:
- Delete confirmation with list of selected items
- Upload progress indicator
- Error messages for failed operations

### 4. useUserDatabase Hook
**File:** `src/renderer/hooks/useUserDatabase.js`

Custom hook managing:
- File/folder listing state
- Selection state management
- Upload/delete operations
- Loading and error states

**Interface:**
```javascript
{
  files: Array<FileItem>,
  selectedFiles: Set<string>,
  isLoading: boolean,
  error: string | null,
  uploadFiles: (files: FileList) => Promise<void>,
  selectFile: (fileId: string) => void,
  selectAll: () => void,
  clearSelection: () => void,
  deleteSelected: () => Promise<void>,
  refreshFiles: () => Promise<void>
}
```

## Data Models

### FileItem Interface
```javascript
{
  id: string,           // Unique identifier
  name: string,         // File/folder name
  type: 'file' | 'folder',
  size: number,         // Size in bytes (0 for folders)
  path: string,         // Full file path
  dateCreated: Date,    // Creation timestamp
  dateModified: Date,   // Last modification timestamp
  extension?: string    // File extension (files only)
}
```

### UserDatabaseState Interface
```javascript
{
  files: FileItem[],
  selectedFiles: Set<string>,
  isLoading: boolean,
  error: string | null,
  isSelectionMode: boolean,
  showDeleteModal: boolean,
  uploadProgress: number | null
}
```

## IPC Communication

### New IPC Handlers
**File:** `src/preload.js`

Add to existing `contextBridge.exposeInMainWorld`:
```javascript
userDatabaseAPI: {
  getFiles: () => ipcRenderer.invoke('user-db-get-files'),
  uploadFiles: (filePaths) => ipcRenderer.invoke('user-db-upload-files', filePaths),
  deleteFiles: (fileIds) => ipcRenderer.invoke('user-db-delete-files', fileIds),
  openFileDialog: (options) => ipcRenderer.invoke('user-db-open-file-dialog', options)
}
```

### Main Process Handlers
**File:** `src/main/ipcHandlers.js` (or similar)

Implement handlers for:
- `user-db-get-files`: List all user database files
- `user-db-upload-files`: Copy files to user database directory
- `user-db-delete-files`: Remove files from user database
- `user-db-open-file-dialog`: Open native file/folder picker

## File Storage Strategy

### Storage Location
- **Directory:** `{userData}/user-database/`
- **Structure:** Flat structure with unique file IDs to avoid conflicts
- **Metadata:** JSON file storing file metadata and relationships

### File Management
- **Upload:** Copy files to storage directory with UUID-based names
- **Metadata:** Store original names, paths, and metadata in `metadata.json`
- **Deletion:** Remove both file and metadata entry
- **Conflict Resolution:** Automatic renaming for duplicate names

## Error Handling

### Upload Errors
- File size limits (configurable, default 100MB per file)
- Disk space validation
- Permission errors
- Invalid file types (if restrictions applied)

### Delete Errors
- File in use/locked
- Permission errors
- File not found

### Network/System Errors
- Disk full
- Database corruption
- IPC communication failures

### Error Display Strategy
- Toast notifications for quick feedback
- Modal dialogs for critical errors requiring user action
- Inline error messages for form validation

## Testing Strategy

### Unit Tests
- **Components:** UserDatabase, UserDatabaseModals
- **Hooks:** useUserDatabase state management
- **Utilities:** File validation, metadata handling

### Integration Tests
- **IPC Communication:** File operations through IPC bridge
- **File System:** Upload, delete, and listing operations
- **Navigation:** Page transitions and back navigation

### E2E Tests
- **Complete Workflow:** Navigate from completion → upload files → select → delete → back
- **Error Scenarios:** Handle upload failures, delete failures
- **Edge Cases:** Empty states, large file uploads, many files

### Test Data
- **Mock Files:** Various file types and sizes
- **Mock Folders:** Nested folder structures
- **Error Conditions:** Simulated failures for error handling

## Security Considerations

### File Upload Security
- **Path Traversal:** Validate file paths to prevent directory traversal
- **File Type Validation:** Optional whitelist/blacklist for file types
- **Size Limits:** Prevent excessive disk usage
- **Sanitization:** Clean file names to prevent injection

### Access Control
- **User Isolation:** Each user's files stored separately
- **Permission Validation:** Verify user permissions before operations
- **Audit Trail:** Log file operations for security monitoring

## Performance Considerations

### Large File Handling
- **Streaming:** Use streams for large file uploads
- **Progress Tracking:** Show upload progress for large files
- **Chunked Operations:** Process large file lists in batches

### UI Performance
- **Virtual Scrolling:** For large file lists (>1000 items)
- **Lazy Loading:** Load file metadata on demand
- **Debounced Search:** If search functionality added later

### Memory Management
- **File Cleanup:** Clean up temporary files after operations
- **Memory Limits:** Monitor memory usage during bulk operations
- **Garbage Collection:** Proper cleanup of event listeners and timers