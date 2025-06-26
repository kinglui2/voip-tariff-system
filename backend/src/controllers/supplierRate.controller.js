const SupplierRate = require('../models/supplierRate.model');
const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');

const supplierRateController = {
  async getAll(req, res, next) {
    try {
      const rates = await SupplierRate.getAll();
      res.json(rates);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const rate = await SupplierRate.getById(req.params.id);
      if (!rate) return res.status(404).json({ message: 'Rate not found' });
      res.json(rate);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const newRate = await SupplierRate.create(req.body);
      res.status(201).json(newRate);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await SupplierRate.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: 'Rate not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await SupplierRate.remove(req.params.id);
      res.json({ message: 'Rate deleted' });
    } catch (err) {
      next(err);
    }
  },

  async getBySupplier(req, res, next) {
    try {
      const rates = await SupplierRate.getBySupplier(req.params.supplier_id);
      res.json(rates);
    } catch (err) {
      next(err);
    }
  },

  async importCSV(req, res, next) {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = req.file.path;
    const results = [];
    const errors = [];
    const parser = fs.createReadStream(filePath).pipe(csv.parse({ columns: true, trim: true }));
    for await (const record of parser) {
      try {
        // Map CSV columns to DB fields (adjust as needed)
        const rate = {
          supplier_id: record.supplier_id,
          prefix: record.prefix,
          description: record.description,
          country: record.country,
          voice_rate: record.voice_rate,
          grace_period: record.grace_period,
          minimal_time: record.minimal_time,
          resolution: record.resolution,
          rate_multiplier: record.rate_multiplier,
          rate_addition: record.rate_addition,
          surcharge_time: record.surcharge_time,
          surcharge_amount: record.surcharge_amount,
          time_from_day: record.time_from_day,
          time_to_day: record.time_to_day,
          time_from_hour: record.time_from_hour,
          time_to_hour: record.time_to_hour,
          is_sms: record.is_sms
        };
        await SupplierRate.create(rate);
        results.push(rate);
      } catch (err) {
        errors.push({ record, error: err.message });
      }
    }
    fs.unlinkSync(filePath); // Clean up uploaded file
    res.json({ imported: results.length, errors });
  },
};

module.exports = supplierRateController; 