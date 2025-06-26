const Supplier = require('../models/supplier.model');

const supplierController = {
  async getAll(req, res, next) {
    try {
      const suppliers = await Supplier.getAll();
      res.json(suppliers);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const supplier = await Supplier.getById(req.params.id);
      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
      res.json(supplier);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name, currency } = req.body;
      if (!name) return res.status(400).json({ message: 'Name is required' });
      const newSupplier = await Supplier.create({ name, currency });
      res.status(201).json(newSupplier);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { name, currency } = req.body;
      const updated = await Supplier.update(req.params.id, { name, currency });
      if (!updated) return res.status(404).json({ message: 'Supplier not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await Supplier.remove(req.params.id);
      res.json({ message: 'Supplier deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = supplierController; 