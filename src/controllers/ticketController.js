const Ticket = require('../models/Ticket');

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // 1. Buscamos el ticket actual para obtener la nota que ya existe
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ success: false, message: 'No encontrado' });

    let updateData = {};
    if (status) updateData.status = status;

    // 2. ✅ LÓGICA DE HISTORIAL (Concatenación)
    if (adminNotes && adminNotes.trim() !== "") {
      const fecha = new Date().toLocaleString();
      const nuevaNotaFormateada = `[${fecha}]: ${adminNotes.trim()}`;
      
      // Sumamos la nueva nota arriba de las anteriores
      updateData.adminNotes = ticket.adminNotes 
        ? `${nuevaNotaFormateada}\n\n${ticket.adminNotes}`
        : nuevaNotaFormateada;
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTickets = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { clientId: req.user._id };
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, data: ticket });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

const createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create({ ...req.body, clientId: req.user._id, clientName: req.user.name });
    res.status(201).json({ success: true, data: ticket });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

const deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Eliminado' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

module.exports = { getTickets, getTicketById, createTicket, updateTicket, deleteTicket };