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

  async exportCSV(req, res, next) {
    try {
      const rates = await ConsolidatedRate.getAll();
      const fields = [
        'prefix', 'country', 'description',
        'primary_supplier_id', 'primary_rate',
        'backup_supplier_id', 'backup_rate',
        'grace_period', 'minimal_time', 'resolution',
        'rate_multiplier', 'rate_addition',
        'surcharge_time', 'surcharge_amount', 'created_at'
      ];
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