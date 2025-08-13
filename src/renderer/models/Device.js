export default class Device {
  constructor({
    id = null,
    projectId,
    name,
    versions = [],
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.projectId = projectId;
    this.name = name;
    this.versions = versions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromJSON(json) {
    return new Device({
      ...json,
      projectId: json.project_id,
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),
      updatedAt: json.updated_at ? new Date(json.updated_at) : new Date(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      project_id: this.projectId,
      name: this.name,
      versions: this.versions,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
