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

// ✅ 1. CONFIGURACIÓN DE CORS DEFINITIVA
// Esto resuelve el error "Response to preflight request doesn't pass access control check"
app.use(cors({
  origin: true, // Permite cualquier origen (importante para tu localhost:8081)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// ✅ 2. MANEJO DE PETICIONES PRE-FLIGHT (OPTIONS)
// Es vital para que el navegador "confíe" en el servidor de Vercel
app.options('*', cors());

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

// Manejo de errores 404
app.use((req, res, next) => {
  const error = new Error(`No se encontró la ruta - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Manejador de errores global
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`❌ Error detectado: ${err.message}`);
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ✅ 3. CONDICIONAL PARA SERVIDOR LOCAL
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
}

// ✅ 4. EXPORTACIÓN OBLIGATORIA PARA VERCEL
module.exports = app;
