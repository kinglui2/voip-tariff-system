const pool = require('../config/db');

/**
 * Generate consolidated rates for all unique prefixes in supplier_rates.
 * - For each prefix, selects the lowest and next-lowest rates (primary/backup).
 * - Upserts into consolidated_rates table.
 * - Removes obsolete consolidated_rates entries.
 *
 * This function is structured for easy future extension (e.g., currency conversion, advanced routing).
 */
async function generateConsolidatedRates() {
  // Step 1: Get all unique prefixes from supplier_rates
  const [prefixRows] = await pool.query('SELECT DISTINCT prefix FROM supplier_rates');
  const prefixes = prefixRows.map(row => row.prefix);

  // Step 2: For each prefix, process rates
  for (const prefix of prefixes) {
    // Fetch all rates for this prefix, sorted by voice_rate (asc), then supplier_id
    const [rates] = await pool.query(
      `SELECT * FROM supplier_rates WHERE prefix = ? ORDER BY voice_rate ASC, supplier_id ASC`,
      [prefix]
    );
    if (rates.length === 0) continue;
    const primary = rates[0];
    const backup = rates[1] || null;

    // Prepare consolidated rate object (future: add currency, business rules here)
    const consolidated = {
      prefix: primary.prefix,
      country: primary.country || null,
      description: primary.description || null,
      primary_supplier_id: primary.supplier_id,
      primary_rate: primary.voice_rate,
      backup_supplier_id: backup ? backup.supplier_id : null,
      backup_rate: backup ? backup.voice_rate : null,
      grace_period: primary.grace_period,
      minimal_time: primary.minimal_time,
      resolution: primary.resolution,
      rate_multiplier: primary.rate_multiplier,
      rate_addition: primary.rate_addition,
      surcharge_time: primary.surcharge_time,
      surcharge_amount: primary.surcharge_amount
    };

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
          consolidated.country,
          consolidated.description,
          consolidated.primary_supplier_id,
          consolidated.primary_rate,
          consolidated.backup_supplier_id,
          consolidated.backup_rate,
          consolidated.grace_period,
          consolidated.minimal_time,
          consolidated.resolution,
          consolidated.rate_multiplier,
          consolidated.rate_addition,
          consolidated.surcharge_time,
          consolidated.surcharge_amount,
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
          consolidated.prefix,
          consolidated.country,
          consolidated.description,
          consolidated.primary_supplier_id,
          consolidated.primary_rate,
          consolidated.backup_supplier_id,
          consolidated.backup_rate,
          consolidated.grace_period,
          consolidated.minimal_time,
          consolidated.resolution,
          consolidated.rate_multiplier,
          consolidated.rate_addition,
          consolidated.surcharge_time,
          consolidated.surcharge_amount
        ]
      );
    }
  }

  // Step 3: Remove consolidated_rates entries for prefixes no longer in supplier_rates
  await pool.query(
    'DELETE FROM consolidated_rates WHERE prefix NOT IN (SELECT DISTINCT prefix FROM supplier_rates)'
  );

  return { message: 'Consolidated rates generated successfully.' };
}

module.exports = { generateConsolidatedRates }; 