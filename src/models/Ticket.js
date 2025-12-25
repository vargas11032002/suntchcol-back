const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  clientName: { type: String, required: true },
  clientPhone: String,
  clientEmail: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'], 
    default: 'open' 
  },
  adminNotes: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);