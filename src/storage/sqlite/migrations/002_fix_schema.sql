-- 002_fix_schema.sql
-- Fix schema inconsistencies and add missing tables

-- Drop old project table if it exists (singular)
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS project_fts;

-- Ensure all tables have the correct schema
-- (The main tables are already created in 001_init.sql, this is just for cleanup)