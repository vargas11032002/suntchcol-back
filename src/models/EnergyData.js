const mongoose = require('mongoose');

const energyDataSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  production: {
    type: Number, // kWh
    required: true,
    default: 0
  },
  consumption: {
    type: Number, // kWh
    required: true,
    default: 0
  },
  gridImport: {
    type: Number, // kWh
    default: 0
  },
  gridExport: {
    type: Number, // kWh
    default: 0
  },
  period: {
    type: String,
    enum: ['realtime', 'hourly', 'daily', 'monthly'],
    default: 'hourly'
  }
});

// Índice compuesto para búsquedas rápidas
energyDataSchema.index({ clientId: 1, timestamp: -1 });

module.exports = mongoose.model('EnergyData', energyDataSchema);