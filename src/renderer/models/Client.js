export default class Client {
  constructor({ id = null, name, email, createdAt = new Date(), updatedAt = new Date() }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromJSON(json) {
    return new Client({
      ...json,
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),
      updatedAt: json.updated_at ? new Date(json.updated_at) : new Date(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
