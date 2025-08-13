import BaseRepository from './BaseRepository.js';
import Notification from '../models/Notification.js';

class NotificationRepository extends BaseRepository {
  constructor(dbAPI) {
    super(dbAPI, 'notifications', Notification);
  }

  async findUnread(options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const results = await this.dbAPI.query(
      'SELECT * FROM notifications WHERE read = FALSE ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const total = await this.dbAPI.query(
      'SELECT COUNT(*) as count FROM notifications WHERE read = FALSE'
    );

    return {
      data: results.map(r => Notification.fromJSON(r)),
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }

  async markAsRead(id) {
    await this.dbAPI.query('UPDATE notifications SET read = TRUE WHERE id = ?', [id]);
  }

  async markAllAsRead() {
    await this.dbAPI.query('UPDATE notifications SET read = TRUE WHERE read = FALSE');
  }

  async findByType(type, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const results = await this.dbAPI.query(
      'SELECT * FROM notifications WHERE type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [type, limit, offset]
    );

    const total = await this.dbAPI.query(
      'SELECT COUNT(*) as count FROM notifications WHERE type = ?',
      [type]
    );

    return {
      data: results.map(r => Notification.fromJSON(r)),
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }
}

export default NotificationRepository;
