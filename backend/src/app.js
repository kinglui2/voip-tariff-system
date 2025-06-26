const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const supplierRoutes = require('./routes/supplier.routes');
const supplierRateRoutes = require('./routes/supplierRate.routes');
const consolidatedRateRoutes = require('./routes/consolidatedRate.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test DB connection on startup
pool.getConnection()
  .then(conn => {
    console.log('MySQL connected!');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection failed:', err.message);
  });

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'VoIP Tariff System API is running.' });
});

app.use('/api/suppliers', supplierRoutes);
app.use('/api/supplier-rates', supplierRateRoutes);
app.use('/api/consolidated-rates', consolidatedRateRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;
