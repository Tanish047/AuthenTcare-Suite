-- 004_add_base_version_id.sql
-- Add base_version_id field to versions table to support renewal base version tracking

ALTER TABLE versions ADD COLUMN base_version_id INTEGER;

-- Add foreign key constraint for base_version_id
-- This allows renewals to reference their base version
-- Note: We don't add ON DELETE CASCADE here as we want to preserve renewals even if base version is deleted
