const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" }, // 🚀 CRÍTICO: Permite guardar el teléfono
  address: { type: String, default: "" }, // 🚀 CRÍTICO: Permite guardar la dirección
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  installationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Installation' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);