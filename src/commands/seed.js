/**
 * Command: Seed Database
 *
 * Este script es un ejemplo de cómo ejecutar lógica de negocio fuera
 * del ciclo de vida de una petición HTTP (ej. tareas cron, scripts de mantenimiento).
 *
 * Uso: npm run command:seed
 */

import db from '../config/db.js';
import Article from '../models/Article.js';

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  try {
    // Verificar conexión
    await db.raw('SELECT 1');
    console.log('✅ Conexión a base de datos exitosa.');

    // Limpiar tabla (opcional)
    // await db('articles').del();

    // Crear artículos de ejemplo
    const articles = [
      {
        title: 'Introducción a Node.js 24',
        content: 'Node.js 24 trae nuevas características interesantes...',
        author: 'Profe Backend',
      },
      {
        title: '¿Qué es Knex.js?',
        content: 'Knex es un query builder SQL para JavaScript que facilita...',
        author: 'Estudiante A',
      },
      {
        title: 'Integrando IA con OpenRouter',
        content:
          'OpenRouter nos permite acceder a modelos como GPT-4 y Claude...',
        author: 'Antigravity',
      },
    ];

    for (const articleData of articles) {
      // Usamos nuestro modelo para crear
      // Nota: Si la tabla no existe, esto fallará. Asegúrate de correr migraciones antes.
      try {
        await Article.create(articleData);
        console.log(`✅ Artículo creado: ${articleData.title}`);
      } catch (err) {
        console.error(
          `❌ Error creando artículo ${articleData.title}:`,
          err.message,
        );
      }
    }

    console.log('🏁 Seed finalizado.');
  } catch (error) {
    console.error('🔥 Error fatal:', error);
  } finally {
    // IMPORTANTE: Cerrar la conexión al terminar scripts independientes
    await db.destroy();
  }
}

main();
