const EnergyData = require('../models/EnergyData');
const User = require('../models/User');

// @desc    Obtener datos en tiempo real
// @route   GET /api/energy/realtime/:clientId?
// @access  Private
const getRealTimeData = async (req, res) => {
  try {
    const clientId = req.params.clientId || req.user._id;

    // Si no es admin, solo puede ver sus propios datos
    if (req.user.role !== 'admin' && clientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Obtener el dato más reciente
    const latestData = await EnergyData.findOne({
      clientId,
      period: 'realtime'
    }).sort({ timestamp: -1 });

    if (!latestData) {
      // Si no hay datos, generar mock data
      return res.json({
        clientId,
        timestamp: new Date().toISOString(),
        production: Math.random() * 5 + 2,
        consumption: Math.random() * 3 + 1,
        gridImport: Math.random() * 1,
        gridExport: Math.random() * 2,
        period: 'realtime'
      });
    }

    res.json(latestData);
  } catch (error) {
    console.error('Error en getRealTimeData:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Obtener historial de datos
// @route   GET /api/energy/history/:clientId?
// @access  Private
const getHistoryData = async (req, res) => {
  try {
    const clientId = req.params.clientId || req.user._id;
    const { period = 'day' } = req.query;

    // Si no es admin, solo puede ver sus propios datos
    if (req.user.role !== 'admin' && clientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Calcular fecha de inicio según el período
    let startDate = new Date();
    let dataPoints = 24;

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        dataPoints = 7;
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        dataPoints = 30;
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        dataPoints = 12;
        break;
      default:
        startDate.setHours(startDate.getHours() - 24);
        dataPoints = 24;
    }

    const data = await EnergyData.find({
      clientId,
      timestamp: { $gte: startDate }
    })
      .sort({ timestamp: -1 })
      .limit(dataPoints);

    // Si no hay datos, generar mock data
    if (data.length === 0) {
      const mockData = Array.from({ length: dataPoints }, (_, i) => ({
        clientId,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        production: Math.random() * 30 + 10,
        consumption: Math.random() * 25 + 5,
        gridImport: Math.random() * 5,
        gridExport: Math.random() * 10,
        period: 'hourly'
      }));
      return res.json(mockData);
    }

    res.json(data);
  } catch (error) {
    console.error('Error en getHistoryData:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Obtener resumen de energía
// @route   GET /api/energy/summary/:clientId?
// @access  Private
const getSummary = async (req, res) => {
  try {
    const clientId = req.params.clientId || req.user._id;

    // Si no es admin, solo puede ver sus propios datos
    if (req.user.role !== 'admin' && clientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const now = new Date();

    // Hoy
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayData = await EnergyData.aggregate([
      {
        $match: {
          clientId: require('mongoose').Types.ObjectId(clientId),
          timestamp: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: null,
          production: { $sum: '$production' },
          consumption: { $sum: '$consumption' }
        }
      }
    ]);

    // Mes
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthData = await EnergyData.aggregate([
      {
        $match: {
          clientId: require('mongoose').Types.ObjectId(clientId),
          timestamp: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          production: { $sum: '$production' },
          consumption: { $sum: '$consumption' }
        }
      }
    ]);

    // Año
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearData = await EnergyData.aggregate([
      {
        $match: {
          clientId: require('mongoose').Types.ObjectId(clientId),
          timestamp: { $gte: yearStart }
        }
      },
      {
        $group: {
          _id: null,
          production: { $sum: '$production' },
          consumption: { $sum: '$consumption' }
        }
      }
    ]);

    const summary = {
      today: {
        production: todayData[0]?.production || 45.5,
        consumption: todayData[0]?.consumption || 32.1,
        savings: (todayData[0]?.production || 45.5) - (todayData[0]?.consumption || 32.1)
      },
      month: {
        production: monthData[0]?.production || 1234.5,
        consumption: monthData[0]?.consumption || 890.2,
        savings: (monthData[0]?.production || 1234.5) - (monthData[0]?.consumption || 890.2)
      },
      year: {
        production: yearData[0]?.production || 14567.8,
        consumption: yearData[0]?.consumption || 10234.5,
        savings: (yearData[0]?.production || 14567.8) - (yearData[0]?.consumption || 10234.5)
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Error en getSummary:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Agregar dato de energía (para IoT o simulación)
// @route   POST /api/energy/data
// @access  Private
const addEnergyData = async (req, res) => {
  try {
    const { clientId, production, consumption, gridImport, gridExport, period } = req.body;

    // Solo admin puede agregar datos para otros usuarios
    if (req.user.role !== 'admin' && clientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const energyData = await EnergyData.create({
      clientId: clientId || req.user._id,
      production,
      consumption,
      gridImport,
      gridExport,
      period: period || 'hourly'
    });

    res.status(201).json(energyData);
  } catch (error) {
    console.error('Error en addEnergyData:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Obtener estadísticas generales de todos los clientes (solo admin)
// @route   GET /api/energy/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalClients = await User.countDocuments({ role: 'client' });
    const activeClients = await User.countDocuments({ role: 'client', isActive: true });

    // Producción total del día
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayProduction = await EnergyData.aggregate([
      {
        $match: {
          timestamp: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: null,
          totalProduction: { $sum: '$production' },
          totalConsumption: { $sum: '$consumption' }
        }
      }
    ]);

    res.json({
      totalClients,
      activeClients,
      inactiveClients: totalClients - activeClients,
      todayProduction: todayProduction[0]?.totalProduction || 0,
      todayConsumption: todayProduction[0]?.totalConsumption || 0
    });
  } catch (error) {
    console.error('Error en getAdminStats:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  getRealTimeData,
  getHistoryData,
  getSummary,
  addEnergyData,
  getAdminStats
};