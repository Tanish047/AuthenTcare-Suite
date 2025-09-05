# SOP Generator and Checklist Enhancement Design

## Overview

This feature extends the ProAnalyzer tools with a new SOP Generator and adds an interactive checklist to the pathway completion page. The design focuses on seamless integration with existing components while providing powerful new functionality for regulatory documentation and progress tracking.

## Architecture

### Component Structure
```
CompletionSummary (Enhanced)
├── ProAnalyzer Sidebar (Enhanced)
│   └── SOP Generator Tool (New)
├── Main Content Area
│   ├── Existing Summary Content
│   └── Interactive Checklist (New)
└── Navigation Integration

SOPGenerator (New Page)
├── Header with Pathway Context
├── License Information Section
├── Template Selection Section
├── Template Editor with Auto-fill
└── Export/Save Functionality
```

### Navigation Flow
```
Completion Page → ProAnalyzer Sidebar → SOP Generator → Back to Completion
                ↓
            Interactive Checklist (Always Visible)
```

## Components and Interfaces

### 1. Enhanced ProAnalyzer Tools

**File:** `src/renderer/components/research/CompletionSummary.jsx`

Add SOP Generator to the existing tools array:
```javascript
const proAnalyzerTools = [
  // ... existing tools
  { 
    name: 'SOP Generator', 
    icon: '📋', 
    description: 'Generate standard operating procedures from templates' 
  },
];
```

**Navigation Handler:**
```javascript
const handleToolClick = (toolName) => {
  if (toolName === 'SOP Generator') {
    // Navigate to SOP Generator page while preserving pathway context
    dispatch({ type: 'SET_PAGE', page: 'sop-generator', pageParent: 'research' });
  }
  // ... existing tool handling
};
```

### 2. SOP Generator Component

**File:** `src/renderer/components/SOPGenerator.jsx`

**Props Interface:**
```javascript
interface SOPGeneratorProps {
  selectedProject: Project;
  selectedDevice: Device;
  selectedVersion: Version;
  selectedMarket: Market;
  selectedLicense: License;
  onBack: () => void;
}
```

**Key Sections:**
1. **Header Section:** Display pathway context and license information
2. **Template Browser:** Interface to browse user database files
3. **Template Editor:** Rich text editor with auto-fill capabilities
4. **Export Options:** Save to user database or download

### 3. Interactive Checklist Component

**File:** `src/renderer/components/research/InteractiveChecklist.jsx`

**Props Interface:**
```javascript
interface ChecklistProps {
  selectedMarket: Market;
  selectedLicense: License;
  onProgressUpdate: (progress: number) => void;
}
```

**State Management:**
```javascript
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'incomplete' | 'in-progress' | 'completed';
  required: boolean;
  marketSpecific: boolean;
}
```

### 4. Template Auto-fill Engine

**File:** `src/renderer/utils/templateEngine.js`

**Core Functions:**
```javascript
// Parse template and identify placeholder fields
function parseTemplate(templateContent: string): TemplateStructure;

// Auto-fill template with pathway data
function autoFillTemplate(template: TemplateStructure, pathwayData: PathwayData): string;

// Generate SOP content
function generateSOP(licenseInfo: License, templateContent: string): string;
```

## Data Models

### Checklist Item Model
```javascript
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'incomplete' | 'in-progress' | 'completed';
  category: string;
  priority: 'low' | 'medium' | 'high';
  marketSpecific: boolean;
  licenseTypeSpecific: boolean;
  estimatedTime: string;
  resources: string[];
  dependencies: string[];
}
```

### Template Model
```javascript
interface SOPTemplate {
  id: string;
  name: string;
  content: string;
  placeholders: TemplatePlaceholder[];
  category: string;
  applicableMarkets: string[];
  applicableLicenseTypes: string[];
}

interface TemplatePlaceholder {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select';
  required: boolean;
  defaultValue?: string;
}
```

### Pathway Data Model
```javascript
interface PathwayData {
  project: {
    name: string;
    description: string;
    id: string;
  };
  device: {
    name: string;
    type: string;
    specifications: string;
  };
  version: {
    versionNumber: string;
    releaseDate: string;
    changes: string;
  };
  market: {
    name: string;
    region: string;
    regulatoryBody: string;
    requirements: string;
  };
  license: {
    licenseNumber: string;
    status: string;
    issuedDate: string;
    expiryDate: string;
  };
}
```

## User Interface Design

