# Requirements Document

## Introduction

The current AuthenTcare Suite has a critical issue where markets (countries) are shared across all device versions instead of being independent for each version. This creates confusion and incorrect data associations, as each version should have its own set of target markets that users can independently select and manage. Additionally, the triple dot (⋮) edit and delete functionality needs to be fully functional across all components.

## Requirements

### Requirement 1

**User Story:** As a regulatory affairs manager, I want each device version to have its own independent set of target markets, so that I can track different regulatory pathways for different versions without interference.

#### Acceptance Criteria

1. WHEN I select markets for version A THEN those markets SHALL only appear in version A's market list
2. WHEN I select different markets for version B THEN those markets SHALL only appear in version B's market list and SHALL NOT affect version A's markets
3. WHEN I navigate between different versions THEN each version SHALL display only its own associated markets
4. WHEN I add a market to one version THEN it SHALL NOT automatically appear in other versions
5. WHEN I delete a market from one version THEN it SHALL NOT affect the same market in other versions

### Requirement 2

**User Story:** As a user, I want to be able to edit and delete markets using the triple dot menu, so that I can manage market information efficiently.

#### Acceptance Criteria

1. WHEN I click the triple dot (⋮) menu on any market item THEN the menu SHALL display with edit and delete options
2. WHEN I click "Edit" from the triple dot menu THEN a modal SHALL open allowing me to modify market details
3. WHEN I click "Delete" from the triple dot menu THEN a confirmation modal SHALL appear
4. WHEN I confirm deletion THEN the market SHALL be removed from that specific version only
5. WHEN I edit a market THEN the changes SHALL be saved and reflected immediately in the UI

### Requirement 3

**User Story:** As a developer, I want the system to use a proper database relationship between versions and markets, so that data integrity is maintained and performance is optimized.

#### Acceptance Criteria

1. WHEN the system stores version-market associations THEN it SHALL use a proper junction table or relationship in the database
2. WHEN querying markets for a version THEN the system SHALL only return markets associated with that specific version
3. WHEN a version is deleted THEN all its associated market relationships SHALL be automatically cleaned up
4. WHEN a market is deleted from a version THEN only that specific version-market relationship SHALL be removed
5. WHEN the system loads markets THEN it SHALL filter by the current version context

### Requirement 4

**User Story:** As a user, I want the market selection interface to clearly show which markets are available vs already selected for the current version, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN I open the "Add Target Market" dropdown THEN it SHALL show only markets not yet selected for the current version
2. WHEN I view the market list THEN it SHALL display only markets associated with the current version
3. WHEN I switch between versions THEN the available markets dropdown SHALL update to reflect the current version's state
4. WHEN all available markets are selected for a version THEN the dropdown SHALL show an appropriate message
5. WHEN I add a market to the current version THEN it SHALL immediately appear in the version's market list and be removed from the available options

### Requirement 5

**User Story:** As a user, I want all triple dot menus throughout the application to be fully functional, so that I can perform edit and delete operations consistently.

#### Acceptance Criteria

1. WHEN I encounter any triple dot menu in the application THEN it SHALL be clickable and functional
2. WHEN I click any triple dot menu THEN it SHALL display the appropriate context menu with relevant actions
3. WHEN I select an action from any triple dot menu THEN the corresponding operation SHALL execute successfully
4. WHEN I click outside a triple dot menu THEN the menu SHALL close automatically
5. WHEN I press the Escape key while a triple dot menu is open THEN the menu SHALL close