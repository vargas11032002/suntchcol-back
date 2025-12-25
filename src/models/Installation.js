const mongoose = require('mongoose');

const installationSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  clientPhone: {
    type: String,
    required: true
  },
  panelCount: {
    type: Number,
    required: true,
    default: 0
  },
  totalCapacity: {
    type: Number, // kW
    required: true,
    default: 0
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  location: {
    address: {
      type: String,
      required: true
    },
    latitude: Number,
    longitude: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  inverterModel: String,
  panelModel: String,
  notes: String,
  installationCode: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// MODIFICACIÓN CRÍTICA: Usamos una función async sin 'next'
installationSchema.pre('save', async function() {
  if (!this.installationCode) {
    this.installationCode = `ST-${Math.random().toString(36).slice(-6).toUpperCase()}`;
  }
  this.updatedAt = Date.now();
  // Al ser async, Mongoose detecta automáticamente cuando termina sin necesidad de next()
});

module.exports = mongoose.model('Installation', installationSchema);