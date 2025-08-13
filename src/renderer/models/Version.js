class Version {
  constructor({
    id = null,
    deviceId,
    projectId,
    name,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.deviceId = deviceId;
    this.projectId = projectId;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromJSON(json) {
    return new Version({
      ...json,
      deviceId: json.device_id,
      projectId: json.project_id,
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),
      updatedAt: json.updated_at ? new Date(json.updated_at) : new Date(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      device_id: this.deviceId,
      project_id: this.projectId,
      name: this.name,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}

export default Version;
