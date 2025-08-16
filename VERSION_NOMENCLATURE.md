# Version Nomenclature System

## Overview
This document describes the simplified version naming convention used in the AuthenTcare Suite application for medical device versions and renewals.

## Version Types

### 1. New Versions (Major/Minor Updates)
New versions represent actual changes or updates to the medical device.

**Format:** `vX`
- `X` = Version number (simple integer)

**Examples:**
- `v1` - First version
- `v2` - Second version
- `v3` - Third version
- `v4` - Fourth version

**Logic:**
- **Simple Increment**: Each new version gets the next sequential number
- **No Complex Logic**: No automatic major/minor version changes
- **Predictable**: Users know exactly what number they'll get

### 2. Renewals (Base Version-Tied)
Renewals represent regulatory renewals of existing versions without technical changes.

**Format:** `R-vX-Y`
- `R-vX` = Renewal of version X
- `Y` = Renewal sequence number for that base version

**Examples:**
- `R-v1-1` - First renewal of v1
- `R-v1-2` - Second renewal of v1
- `R-v1-3` - Third renewal of v1
- `R-v2-1` - First renewal of v2
- `R-v2-2` - Second renewal of v2

**Logic:**
- **Base Version Tied**: Each renewal is clearly linked to its base version
- **Sequential Numbering**: Simple increment within each base version
- **No Renaming**: Version numbers never change after creation
- **Clear Traceability**: Easy to see which version a renewal belongs to

## Visual Indicators

### Version Tags
Each version displays a colored tag indicating its type:

**New Versions:**
- 🟢 **Version** (Green) - For all new versions (v1, v2, v3, etc.)

**Renewals:**
- 🟠 **Renewal** (Orange) - For all renewal versions (R-v1-1, R-v1-2, etc.)

### Version Display Format
Versions are displayed as: `DeviceName-VersionNumber, CreationDate`

**Examples:**
- `CardiacMonitor-v1, 15/01/2024`
- `CardiacMonitor-R-v1-1, 15/01/2024` (first renewal of v1)
- `CardiacMonitor-R-v1-2, 16/01/2024` (second renewal of v1)
- `CardiacMonitor-v2, 20/03/2024`
- `CardiacMonitor-R-v2-1, 25/03/2024` (first renewal of v2)

## Automatic Generation Logic

### New Version Creation
1. **First Version**: Always starts with `v1`
2. **Subsequent Versions**: Simple increment (v2, v3, v4...)
3. **No Complex Logic**: No automatic major/minor version changes

### Renewal Creation
1. **Base Version Selection**: User selects which version to renew
2. **Sequential Numbering**: Counts existing renewals for that base version
3. **Automatic Naming**: Creates `R-vX-Y` where Y is the next number
4. **No Renaming**: Existing renewals keep their numbers

## Benefits of This Simplified System

### 1. **Clear Distinction**
- Easy to distinguish between technical updates and regulatory renewals
- Version numbers clearly indicate the relationship between versions

### 2. **Regulatory Compliance**
- Renewal versions maintain clear traceability to their base version
- Date stamps provide clear regulatory timeline
- Sequence numbers track multiple renewals of the same version

### 3. **Simplicity & Reliability**
- **No Complex Renaming**: Version numbers never change after creation
- **Predictable Numbering**: Users know exactly what number they'll get
- **No Data Inconsistency**: Eliminates potential for numbering conflicts
- **Easier Maintenance**: Simpler database operations and logic

### 4. **User-Friendly**
- Visual tags make it easy to identify version types
- Clear numbering shows the relationship between versions and renewals
- Hover tooltips provide additional context

## Usage Guidelines

### When to Create a New Version
- Technical changes to the device
- Software updates
- Hardware modifications
- New features or capabilities
- Bug fixes or improvements

### When to Create a Renewal
- Regulatory renewal without technical changes
- License renewals
- Certification renewals
- Market authorization renewals
- Periodic regulatory submissions

## Key Changes from Previous System

### What Was Removed
- **Complex Renaming Logic**: No more automatic renumbering of existing versions
- **Dynamic Version Changes**: Version numbers are stable after creation
- **Automatic Major/Minor Logic**: Simple sequential numbering only

### What Was Improved
- **Clearer Naming**: `R-v1-1` instead of `R-1.1`
- **Better Traceability**: Each renewal clearly shows its base version
- **Simplified Logic**: No complex state management or renaming functions
- **More Reliable**: Eliminates potential for numbering inconsistencies

## Migration from Old System
If you have existing versions with the old naming system:
- Old versions will continue to work
- New versions will use the improved nomenclature
- No automatic conversion of existing version numbers
- Users can manually update version numbers if desired

---

**This simplified system ensures maintainability, reliability, and a great user experience!**