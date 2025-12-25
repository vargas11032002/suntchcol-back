const User = require('../models/User');
const Installation = require('../models/Installation');

// @desc    Obtener todos los clientes (solo admin)
// @route   GET /api/users/clients
// @access  Private/Admin
const getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' })
      .select('-password')
      .populate('installationId')
      .sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    console.error('Error en getClients:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Obtener cliente por ID (solo admin)
// @route   GET /api/users/clients/:id
// @access  Private/Admin
const getClientById = async (req, res) => {
  try {
    const client = await User.findById(req.params.id)
      .select('-password')
      .populate('installationId');

    if (!client || client.role !== 'client') {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error en getClientById:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.photo = req.body.photo || user.photo;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        photo: updatedUser.photo,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Obtener credenciales de cliente (solo admin)
// @route   GET /api/users/clients/:id/credentials
// @access  Private/Admin
const getClientCredentials = async (req, res) => {
  try {
    const client = await User.findById(req.params.id)
      .populate('installationId');

    if (!client || client.role !== 'client') {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // En producción, NUNCA devuelvas la contraseña real
    // Aquí solo para propósitos de demostración
    res.json({
      email: client.email,
      installationCode: client.installationId?.installationCode || 'N/A',
      message: 'Por seguridad, las contraseñas no se pueden recuperar. Puedes generar una nueva contraseña temporal.'
    });
  } catch (error) {
    console.error('Error en getClientCredentials:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Generar nueva contraseña temporal para cliente (solo admin)
// @route   POST /api/users/clients/:id/reset-password
// @access  Private/Admin
const resetClientPassword = async (req, res) => {
  try {
    const client = await User.findById(req.params.id);

    if (!client || client.role !== 'client') {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Generar nueva contraseña temporal
    const { generateTempPassword } = require('../controllers/authController');
    const tempPassword = generateTempPassword();

    client.password = tempPassword;
    await client.save();

    res.json({
      message: 'Contraseña temporal generada',
      email: client.email,
      temporaryPassword: tempPassword
    });
  } catch (error) {
    console.error('Error en resetClientPassword:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  getClients,
  getClientById,
  updateProfile,
  getClientCredentials,
  resetClientPassword
};