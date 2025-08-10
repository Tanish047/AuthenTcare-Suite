import BaseRepository from './BaseRepository.js';
import Client from '../models/Client.js';

class ClientRepository extends BaseRepository {
  constructor(dbAPI) {
    super(dbAPI, 'clients', Client);
  }

  async findByEmail(email) {
    const result = await this.dbAPI.query(
      'SELECT * FROM clients WHERE email = ?',
      [email]
    );
    return result ? Client.fromJSON(result) : null;
  }

  async searchByName(name, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const results = await this.dbAPI.query(
      'SELECT * FROM clients WHERE name LIKE ? LIMIT ? OFFSET ?',
      [`%${name}%`, limit, offset]
    );

    const total = await this.dbAPI.query(
      'SELECT COUNT(*) as count FROM clients WHERE name LIKE ?',
      [`%${name}%`]
    );

    return {
      data: results.map(r => Client.fromJSON(r)),
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    };
  }
}

export default ClientRepository;
