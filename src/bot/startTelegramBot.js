export async function startTelegramBot() {
  try {
    await import('./telegramBot.js');
    console.log('🤖 Telegram bot iniciado');
  } catch (err) {
    console.error('❌ Error iniciando Telegram Bot:', err.message);
  }
}