### SOP Generator Page Layout
```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Completion    SOP Generator    🔧 ProAnalyzer │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📋 [License Name] - Standard Operating Procedure        │
│                                                         │
│ Project: [Project Name] | Device: [Device Name]        │
│ Version: [Version] | Market: [Market] | License: [Lic] │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📁 Template Selection                                   │
│ ┌─────────────────┐ ┌─────────────────┐                │
│ │ Browse User DB  │ │ Default Templates│                │
│ └─────────────────┘ └─────────────────┘                │
│                                                         │
│ Selected: [Template Name]                               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ✏️ Template Editor                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Rich text editor with auto-filled content]        │ │
│ │                                                     │ │
│ │ Placeholders automatically filled:                  │ │
│ │ - {{PROJECT_NAME}} → [Actual Project Name]         │ │
│ │ - {{DEVICE_NAME}} → [Actual Device Name]           │ │
│ │ - {{LICENSE_NUMBER}} → [Actual License Number]     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [💾 Save to User DB] [📥 Download] [🔄 Reset]          │
└─────────────────────────────────────────────────────────┘
```

### Interactive Checklist Layout
```
┌─────────────────────────────────────────────────────────┐
│ ✅ Regulatory Compliance Checklist                      │
│                                                         │
│ Progress: ████████░░ 80% Complete                       │
│                                                         │
│ 🟢 Documentation Review              [Completed]       │
│ 🟡 Market Analysis                   [In Progress]     │
│ 🔴 Regulatory Submission             [Incomplete]      │
│ 🟢 Quality Management System         [Completed]       │
│ 🟡 Risk Assessment                   [In Progress]     │
│ 🔴 Clinical Data Review              [Incomplete]      │
│                                                         │
│ Market-Specific Requirements (FDA):                     │
│ 🟢 510(k) Submission                 [Completed]       │
│ 🔴 FDA Response Review               [Incomplete]      │
│                                                         │
│ [+ Add Custom Item] [📊 Export Report]                 │
└─────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. App.jsx Navigation
Add route handling for the new SOP Generator page:
```javascript
{page === 'sop-generator' && (
  <SOPGenerator
    selectedProject={state.selectedProject}
    selectedDevice={state.selectedDevice}
    selectedVersion={state.selectedVersion}
    selectedMarket={state.selectedMarket}
    selectedLicense={state.selectedLicense}
    onBack={() => dispatch({ type: 'SET_PAGE', page: 'research-workspace', pageParent: 'research' })}
  />
)}
```

### 2. User Database Integration
Extend existing user database API to support template operations:
```javascript
// New IPC handlers in handlers.js
ipcMain.handle('user-db-get-templates', this.getUserDatabaseTemplates.bind(this));
ipcMain.handle('user-db-save-sop', this.saveSOPToUserDatabase.bind(this));
```

### 3. State Management
Add checklist state to AppContext:
```javascript
// In AppContext.jsx initialState
checklistItems: [],
checklistProgress: 0,

// New reducer actions
case 'SET_CHECKLIST_ITEMS':
  return { ...state, checklistItems: action.items };
case 'UPDATE_CHECKLIST_ITEM':
  return { 
    ...state, 
    checklistItems: state.checklistItems.map(item => 
      item.id === action.itemId ? { ...item, status: action.status } : item
    )
  };
case 'SET_CHECKLIST_PROGRESS':
  return { ...state, checklistProgress: action.progress };
```

## Error Handling

### Template Loading Errors
- Graceful fallback to default templates
- User-friendly error messages for corrupted files
- Retry mechanisms for network-related issues

### Auto-fill Failures
- Highlight missing data fields
- Provide manual input options
- Validate required fields before generation

### Checklist Persistence
- Local storage backup for checklist state
- Conflict resolution for concurrent updates
- Recovery mechanisms for corrupted checklist data

## Testing Strategy

### Unit Tests
- Template parsing and auto-fill functions
- Checklist state management
- Navigation flow validation

### Integration Tests
- User database template retrieval
- SOP generation end-to-end flow
- Checklist persistence across sessions

### User Experience Tests
- Template selection and editing workflow
- Checklist interaction and visual feedback
- Cross-browser compatibility for rich text editing

## Performance Considerations

### Template Processing
- Lazy loading of large templates
- Caching frequently used templates
- Asynchronous auto-fill processing

### Checklist Rendering
- Virtual scrolling for large checklists
- Debounced state updates
- Optimized re-rendering strategies

### Memory Management
- Cleanup of template editor instances
- Efficient checklist item storage
- Garbage collection of unused components