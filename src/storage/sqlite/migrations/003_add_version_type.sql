-- 003_add_version_type.sql
-- Add type field to versions table to support renewal vs new version distinction

ALTER TABLE versions ADD COLUMN type TEXT DEFAULT 'new_version';

-- Update existing versions to have the new_version type
UPDATE versions SET type = 'new_version' WHERE type IS NULL;