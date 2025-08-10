export default class DatabaseAPI {
  constructor(db) {
    this.db = db;
  }

  async query(sql, params = []) {
    try {
      if (sql.toLowerCase().includes('select')) {
        return await this.db.all(sql, params);
      } else {
        return await this.db.run(sql, params);
      }
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    try {
      await this.db.exec('BEGIN TRANSACTION');
      const result = await callback(this);
      await this.db.exec('COMMIT');
      return result;
    } catch (error) {
      await this.db.exec('ROLLBACK');
      throw error;
    }
  }
}
