const { Router } = require('express');
const { WorkersController } = require('../controllers/workers.controller');
const { DutiesController } = require('../controllers/duties.controller');

const router = Router();
const workersController = new WorkersController();
const dutiesController = new DutiesController();

// Роуты для сотрудников
router.get('/workers', (req, res) => workersController.getWorkers(req, res));
router.post('/workers', (req, res) => workersController.createWorker(req, res));
router.put('/workers/:id', (req, res) => workersController.updateWorker(req, res));
router.delete('/workers/:id', (req, res) => workersController.deleteWorker(req, res));

// Роуты для должностей
router.get('/duties', (req, res) => dutiesController.getDuties(req, res));
router.post('/duties', (req, res) => dutiesController.createDuty(req, res));
router.put('/duties/:id', (req, res) => dutiesController.updateDuty(req, res));
router.delete('/duties/:id', (req, res) => dutiesController.deleteDuty(req, res));

module.exports = router;
