class CalendarEvent {
  constructor({
    id = null,
    title,
    description = null,
    startDate,
    endDate = null,
    eventType = null,
    clientId = null,
    createdAt = new Date(),
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.eventType = eventType;
    this.clientId = clientId;
    this.createdAt = createdAt;
  }

  static fromJSON(json) {
    return new CalendarEvent({
      ...json,
      startDate: json.start_date ? new Date(json.start_date) : null,
      endDate: json.end_date ? new Date(json.end_date) : null,
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),
      clientId: json.client_id,
    });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      start_date: this.startDate?.toISOString(),
      end_date: this.endDate?.toISOString(),
      event_type: this.eventType,
      client_id: this.clientId,
      created_at: this.createdAt.toISOString(),
    };
  }
}

export default CalendarEvent;
