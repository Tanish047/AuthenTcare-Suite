export default class Project {
  constructor({ id = null, name, devices = [], createdAt = new Date(), updatedAt = new Date() }) {
    this.id = id;
    this.name = name;
    this.devices = devices;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromJSON(json) {
    return new Project({
      ...json,
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),
      updatedAt: json.updated_at ? new Date(json.updated_at) : new Date(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      devices: this.devices,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
