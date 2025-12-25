const express = require('express');
const router = express.Router();
const {
  register,
  login,
  registerClient,
  getProfile
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', protect, getProfile);

// Rutas de admin
router.post('/register-client', protect, admin, registerClient);

module.exports = router;