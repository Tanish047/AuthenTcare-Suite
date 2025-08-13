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
        { name: 'United States (FDA)', region: 'North America', regulatory_body: 'FDA' },
        { name: 'European Union (EMA)', region: 'Europe', regulatory_body: 'EMA' },
        {
          name: 'Canada (Health Canada)',
          region: 'North America',
          regulatory_body: 'Health Canada',
        },
        { name: 'Australia (TGA)', region: 'Oceania', regulatory_body: 'TGA' },
        { name: 'Japan (PMDA)', region: 'Asia', regulatory_body: 'PMDA' },
        { name: 'United Kingdom (MHRA)', region: 'Europe', regulatory_body: 'MHRA' },
        { name: 'Brazil (ANVISA)', region: 'South America', regulatory_body: 'ANVISA' },
        { name: 'India (CDSCO)', region: 'Asia', regulatory_body: 'CDSCO' },
        { name: 'China (NMPA)', region: 'Asia', regulatory_body: 'NMPA' },
        { name: 'South Korea (MFDS)', region: 'Asia', regulatory_body: 'MFDS' },
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
