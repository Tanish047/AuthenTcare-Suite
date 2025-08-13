import BaseRepository from './BaseRepository.js';
import Device from '../models/Device.js';
import Version from '../models/Version.js';

class DeviceRepository extends BaseRepository {
  constructor(dbAPI) {
    super(dbAPI, 'devices', Device);
  }

  async findByProject(projectId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const results = await this.dbAPI.query(
      'SELECT * FROM devices WHERE project_id = ? LIMIT ? OFFSET ?',
      [projectId, limit, offset]
    );

    const total = await this.dbAPI.query(
      'SELECT COUNT(*) as count FROM devices WHERE project_id = ?',
      [projectId]
    );

    return {
      data: results.map(r => Device.fromJSON(r)),
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }

  async findWithVersions(id) {
    const device = await this.findById(id);
    if (!device) return null;

    const versions = await this.dbAPI.query('SELECT * FROM versions WHERE device_id = ?', [id]);

    device.versions = versions.map(v => Version.fromJSON(v));
    return device;
  }

  async findAllWithVersions(projectId) {
    const result = await this.findByProject(projectId);

    // Get all versions for these devices
    const deviceIds = result.data.map(d => d.id);
    if (deviceIds.length > 0) {
      const versions = await this.dbAPI.query(
        'SELECT * FROM versions WHERE device_id IN (' + deviceIds.map(() => '?').join(',') + ')',
        deviceIds
      );

      // Group versions by device
      const versionsByDevice = new Map();
      versions.forEach(version => {
        const versionObj = Version.fromJSON(version);
        if (!versionsByDevice.has(versionObj.deviceId)) {
          versionsByDevice.set(versionObj.deviceId, []);
        }
        versionsByDevice.get(versionObj.deviceId).push(versionObj);
      });

      // Add versions to their devices
      result.data.forEach(device => {
        device.versions = versionsByDevice.get(device.id) || [];
      });
    }

    return result;
  }

  async delete(id) {
    // Note: Due to CASCADE, this will automatically delete related versions
    await super.delete(id);
  }
}

export default DeviceRepository;
