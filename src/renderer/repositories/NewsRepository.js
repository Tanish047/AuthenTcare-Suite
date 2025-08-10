import BaseRepository from './BaseRepository.js';
import NewsItem from '../models/NewsItem.js';

class NewsRepository extends BaseRepository {
  constructor(dbAPI) {
    super(dbAPI, 'news_feed', NewsItem);
  }

  async findByCategory(category, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const results = await this.dbAPI.query(
      'SELECT * FROM news_feed WHERE category = ? ORDER BY published_at DESC LIMIT ? OFFSET ?',
      [category, limit, offset]
    );

    const total = await this.dbAPI.query(
      'SELECT COUNT(*) as count FROM news_feed WHERE category = ?',
      [category]
    );

    return {
      data: results.map(r => NewsItem.fromJSON(r)),
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    };
  }

  async findRecent(options = {}) {
    const { limit = 10 } = options;

    const results = await this.dbAPI.query(
      'SELECT * FROM news_feed ORDER BY published_at DESC LIMIT ?',
      [limit]
    );

    return results.map(r => NewsItem.fromJSON(r));
  }

  async search(query, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const results = await this.dbAPI.query(
      'SELECT * FROM news_feed WHERE title LIKE ? OR content LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?',
      [`%${query}%`, `%${query}%`, limit, offset]
    );

    const total = await this.dbAPI.query(
      'SELECT COUNT(*) as count FROM news_feed WHERE title LIKE ? OR content LIKE ?',
      [`%${query}%`, `%${query}%`]
    );

    return {
      data: results.map(r => NewsItem.fromJSON(r)),
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    };
  }
}

export default NewsRepository;
