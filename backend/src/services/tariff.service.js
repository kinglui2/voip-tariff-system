const pool = require('../config/db');

async function generateConsolidatedRates() {
  // Get all unique prefixes from supplier_rates
  const [prefixRows] = await pool.query('SELECT DISTINCT prefix FROM supplier_rates');
  const prefixes = prefixRows.map(row => row.prefix);

  // For each prefix, find the lowest and next-lowest rates
  for (const prefix of prefixes) {
    const [rates] = await pool.query(
      `SELECT * FROM supplier_rates WHERE prefix = ? ORDER BY voice_rate ASC, supplier_id ASC`,
      [prefix]
    );
    if (rates.length === 0) continue;
    const primary = rates[0];
    const backup = rates[1] || null;

    // Upsert into consolidated_rates
    const [existing] = await pool.query('SELECT id FROM consolidated_rates WHERE prefix = ?', [prefix]);
    if (existing.length > 0) {
      // Update
      await pool.query(
        `UPDATE consolidated_rates SET
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
        WHERE prefix = ?`,
        [
          primary.country,
          primary.description,
          primary.supplier_id,
          primary.voice_rate,
          backup ? backup.supplier_id : null,
          backup ? backup.voice_rate : null,
          primary.grace_period,
          primary.minimal_time,
          primary.resolution,
          primary.rate_multiplier,
          primary.rate_addition,
          primary.surcharge_time,
          primary.surcharge_amount,
          prefix
        ]
      );
    } else {
      // Insert
      await pool.query(
        `INSERT INTO consolidated_rates
          (prefix, country, description, primary_supplier_id, primary_rate, backup_supplier_id, backup_rate, grace_period, minimal_time, resolution, rate_multiplier, rate_addition, surcharge_time, surcharge_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          primary.prefix,
          primary.country,
          primary.description,
          primary.supplier_id,
          primary.voice_rate,
          backup ? backup.supplier_id : null,
          backup ? backup.voice_rate : null,
          primary.grace_period,
          primary.minimal_time,
          primary.resolution,
          primary.rate_multiplier,
          primary.rate_addition,
          primary.surcharge_time,
          primary.surcharge_amount
        ]
      );
    }
  }

  // Remove consolidated_rates entries for prefixes no longer in supplier_rates
  await pool.query(
    'DELETE FROM consolidated_rates WHERE prefix NOT IN (SELECT DISTINCT prefix FROM supplier_rates)'
  );

  return { message: 'Consolidated rates generated successfully.' };
}

module.exports = { generateConsolidatedRates }; 