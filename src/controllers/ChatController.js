import chatService from '../services/chatService.js';

export async function sendMessage(req, res) {
  try {
    const user_id = req.user.user_id; // viene del middleware auth
    const { message } = req.body;

    const reply = await chatService.processMessage(user_id, message);

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error procesando mensaje' });
  }
}

// controllers/chatController.js
export async function getHistory(req, res) {
  try {
    const user_id = req.user.user_id;
    const history = await chatService.getChatHistory(user_id);
    res.json(history);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener historial' });
  }
}

