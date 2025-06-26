const express = require('express');
const router = express.Router();
const supplierRateController = require('../controllers/supplierRate.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/import', upload.single('file'), supplierRateController.importCSV);
router.get('/', supplierRateController.getAll);
router.get('/:id', supplierRateController.getById);
router.post('/', supplierRateController.create);
router.put('/:id', supplierRateController.update);
router.delete('/:id', supplierRateController.remove);
router.get('/supplier/:supplier_id', supplierRateController.getBySupplier);

module.exports = router; 