const express = require('express');
const router = express.Router();
const {
  getRealTimeData,
  getHistoryData,
  getSummary,
  addEnergyData,
  getAdminStats
} = require('../controllers/energyController');
const { protect, admin } = require('../middleware/auth');

// --- Rutas protegidas ---

// Datos en Tiempo Real (Soporta con y sin clientId)
router.get('/realtime', protect, getRealTimeData);
router.get('/realtime/:clientId', protect, getRealTimeData);

// Historial (Soporta con y sin clientId)
router.get('/history', protect, getHistoryData);
router.get('/history/:clientId', protect, getHistoryData);

// Resumen (Soporta con y sin clientId)
router.get('/summary', protect, getSummary);
router.get('/summary/:clientId', protect, getSummary);

// Agregar datos
router.post('/data', protect, addEnergyData);

// --- Rutas de admin ---
router.get('/admin/stats', protect, admin, getAdminStats);

module.exports = router;