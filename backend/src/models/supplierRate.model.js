const pool = require('../config/db');

const SupplierRate = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM supplier_rates ORDER BY id DESC');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM supplier_rates WHERE id = ?', [id]);
    return rows[0];
  },

  async create(rate) {
    const [result] = await pool.query(
      `INSERT INTO supplier_rates
      (supplier_id, prefix, description, country, voice_rate, grace_period, minimal_time, resolution, rate_multiplier, rate_addition, surcharge_time, surcharge_amount, time_from_day, time_to_day, time_from_hour, time_to_hour, is_sms, effective_date, comments, round_rules)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rate.supplier_id,
        rate.prefix,
        rate.description || null,
        rate.country || null,
        rate.voice_rate,
        rate.grace_period || 0,
        rate.minimal_time || 0,
        rate.resolution || 1,
        rate.rate_multiplier || 1.0,
        rate.rate_addition || 0.0,
        rate.surcharge_time || 0,
        rate.surcharge_amount || 0.0,
        rate.time_from_day || null,
        rate.time_to_day || null,
        rate.time_from_hour || null,
        rate.time_to_hour || null,
        rate.is_sms || 0,
        rate.effective_date || null,
        rate.comments || null,
        rate.round_rules || null
      ]
    );
    return { id: result.insertId, ...rate };
  },

  async update(id, rate) {
    await pool.query(
      `UPDATE supplier_rates SET
        supplier_id = ?,
        prefix = ?,
        description = ?,
        country = ?,
        voice_rate = ?,
        grace_period = ?,
        minimal_time = ?,
        resolution = ?,
        rate_multiplier = ?,
        rate_addition = ?,
        surcharge_time = ?,
        surcharge_amount = ?,
        time_from_day = ?,
        time_to_day = ?,
        time_from_hour = ?,
        time_to_hour = ?,
        is_sms = ?,
        effective_date = ?,
        comments = ?,
        round_rules = ?
      WHERE id = ?`,
      [
        rate.supplier_id,
        rate.prefix,
        rate.description || null,
        rate.country || null,
        rate.voice_rate,
        rate.grace_period || 0,
        rate.minimal_time || 0,
        rate.resolution || 1,
        rate.rate_multiplier || 1.0,
        rate.rate_addition || 0.0,
        rate.surcharge_time || 0,
        rate.surcharge_amount || 0.0,
        rate.time_from_day || null,
        rate.time_to_day || null,
        rate.time_from_hour || null,
        rate.time_to_hour || null,
        rate.is_sms || 0,
        rate.effective_date || null,
        rate.comments || null,
        rate.round_rules || null,
        id
      ]
    );
    return this.getById(id);
  },

  async remove(id) {
    await pool.query('DELETE FROM supplier_rates WHERE id = ?', [id]);
    return { id };
  },

  async getBySupplier(supplier_id) {
    const [rows] = await pool.query('SELECT * FROM supplier_rates WHERE supplier_id = ? ORDER BY id DESC', [supplier_id]);
    return rows;
  },
};

module.exports = SupplierRate; 