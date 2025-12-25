const User = require('../models/User');
const Installation = require('../models/Installation');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registro de Administradores
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'El email ya existe' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Registrar cliente (ADMIN)
const registerClient = async (req, res) => {
  try {
    const { name, email, password, phone, address, panelCount, totalCapacity, notes } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'El email ya está registrado' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Crear el Usuario
    const user = await User.create({
      name, email, password: hashedPassword, phone: phone || "", address: address || "", role: 'client',
      createdBy: req.user ? req.user._id : null
    });

    // 2. Crear la Instalación (Ficha Técnica)
    let installation;
    try {
      installation = await Installation.create({
        clientId: user._id,
        clientName: name,
        clientEmail: email,
        clientPhone: phone || "No proporcionado", // CAMPO REQUERIDO
        panelCount: Number(panelCount) || 0,
        totalCapacity: Number(totalCapacity) || 0,
        location: { 
          address: address || "Sin dirección" // CAMPO REQUERIDO
        },
        notes: notes || "",
        status: 'active'
      });
    } catch (instError) {
      // Si la ficha técnica falla, borramos el usuario creado para evitar datos en 0
      await User.findByIdAndDelete(user._id);
      console.error("❌ ERROR ESPECÍFICO DE INSTALACIÓN:", instError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Fallo en la creación de la ficha técnica', 
        error: instError.message 
      });
    }

    // 3. Vincular ID de instalación al usuario
    user.installationId = installation._id;
    await user.save();

    // 4. Respuesta exitosa para la alerta de la App
    res.status(201).json({
      success: true,
      message: 'Cliente registrado con éxito',
      data: { name, email, password, phone } 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('installationId');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, registerClient, getProfile };