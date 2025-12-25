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
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/tickets', ticketRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🌞 Sun Tech Solar API funcionando',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      energy: '/api/energy',
      tickets: '/api/tickets'
    }
  });
});

// --- LOS CAMBIOS ESTÁN AQUÍ ABAJO ---

// Manejo de errores 404 (Rutas no encontradas)
app.use((req, res, next) => {
  const error = new Error(`No se encontró la ruta - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// MANEJADOR DE ERRORES GLOBAL (El que resuelve el error 500)
// Debe tener los 4 parámetros para que Express lo reconozca
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`❌ Error detectado: ${err.message}`);
  
  res.status(statusCode).json({
    message: err.message,
    // Solo mostramos el stack trace si no estamos en producción
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
});