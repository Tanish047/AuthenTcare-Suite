import BaseRepository from './BaseRepository.js';
import Project from '../models/Project.js';
import Device from '../models/Device.js';

class ProjectRepository extends BaseRepository {
  constructor(dbAPI) {
    super(dbAPI, 'projects', Project);
  }

  async findWithDevices(id) {
    const project = await this.findById(id);
    if (!project) return null;

    const devices = await this.dbAPI.query('SELECT * FROM devices WHERE project_id = ?', [id]);

    project.devices = devices.map(d => Device.fromJSON(d));
    return project;
  }

  async findAllWithDevices(options = {}) {
    const result = await this.findAll(options);

    // Get all devices for these projects
    const projectIds = result.data.map(p => p.id);
    if (projectIds.length > 0) {
      const devices = await this.dbAPI.query(
        'SELECT * FROM devices WHERE project_id IN (' + projectIds.map(() => '?').join(',') + ')',
        projectIds
      );

      // Group devices by project
      const devicesByProject = new Map();
      devices.forEach(device => {
        const deviceObj = Device.fromJSON(device);
        if (!devicesByProject.has(deviceObj.projectId)) {
          devicesByProject.set(deviceObj.projectId, []);
        }
        devicesByProject.get(deviceObj.projectId).push(deviceObj);
      });

      // Add devices to their projects
      result.data.forEach(project => {
        project.devices = devicesByProject.get(project.id) || [];
      });
    }

    return result;
  }

  async delete(id) {
    // Note: Due to CASCADE, this will automatically delete related devices and versions
    await super.delete(id);
  }
}

export default ProjectRepository;
