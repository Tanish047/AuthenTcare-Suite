import { schema, indexes } from './schema.js';

export async function runMigrations(db) {
  try {
    console.log('Starting database migrations...');

    // Create tables
    for (const [tableName, createTableSQL] of Object.entries(schema)) {
      await db.exec(createTableSQL);
      console.log(`✓ Created table: ${tableName}`);
    }

    // Create indexes
    for (const indexSQL of indexes) {
      await db.exec(indexSQL);
    }
    console.log('✓ Created indexes');

    // Insert default data if tables are empty
    await insertDefaultData(db);

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function insertDefaultData(db) {
  try {
    // Check if markets table is empty and insert default markets
    const marketCount = await db.get('SELECT COUNT(*) as count FROM markets');
    if (marketCount.count === 0) {
      const defaultMarkets = [
        { name: 'India', region: 'Asia', regulatory_body: 'CDSCO' },
        { name: 'Australia', region: 'Oceania', regulatory_body: 'TGA' },
        { name: 'Cambodia', region: 'Asia', regulatory_body: 'DDF' },
        { name: 'Europe', region: 'Europe', regulatory_body: 'EMA' },
        { name: 'USA', region: 'North America', regulatory_body: 'FDA' },
        { name: 'China', region: 'Asia', regulatory_body: 'NMPA' },
        { name: 'New Zealand', region: 'Oceania', regulatory_body: 'Medsafe' },
        { name: 'Indonesia', region: 'Asia', regulatory_body: 'BPOM' },
        { name: 'Vietnam', region: 'Asia', regulatory_body: 'DAV' },
        { name: 'Brunei', region: 'Asia', regulatory_body: 'PPKB' },
        { name: 'Singapore', region: 'Asia', regulatory_body: 'HSA' },
        { name: 'Japan', region: 'Asia', regulatory_body: 'PMDA' },
        { name: 'Thailand', region: 'Asia', regulatory_body: 'FDA Thailand' },
        { name: 'Myanmar', region: 'Asia', regulatory_body: 'FDA Myanmar' },
        { name: 'UAE', region: 'Middle East', regulatory_body: 'MOHAP' },
        { name: 'Canada', region: 'North America', regulatory_body: 'Health Canada' },
        { name: 'Philippines', region: 'Asia', regulatory_body: 'FDA Philippines' },
        { name: 'Hong Kong', region: 'Asia', regulatory_body: 'DH' },
        { name: 'Lao', region: 'Asia', regulatory_body: 'FDA Lao' },
        { name: 'Malaysia', region: 'Asia', regulatory_body: 'NPRA' },
        { name: 'Sri Lanka', region: 'Asia', regulatory_body: 'NMRA' },
        { name: 'Taiwan', region: 'Asia', regulatory_body: 'TFDA' },
      ];

      for (const market of defaultMarkets) {
        await db.run('INSERT INTO markets (name, region, regulatory_body) VALUES (?, ?, ?)', [
          market.name,
          market.region,
          market.regulatory_body,
        ]);
      }
      console.log('✓ Inserted default markets');
    }

    // Check if notifications table is empty and insert welcome notification
    const notificationCount = await db.get('SELECT COUNT(*) as count FROM notifications');
    if (notificationCount.count === 0) {
      await db.run('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)', [
        'Welcome to AuthenTcare Suite',
        'Your regulatory management journey starts here!',
        'info',
      ]);
      console.log('✓ Inserted welcome notification');
    }
  } catch (error) {
    console.error('Error inserting default data:', error);
    // Don't throw error for default data insertion failures
  }
}
