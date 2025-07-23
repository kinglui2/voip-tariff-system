const ConsolidatedRate = require('../models/consolidatedRate.model');
const { generateConsolidatedRates } = require('../services/tariff.service');
const { Parser } = require('json2csv');

const consolidatedRateController = {
  async getAll(req, res, next) {
    try {
      const rates = await ConsolidatedRate.getAll();
      res.json(rates);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const rate = await ConsolidatedRate.getById(req.params.id);
      if (!rate) return res.status(404).json({ message: 'Rate not found' });
      res.json(rate);
    } catch (err) {
      next(err);
    }
  },

  async getByPrefix(req, res, next) {
    try {
      const rates = await ConsolidatedRate.getByPrefix(req.params.prefix);
      res.json(rates);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const newRate = await ConsolidatedRate.create(req.body);
      res.status(201).json(newRate);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await ConsolidatedRate.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: 'Rate not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await ConsolidatedRate.remove(req.params.id);
      res.json({ message: 'Rate deleted' });
    } catch (err) {
      next(err);
    }
  },

  async generate(req, res, next) {
    try {
      const result = await generateConsolidatedRates();
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Export all consolidated rates as a CSV file.
   * - Automatically runs consolidation before exporting.
   * - Uses a fixed field list for VoipSwitch compatibility.
   * - Prepares for future customizations (e.g., currency, user-specific formats).
   */
  async exportCSV(req, res, next) {
    try {
      // Step 1: Run consolidation
      const consolidationResult = await generateConsolidatedRates();
      if (!consolidationResult || consolidationResult.error) {
        return res.status(500).json({ message: consolidationResult?.error || 'Failed to consolidate rates.' });
      }
      // Step 2: Export consolidated rates
      const rates = await ConsolidatedRate.getAll();
      if (!rates || rates.length === 0) {
        return res.status(400).json({ message: 'No consolidated rates available to export.' });
      }
      // Define export fields (future: make configurable)
      const fields = [
        'prefix', 'country', 'description',
        'primary_supplier_id', 'primary_rate',
        'backup_supplier_id', 'backup_rate',
        'grace_period', 'minimal_time', 'resolution',
        'rate_multiplier', 'rate_addition',
        'surcharge_time', 'surcharge_amount', 'created_at'
      ];
      // Prepare CSV parser (future: add transforms, currency, etc.)
      const parser = new Parser({ fields });
      const csv = parser.parse(rates);
      res.header('Content-Type', 'text/csv');
      res.attachment('consolidated_rates.csv');
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = consolidatedRateController; 