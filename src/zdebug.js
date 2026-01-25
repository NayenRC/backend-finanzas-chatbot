/**
 * Debug Script - Verbose Mode
 * 
 * Script para probar la integración con OpenRouter y Supabase manualmente.
 * Incluye diagnóstico de conexión.
 * Ejecutar con: node src/zdebug.js
 */

import 'dotenv/config';
import aiChatCommand from './commands/aiChatCommand.js';
import db from './config/db.js';

async function runTests() {
    console.log('🧪 Iniciando pruebas de diagnóstico...');
    console.log('📅 Hora:', new Date().toISOString());
    console.log('');

    // 1. Verificar variables de entorno
    console.log('🔍 1. Verificando configuración...');
    const dbUrl = process.env.DATABASE_URL || '';
    const hasAnon = !!process.env.SUPABASE_ANON_KEY;
    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;

    console.log(`   - DATABASE_URL: ${dbUrl ? '✅ Definida' : '❌ Faltante'} (${dbUrl.split('@')[1] || 'Formato inválido'})`);
    console.log(`   - SUPABASE_ANON_KEY: ${hasAnon ? '✅ Definida' : '⚠️ Faltante (algunas funciones AI pueden fallar)'}`);
    console.log(`   - OPENROUTER_API_KEY: ${hasOpenRouter ? '✅ Definida' : '❌ Faltante'}`);

    if (!dbUrl) {
        console.error('❌ FATAL: Falta DATABASE_URL en .env');
        process.exit(1);
    }

    // 2. Probar conexión a DB explícitamente
    console.log('\n📡 2. Probando conectividad a Base de Datos (timeout 5s)...');
    try {
        const start = Date.now();
        // Intentar una consulta simple con timeout corto
        await db.raw('SELECT 1').timeout(5000);
        const end = Date.now();
        console.log(`   ✅ Conexión EXITOSA a PostgreSQL! (${end - start}ms)`);
    } catch (error) {
        console.error('   ❌ ERROR DE CONEXIÓN A BASE DE DATOS');
        console.error('   -------------------------------------');
        console.error(`   Código: ${error.code}`);
        console.error(`   Syscall: ${error.syscall}`);
        console.error(`   Host: ${error.address}:${error.port}`);
        console.error('   -------------------------------------');

        if (error.code === 'ETIMEDOUT') {
            console.log('\n💡 DIAGNÓSTICO: BLOQUEO DE RED');
            console.log('   El error ETIMEDOUT indica que el servidor no responde.');
            console.log('   Causas probables:');
            console.log('   1. Bloqueo de puerto 5432 en tu red (común en oficinas/universidades).');
            console.log('   2. Proyecto de Supabase "Pausado" -> Ve al dashboard de Supabase y reactívalo.');
            console.log('   3. DATABASE_URL incorrecta.');
            console.log('\n   ⚠️ Intenta conectarte usando una red móvil (4G) o VPN para probar.');
        }

        // Terminamos aquí porque sin DB no podemos hacer nada
        process.exit(1);
    }

    // 3. Si la conexión funciona, probamos el chat
    console.log('\n🤖 3. Iniciando pruebas de Inteligencia Artificial...');

    // Buscar un usuario existente o crear uno de prueba
    let userId;
    try {
        const existingUser = await db('usuario').first();
        if (existingUser) {
            userId = existingUser.user_id;
            console.log(`   ✅ Usuario existente encontrado: ${userId} (${existingUser.nombre || 'Sin nombre'})`);
        } else {
            console.log('   ⚠️ No hay usuarios en DB. Creando usuario de prueba...');
            const [newUser] = await db('usuario').insert({
                nombre: 'Usuario Test Zdebug',
                email: 'test@zdebug.com',
                moneda: 'CLP'
            }).returning('*');
            userId = newUser.user_id;
            console.log(`   ✅ Usuario de prueba creado: ${userId}`);
        }
    } catch (err) {
        console.error('   ❌ Error al gestionar usuario de prueba:', err.message);
        process.exit(1);
    }

    console.log(`   👤 Usando User ID: ${userId}`);

    const testCases = [
        "Hola, ¿qué puedes hacer?",
        "Gasté 4500 en una hamburguesa",
        "¿Cuánto he gastado hoy?"
    ];

    for (const message of testCases) {
        console.log(`\n   📨 Mensaje Usuario: "${message}"`);
        console.log('   ⏳ Enviando a AI Command Handler...');

        try {
            const result = await aiChatCommand.processMessage(userId, message);

            console.log('\n   🤖 Respuesta recibida:');
            console.log('   ' + '-'.repeat(40));
            console.log(`   ${result.response}`);
            console.log('   ' + '-'.repeat(40));
            console.log(`   📊 Intención: ${result.intent}`);

        } catch (error) {
            console.error('\n   ❌ Error procesando mensaje:', error.message);
            if (error.cause) console.error('   🔍 Causa:', error.cause);
            console.error('   Stack:', error.stack);
        }
    }

    console.log('\n✅ Pruebas finalizadas');
    await db.destroy();
}

runTests();
