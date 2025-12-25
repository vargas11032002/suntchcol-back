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

// 1. Conectar a MongoDB
connectDB();

// 2. Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. REGISTRO DE RUTAS (El orden importa)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/tickets', ticketRoutes);

// Ruta base para verificar que el servidor responde
app.get('/', (req, res) => {
  res.json({ message: '🌞 Sun Tech Solar API está Online' });
});

// 4. Manejo de errores (Solo si ninguna ruta de arriba coincide)
app.use((req, res) => {
  res.status(404).json({ 
    message: `Ruta no encontrada: ${req.originalUrl}`,
    ayuda: "La URL debe empezar con /api/auth, /api/users, etc."
  });
});

module.exports = app;
