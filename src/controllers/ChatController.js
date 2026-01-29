import aiChatCommand from '../commands/aiChatCommand.js';

export const processMessage = async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;
        const { mensaje } = req.body;

        if (!mensaje) {
            return res.status(400).json({ message: 'El mensaje es requerido' });
        }

        // Call the existing AI logic
        const result = await aiChatCommand.processMessage(userId, mensaje);

        // Clean up response if needed (remove markdown artifacts if the frontend doesn't render them well, 
        // but React usually handles markdown or we display raw text. The bot logic removes #### locally)

        // The aiChatCommand returns { success, response, intent }
        res.json(result);

    } catch (error) {
        console.error('❌ CHAT CONTROLLER ERROR:', error);
        res.status(500).json({ message: 'Error procesando el mensaje', error: error.message });
    }
};
