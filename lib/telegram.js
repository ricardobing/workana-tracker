/**
 * Módulo de notificaciones por Telegram
 * Envía alertas cuando se publican nuevos trabajos en Workana
 */

import TelegramBot from 'node-telegram-bot-api';

// Configuración desde variables de entorno
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Verificar si Telegram está configurado
const isTelegramEnabled = BOT_TOKEN && CHAT_ID;

// Crear instancia del bot (solo si está configurado)
let bot = null;
if (isTelegramEnabled) {
  try {
    bot = new TelegramBot(BOT_TOKEN, { polling: false });
    console.log('[TELEGRAM] Bot inicializado correctamente');
  } catch (error) {
    console.error('[TELEGRAM] Error al inicializar bot:', error.message);
  }
}

/**
 * Enviar notificación de nuevos trabajos
 * @param {Array} newJobs - Array de trabajos nuevos
 * @returns {Promise<boolean>} true si se envió correctamente, false si falló
 */
export async function notifyNewJobs(newJobs) {
  if (!isTelegramEnabled) {
    console.log('[TELEGRAM] Notificaciones deshabilitadas (sin configuración)');
    return false;
  }

  if (!bot) {
    console.error('[TELEGRAM] Bot no inicializado');
    return false;
  }

  if (!newJobs || newJobs.length === 0) {
    console.log('[TELEGRAM] No hay trabajos nuevos para notificar');
    return false;
  }

  try {
    // Construir mensaje
    const count = newJobs.length;
    let message = `🎉 *¡${count} nuevo${count > 1 ? 's' : ''} trabajo${count > 1 ? 's' : ''} en Workana!*\n\n`;

    // Agregar hasta 5 trabajos al mensaje
    const jobsToShow = newJobs.slice(0, 5);
    
    jobsToShow.forEach((job, index) => {
      message += `📌 *${index + 1}. ${job.title}*\n`;
      message += `📍 ${job.country}\n`;
      
      if (job.budget && job.budget !== 'No especificado') {
        message += `💰 ${job.budget}\n`;
      }
      
      if (job.skills && job.skills.length > 0) {
        const skills = job.skills.slice(0, 3).join(', ');
        message += `💻 ${skills}\n`;
      }
      
      message += `🔗 ${job.link}\n\n`;
    });

    // Si hay más trabajos, agregar nota
    if (newJobs.length > 5) {
      message += `_...y ${newJobs.length - 5} trabajos más_\n\n`;
    }

    message += `🕒 ${new Date().toLocaleString('es-ES')}`;

    // Enviar mensaje
    await bot.sendMessage(CHAT_ID, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });

    console.log(`[TELEGRAM] Notificación enviada: ${count} trabajos`);
    return true;
  } catch (error) {
    console.error('[TELEGRAM] Error al enviar notificación:', error.message);
    return false;
  }
}

/**
 * Enviar notificación de un trabajo específico
 * @param {Object} job - Trabajo individual
 * @returns {Promise<boolean>}
 */
export async function notifySingleJob(job) {
  if (!isTelegramEnabled || !bot) {
    return false;
  }

  try {
    let message = `🎯 *Nuevo trabajo en Workana*\n\n`;
    message += `📌 *${job.title}*\n`;
    message += `📍 ${job.country}\n`;
    
    if (job.budget && job.budget !== 'No especificado') {
      message += `💰 ${job.budget}\n`;
    }
    
    if (job.skills && job.skills.length > 0) {
      message += `💻 ${job.skills.join(', ')}\n`;
    }
    
    if (job.paidJobs && job.paidJobs !== 'No especificado') {
      message += `✓ ${job.paidJobs}\n`;
    }
    
    message += `\n🔗 ${job.link}`;

    await bot.sendMessage(CHAT_ID, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });

    console.log('[TELEGRAM] Notificación individual enviada');
    return true;
  } catch (error) {
    console.error('[TELEGRAM] Error al enviar notificación individual:', error.message);
    return false;
  }
}

/**
 * Enviar mensaje de prueba
 * @returns {Promise<boolean>}
 */
export async function sendTestMessage() {
  if (!isTelegramEnabled || !bot) {
    console.error('[TELEGRAM] Bot no configurado');
    return false;
  }

  try {
    const message = `✅ *Workana Tracker*\n\n` +
      `Bot de notificaciones configurado correctamente.\n\n` +
      `🕒 ${new Date().toLocaleString('es-ES')}`;

    await bot.sendMessage(CHAT_ID, message, {
      parse_mode: 'Markdown',
    });

    console.log('[TELEGRAM] Mensaje de prueba enviado');
    return true;
  } catch (error) {
    console.error('[TELEGRAM] Error al enviar mensaje de prueba:', error.message);
    return false;
  }
}

/**
 * Verificar si Telegram está habilitado
 * @returns {boolean}
 */
export function isTelegramConfigured() {
  return isTelegramEnabled;
}

// Exportar por defecto
export default {
  notifyNewJobs,
  notifySingleJob,
  sendTestMessage,
  isTelegramConfigured,
};
