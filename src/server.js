require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const energyRoutes = require('./routes/energyRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

// Conectar a MongoDB
connectDB();

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ REGISTRO DE RUTAS
// Asegúrate de que estas líneas estén ANTES de cualquier manejador de error
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/tickets', ticketRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '🌞 Sun Tech Solar API funcionando correctamente' });
});

// Manejo de errores (Lo que está saltando en tu pantalla)
app.use((req, res, next) => {
  res.status(404).json({
    message: `No se encontró la ruta - ${req.originalUrl}`
  });
});

module.exports = app;
