# Design Document

## Overview

This design addresses the critical issue where markets (countries) are currently shared across all device versions instead of being independent. The solution involves creating a proper database relationship between versions and markets, updating the state management to handle version-specific markets, and ensuring all triple dot menus are fully functional.

## Architecture

### Current Problem
- Markets are stored globally in `state.targetMarkets`
- All versions share the same market list
- No database relationship between versions and markets
- Triple dot menus may not be fully functional

### Proposed Solution
- Create a `version_markets` junction table to establish proper relationships
- Update state management to handle version-specific markets
- Modify components to filter markets by version
- Ensure all ActionMenu components are properly wired

## Components and Interfaces

### Database Schema Changes

#### New Table: version_markets
```sql
CREATE TABLE IF NOT EXISTS version_markets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id INTEGER NOT NULL,
  market_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE,
  FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE,
  UNIQUE(version_id, market_id)
);
```

#### Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_version_markets_version_id ON version_markets(version_id);
CREATE INDEX IF NOT EXISTS idx_version_markets_market_id ON version_markets(market_id);
```

### API Changes

#### New IPC Handlers
- `db-get-version-markets` - Get markets for a specific version
- `db-add-version-market` - Add a market to a version
- `db-remove-version-market` - Remove a market from a version
- `db-get-available-markets-for-version` - Get markets not yet added to a version

### State Management Updates

#### Context Changes
```javascript
// Remove global targetMarkets, replace with version-specific storage
const initialState = {
  // ... existing state
  versionMarkets: {}, // { [versionId]: Market[] }
  // ... rest of state
};

// New actions
case 'SET_VERSION_MARKETS':
  return {
    ...state,
    versionMarkets: {
      ...state.versionMarkets,
      [action.versionId]: action.markets
    }
  };

case 'ADD_VERSION_MARKET':
  return {
    ...state,
    versionMarkets: {
      ...state.versionMarkets,
      [action.versionId]: [
        ...(state.versionMarkets[action.versionId] || []),
        action.market
      ]
    }
  };

case 'REMOVE_VERSION_MARKET':
  return {
    ...state,
    versionMarkets: {
      ...state.versionMarkets,
      [action.versionId]: (state.versionMarkets[action.versionId] || [])
        .filter(m => m.id !== action.marketId)
    }
  };
```

### Component Updates

#### MarketList Component
- Accept `selectedVersion` prop
- Filter markets by version ID
- Update add/remove logic to work with version-specific markets
- Ensure ActionMenu edit/delete functions work properly

#### useMarkets Hook
- Add version parameter
- Update all market operations to be version-specific
- Implement proper edit/delete functionality

#### ResearchWorkspace Component
- Pass selected version to MarketList
- Load version-specific markets when version changes
- Clear version markets when switching versions

## Data Models

### VersionMarket Model
```javascript
class VersionMarket {
  constructor(data) {
    this.id = data.id;
    this.version_id = data.version_id;
    this.market_id = data.market_id;
    this.created_at = data.created_at;
  }
}
```

### Updated Market Model
```javascript
class Market {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.region = data.region || '';
    this.regulatory_body = data.regulatory_body || '';
    this.requirements = data.requirements || '';
    this.status = data.status || 'active';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
```

## Error Handling

### Database Constraints
- Handle unique constraint violations when adding duplicate version-market pairs
- Provide user-friendly error messages
- Implement proper rollback mechanisms

### UI Error States
- Show loading states during market operations
- Display error messages for failed operations
- Implement retry mechanisms where appropriate

## Testing Strategy

### Unit Tests
- Test version-market relationship CRUD operations
- Test state management updates
- Test component rendering with version-specific data

### Integration Tests
- Test full workflow: version selection → market addition → market removal
- Test ActionMenu functionality across all components
- Test data persistence and retrieval

### User Acceptance Tests
- Verify markets are independent between versions
- Verify all triple dot menus are functional
- Verify proper error handling and user feedback

## Migration Strategy

### Database Migration
1. Create new `version_markets` table
2. Migrate existing global markets to version-specific relationships
3. Update indexes and constraints

### Data Migration
1. For existing versions with markets, create version-market relationships
2. Preserve existing market data
3. Clean up old global market storage

### Rollback Plan
- Keep backup of existing data structure
- Implement rollback migration if needed
- Provide data export functionality

## Performance Considerations

### Database Optimization
- Proper indexing on junction table
- Efficient queries for version-market lookups
- Batch operations for multiple market additions

### UI Performance
- Memoize market filtering operations
- Implement virtual scrolling for large market lists
- Optimize re-renders when switching versions

### Memory Management
- Clean up version market data when versions are deleted
- Implement proper cleanup in useEffect hooks
- Avoid memory leaks in ActionMenu components