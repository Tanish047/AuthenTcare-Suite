-- 006_update_markets.sql
-- Update markets table with comprehensive list of target markets

-- Clear existing markets
DELETE FROM markets;

-- Insert comprehensive list of target markets
INSERT INTO markets (name, region, regulatory_body) VALUES
('India', 'Asia', 'CDSCO'),
('Australia', 'Oceania', 'TGA'),
('Cambodia', 'Asia', 'DDF'),
('Europe', 'Europe', 'EMA'),
('USA', 'North America', 'FDA'),
('China', 'Asia', 'NMPA'),
('New Zealand', 'Oceania', 'Medsafe'),
('Indonesia', 'Asia', 'BPOM'),
('Vietnam', 'Asia', 'DAV'),
('Brunei', 'Asia', 'PPKB'),
('Singapore', 'Asia', 'HSA'),
('Japan', 'Asia', 'PMDA'),
('Thailand', 'Asia', 'FDA Thailand'),
('Myanmar', 'Asia', 'FDA Myanmar'),
('UAE', 'Middle East', 'MOHAP'),
('Canada', 'North America', 'Health Canada'),
('Philippines', 'Asia', 'FDA Philippines'),
('Hong Kong', 'Asia', 'DH'),
('Lao', 'Asia', 'FDA Lao'),
('Malaysia', 'Asia', 'NPRA'),
('Sri Lanka', 'Asia', 'NMRA'),
('Taiwan', 'Asia', 'TFDA');