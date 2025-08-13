import BaseRepository from './BaseRepository.js';
import CalendarEvent from '../models/CalendarEvent.js';

class CalendarRepository extends BaseRepository {
  constructor(dbAPI) {
    super(dbAPI, 'calendar_events', CalendarEvent);
  }

  async findByDateRange(startDate, endDate, options = {}) {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const results = await this.dbAPI.query(
      `SELECT * FROM calendar_events 
       WHERE start_date >= ? AND (end_date <= ? OR end_date IS NULL)
       ORDER BY start_date ASC
       LIMIT ? OFFSET ?`,
      [startDate.toISOString(), endDate.toISOString(), limit, offset]
    );

    const total = await this.dbAPI.query(
      `SELECT COUNT(*) as count FROM calendar_events 
       WHERE start_date >= ? AND (end_date <= ? OR end_date IS NULL)`,
      [startDate.toISOString(), endDate.toISOString()]
    );

    return {
      data: results.map(r => CalendarEvent.fromJSON(r)),
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }

  async findUpcoming(limit = 10) {
    const results = await this.dbAPI.query(
      `SELECT * FROM calendar_events 
       WHERE start_date >= datetime('now')
       ORDER BY start_date ASC
       LIMIT ?`,
      [limit]
    );

    return results.map(r => CalendarEvent.fromJSON(r));
  }

  async findByClient(clientId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const results = await this.dbAPI.query(
      `SELECT * FROM calendar_events 
       WHERE client_id = ?
       ORDER BY start_date DESC
       LIMIT ? OFFSET ?`,
      [clientId, limit, offset]
    );

    const total = await this.dbAPI.query(
      'SELECT COUNT(*) as count FROM calendar_events WHERE client_id = ?',
      [clientId]
    );

    return {
      data: results.map(r => CalendarEvent.fromJSON(r)),
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }
}

export default CalendarRepository;
