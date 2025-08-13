export default class BaseRepository {
  constructor(dbAPI, tableName, modelClass) {
    this.dbAPI = dbAPI;
    this.tableName = tableName;
    this.modelClass = modelClass;
  }

  async findById(id) {
    const result = await this.dbAPI.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return result ? this.modelClass.fromJSON(result) : null;
  }

  async findAll(options = {}) {
    const { page = 1, limit = 10, where = {} } = options;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];

    if (Object.keys(where).length > 0) {
      whereClause =
        'WHERE ' +
        Object.keys(where)
          .map(key => {
            params.push(where[key]);
            return `${key} = ?`;
          })
          .join(' AND ');
    }

    const results = await this.dbAPI.query(
      `SELECT * FROM ${this.tableName} ${whereClause} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = await this.dbAPI.query(
      `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`,
      params
    );

    return {
      data: results.map(r => this.modelClass.fromJSON(r)),
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }

  async create(data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const result = await this.dbAPI.query(
      `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    return this.modelClass.fromJSON(result);
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const result = await this.dbAPI.query(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ? RETURNING *`,
      [...values, id]
    );

    return this.modelClass.fromJSON(result);
  }

  async delete(id) {
    await this.dbAPI.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }
}
