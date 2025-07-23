const SupplierRate = require('../models/supplierRate.model');
const Supplier = require('../models/supplier.model');
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
    console.log('DEBUG: req.file:', req.file);
    console.log('DEBUG: req.body.supplier_name:', req.body && req.body.supplier_name);
    if (req.file && req.file.path) {
      try {
        fs.accessSync(req.file.path, fs.constants.R_OK);
        console.log('DEBUG: File exists and is readable:', req.file.path);
      } catch (e) {
        console.error('DEBUG: File does not exist or is not readable:', req.file.path, e);
      }
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const supplierName = req.body.supplier_name && req.body.supplier_name.trim();
    if (!supplierName) return res.status(400).json({ message: 'Supplier name is required' });
    let supplier = await Supplier.getByName(supplierName);
    if (!supplier) {
      supplier = await Supplier.create({ name: supplierName });
    }
    const supplierId = supplier.id;
    const filePath = req.file.path;
    const results = [];
    const errors = [];
    // Preprocess: find the first non-empty, non-comma-only line as header
    const readline = require('readline');
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    let headerLine = null;
    let headerLineNumber = 0;
    let lineNumber = 0;
    for await (const line of rl) {
      lineNumber++;
      // Remove whitespace and check if line is only commas or empty
      if (line.replace(/,/g, '').trim() === '') continue;
      headerLine = line;
      headerLineNumber = lineNumber;
      break;
    }
    rl.close();
    fileStream.close();
    if (!headerLine) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No valid header found in CSV file.', imported: 0, errors: [] });
    }
    // Now create a stream that starts from the header line
    const allLines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
    const csvContent = allLines.slice(headerLineNumber - 1).join('\n');
    const { Readable } = require('stream');
    const csvStream = Readable.from([csvContent]);
    let detectedHeaders = null;
    let recordCount = 0;
    // Synonyms for flexible CSV import
    const FIELD_SYNONYMS = {
      description: ['description', 'destination', 'destination name', 'dest', 'country'],
      prefix: ['prefix', 'numbering plan', 'code'],
      voice_rate: ['voice_rate', 'rates per minute', 'rate', 'voice rate'],
      effective_date: ['effective_date', 'effective date', 'date'],
      comments: ['comments', 'note', 'notes', 'remark'],
      round_rules: ['round_rules', 'round rules', 'rounding'],
      grace_period: ['grace_period', 'grace period', 'waiting time'],
      minimal_time: ['minimal_time', 'minimal time'],
      resolution: ['resolution'],
      rate_multiplier: ['rate_multiplier', 'rate multiplier'],
      rate_addition: ['rate_addition', 'rate addition', 'additional rate'],
      surcharge_time: ['surcharge_time', 'surcharge time'],
      surcharge_amount: ['surcharge_amount', 'surcharge amount'],
      time_from_day: ['time_from_day', 'time from day'],
      time_to_day: ['time_to_day', 'time to day'],
      time_from_hour: ['time_from_hour', 'time from hour'],
      time_to_hour: ['time_to_hour', 'time to hour'],
      is_sms: ['is_sms', 'is sms', 'sms']
    };
    try {
      const parser = csvStream.pipe(csv.parse({
        columns: header => {
          detectedHeaders = header.map(h => h.trim().toLowerCase());
          console.log('DEBUG: Detected CSV headers:', detectedHeaders);
          return detectedHeaders;
        },
        trim: true,
        skip_empty_lines: true
      }));
      const debugRecords = [];
      let debugCount = 0;
      for await (const record of parser) {
        recordCount++;
        // Helper to get value by possible keys, and trim the value if it's a string
        const getField = (obj, fieldKey) => {
          const keys = FIELD_SYNONYMS[fieldKey] || [fieldKey];
          for (const k of keys) {
            let v = obj[k];
            if (typeof v === 'string') v = v.trim();
            if (v !== undefined && v !== null && v !== '') return v;
          }
          return null;
        };
        const prefix = getField(record, 'prefix');
        const voice_rate = getField(record, 'voice_rate');
        if (debugCount < 10) {
          debugRecords.push({ record, prefix, voice_rate });
          debugCount++;
        }
        if (!prefix || !voice_rate) {
          continue;
        }
        try {
          const rate = {
            supplier_id: supplierId,
            prefix,
            description: getField(record, 'description'),
            country: null, // handled by description
            voice_rate,
            grace_period: getField(record, 'grace_period'),
            minimal_time: getField(record, 'minimal_time'),
            resolution: getField(record, 'resolution'),
            rate_multiplier: getField(record, 'rate_multiplier'),
            rate_addition: getField(record, 'rate_addition'),
            surcharge_time: getField(record, 'surcharge_time'),
            surcharge_amount: getField(record, 'surcharge_amount'),
            time_from_day: getField(record, 'time_from_day'),
            time_to_day: getField(record, 'time_to_day'),
            time_from_hour: getField(record, 'time_from_hour'),
            time_to_hour: getField(record, 'time_to_hour'),
            is_sms: getField(record, 'is_sms'),
            effective_date: getField(record, 'effective_date'),
            comments: getField(record, 'comments'),
            round_rules: getField(record, 'round_rules')
          };
          await SupplierRate.create(rate);
          results.push(rate);
        } catch (err) {
          errors.push({ record, error: err.message });
        }
      }
      if (recordCount === 0) {
        console.log('DEBUG: No records were parsed from the CSV.');
      }
      console.log('DEBUG: First 10 parsed records:', JSON.stringify(debugRecords, null, 2));
    } catch (parseErr) {
      console.error('DEBUG: Error while parsing CSV:', parseErr);
    }
    fs.unlinkSync(filePath); // Clean up uploaded file
    if (results.length === 0) {
      return res.status(400).json({ message: 'No valid rates were imported. Please check your CSV file format.', imported: 0, errors });
    }
    res.json({ imported: results.length, errors });
  },
};

module.exports = supplierRateController; 