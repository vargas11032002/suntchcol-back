const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  updateProfile,
  getClientCredentials,
  resetClientPassword
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// Rutas protegidas
router.put('/profile', protect, updateProfile);

// Rutas de admin
router.get('/clients', protect, admin, getClients);
router.get('/clients/:id', protect, admin, getClientById);
router.get('/clients/:id/credentials', protect, admin, getClientCredentials);
router.post('/clients/:id/reset-password', protect, admin, resetClientPassword);

module.exports = router;