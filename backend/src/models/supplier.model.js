const pool = require('../config/db');

const Supplier = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY id DESC');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, currency }) {
    const [result] = await pool.query(
      'INSERT INTO suppliers (name, currency) VALUES (?, ?)',
      [name, currency || 'Ksh']
    );
    return { id: result.insertId, name, currency: currency || 'Ksh' };
  },

  async update(id, { name, currency }) {
    await pool.query(
      'UPDATE suppliers SET name = ?, currency = ? WHERE id = ?',
      [name, currency, id]
    );
    return this.getById(id);
  },

  async remove(id) {
    await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    return { id };
  },

  async getByName(name) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE name = ?', [name]);
    return rows[0];
  },
};

module.exports = Supplier; 