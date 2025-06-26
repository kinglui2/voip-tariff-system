const express = require('express');
const router = express.Router();
const consolidatedRateController = require('../controllers/consolidatedRate.controller');

router.get('/export', consolidatedRateController.exportCSV);
router.post('/generate', consolidatedRateController.generate);
router.get('/', consolidatedRateController.getAll);
router.get('/:id', consolidatedRateController.getById);
router.get('/prefix/:prefix', consolidatedRateController.getByPrefix);
router.post('/', consolidatedRateController.create);
router.put('/:id', consolidatedRateController.update);
router.delete('/:id', consolidatedRateController.remove);

module.exports = router; 