const pool = require('../config/db');

const ConsolidatedRate = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM consolidated_rates ORDER BY id DESC');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM consolidated_rates WHERE id = ?', [id]);
    return rows[0];
  },

  async getByPrefix(prefix) {
    const [rows] = await pool.query('SELECT * FROM consolidated_rates WHERE prefix = ?', [prefix]);
    return rows;
  },

  async create(rate) {
    const [result] = await pool.query(
      `INSERT INTO consolidated_rates
      (prefix, country, description, primary_supplier_id, primary_rate, backup_supplier_id, backup_rate, grace_period, minimal_time, resolution, rate_multiplier, rate_addition, surcharge_time, surcharge_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rate.prefix,
        rate.country || null,
        rate.description || null,
        rate.primary_supplier_id,
        rate.primary_rate,
        rate.backup_supplier_id || null,
        rate.backup_rate || null,
        rate.grace_period || 0,
        rate.minimal_time || 0,
        rate.resolution || 1,
        rate.rate_multiplier || 1.0,
        rate.rate_addition || 0.0,
        rate.surcharge_time || 0,
        rate.surcharge_amount || 0.0
      ]
    );
    return { id: result.insertId, ...rate };
  },

  async update(id, rate) {
    await pool.query(
      `UPDATE consolidated_rates SET
        prefix = ?,
        country = ?,
        description = ?,
        primary_supplier_id = ?,
        primary_rate = ?,
        backup_supplier_id = ?,
        backup_rate = ?,
        grace_period = ?,
        minimal_time = ?,
        resolution = ?,
        rate_multiplier = ?,
        rate_addition = ?,
        surcharge_time = ?,
        surcharge_amount = ?
      WHERE id = ?`,
      [
        rate.prefix,
        rate.country || null,
        rate.description || null,
        rate.primary_supplier_id,
        rate.primary_rate,
        rate.backup_supplier_id || null,
        rate.backup_rate || null,
        rate.grace_period || 0,
        rate.minimal_time || 0,
        rate.resolution || 1,
        rate.rate_multiplier || 1.0,
        rate.rate_addition || 0.0,
        rate.surcharge_time || 0,
        rate.surcharge_amount || 0.0,
        id
      ]
    );
    return this.getById(id);
  },

  async remove(id) {
    await pool.query('DELETE FROM consolidated_rates WHERE id = ?', [id]);
    return { id };
  },
};

module.exports = ConsolidatedRate; 