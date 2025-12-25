const express = require('express');
const router = express.Router();
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');
const { protect, admin } = require('../middleware/auth');

// Rutas protegidas
router.route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.route('/:id')
  .get(protect, getTicketById)
  .put(protect, updateTicket)
  .delete(protect, admin, deleteTicket);

module.exports = router;