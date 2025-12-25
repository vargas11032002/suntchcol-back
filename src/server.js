require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const energyRoutes = require('./routes/energyRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
connectDB();

app.use(cors()); // Middleware básico
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => res.json({ status: "Sun Tech Online" }));

module.exports = app;
