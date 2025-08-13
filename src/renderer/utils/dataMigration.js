import { getStorage, setStorage } from './storage.js';

export async function migrateLocalStorageToDatabase() {
  try {
    console.log('Starting data migration from localStorage to database...');

    // Migrate projects
    const projects = getStorage('authentcare_projects', []);
    if (projects.length > 0) {
      console.log(`Migrating ${projects.length} projects...`);
      for (const project of projects) {
        try {
          await window.dbAPI.createProject({
            name: project.name,
            description: project.description || '',
          });
        } catch (error) {
          console.warn(`Failed to migrate project "${project.name}":`, error.message);
        }
      }
      // Clear localStorage after successful migration
      setStorage('authentcare_projects', []);
      console.log('✓ Projects migrated successfully');
    }

    // Migrate devices
    const deviceKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('authentcare_devices_')
    );
    for (const key of deviceKeys) {
      const projectId = key.replace('authentcare_devices_', '');
      const devices = getStorage(key, []);
      if (devices.length > 0) {
        console.log(`Migrating ${devices.length} devices for project ${projectId}...`);
        for (const device of devices) {
          try {
            await window.dbAPI.createDevice({
              project_id: parseInt(projectId),
              name: device.name,
              type: device.type || '',
              specifications: device.specifications || '',
            });
          } catch (error) {
            console.warn(`Failed to migrate device "${device.name}":`, error.message);
          }
        }
        setStorage(key, []);
      }
    }
    console.log('✓ Devices migrated successfully');

    // Migrate versions
    const versionKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('authentcare_versions_')
    );
    for (const key of versionKeys) {
      const versionData = key.replace('authentcare_versions_', '');
      const [projectId, deviceId] = versionData.split('_');
      const versions = getStorage(key, []);
      if (versions.length > 0) {
        console.log(`Migrating ${versions.length} versions for device ${deviceId}...`);
        for (const version of versions) {
          try {
            await window.dbAPI.createVersion({
              device_id: parseInt(deviceId),
              version_number: version.name,
              release_date: version.releaseDate || null,
              changes: version.changes || '',
            });
          } catch (error) {
            console.warn(`Failed to migrate version "${version.name}":`, error.message);
          }
        }
        setStorage(key, []);
      }
    }
    console.log('✓ Versions migrated successfully');

    // Migrate markets
    const markets = getStorage('authentcare_target_markets', []);
    if (markets.length > 0) {
      console.log(`Migrating ${markets.length} markets...`);
      for (const market of markets) {
        try {
          await window.dbAPI.createMarket({
            name: market.name,
            region: market.region || '',
            regulatory_body: market.regulatoryBody || '',
            requirements: market.requirements || '',
          });
        } catch (error) {
          console.warn(`Failed to migrate market "${market.name}":`, error.message);
        }
      }
      setStorage('authentcare_target_markets', []);
      console.log('✓ Markets migrated successfully');
    }

    // Migrate licenses
    const licenses = getStorage('authentcare_market_licenses', {});
    const licenseEntries = Object.entries(licenses);
    if (licenseEntries.length > 0) {
      console.log(`Migrating ${licenseEntries.length} license entries...`);
      for (const [key, license] of licenseEntries) {
        try {
          // Parse the key to get project, market, and version info
          const [projectId, marketId, versionId] = key.split('_').map(Number);
          await window.dbAPI.createLicense({
            project_id: projectId,
            market_id: marketId,
            version_id: versionId,
            license_number: license.licenseNumber || '',
            status: license.status || 'pending',
            issued_date: license.issuedDate || null,
            expiry_date: license.expiryDate || null,
            notes: license.notes || '',
          });
        } catch (error) {
          console.warn(`Failed to migrate license for key "${key}":`, error.message);
        }
      }
      setStorage('authentcare_market_licenses', {});
      console.log('✓ Licenses migrated successfully');
    }

    console.log('Data migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Data migration failed:', error);
    return false;
  }
}

export function hasLocalStorageData() {
  const projects = getStorage('authentcare_projects', []);
  const deviceKeys = Object.keys(localStorage).filter(key =>
    key.startsWith('authentcare_devices_')
  );
  const versionKeys = Object.keys(localStorage).filter(key =>
    key.startsWith('authentcare_versions_')
  );
  const markets = getStorage('authentcare_target_markets', []);
  const licenses = getStorage('authentcare_market_licenses', {});

  return (
    projects.length > 0 ||
    deviceKeys.length > 0 ||
    versionKeys.length > 0 ||
    markets.length > 0 ||
    Object.keys(licenses).length > 0
  );
}
