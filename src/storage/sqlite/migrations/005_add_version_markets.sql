-- 005_add_version_markets.sql
-- Add version_markets junction table for version-specific market relationships

-- Create version_markets junction table
CREATE TABLE IF NOT EXISTS version_markets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id INTEGER NOT NULL,
  market_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE,
  FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE,
  UNIQUE(version_id, market_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_version_markets_version_id ON version_markets(version_id);
CREATE INDEX IF NOT EXISTS idx_version_markets_market_id ON version_markets(market_id);
CREATE INDEX IF NOT EXISTS idx_version_markets_composite ON version_markets(version_id, market_id);