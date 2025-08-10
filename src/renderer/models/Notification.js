class Notification {
  constructor({
    id = null,
    title,
    message,
    type = null,
    read = false,
    createdAt = new Date()
  }) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.type = type;
    this.read = read;
    this.createdAt = createdAt;
  }

  static fromJSON(json) {
    return new Notification({
      ...json,
      createdAt: json.created_at ? new Date(json.created_at) : new Date()
    });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      message: this.message,
      type: this.type,
      read: this.read,
      created_at: this.createdAt.toISOString()
    };
  }

  markAsRead() {
    this.read = true;
  }

  markAsUnread() {
    this.read = false;
  }
}

export default Notification;
