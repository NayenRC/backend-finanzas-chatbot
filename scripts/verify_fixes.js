import ChatMensaje from '../src/models/ChatMensaje.js';
import Categoria from '../src/models/Categoria.js';
import Gasto from '../src/models/Gasto.js';
import Ingreso from '../src/models/Ingreso.js';

async function verifyFixes() {
    try {
        console.log('🧪 Verificando modelos...');

        // 1. Verificar ChatMensaje (que fallaba con .query is not a function)
        const chatCheck = await ChatMensaje.query().select().limit(1);
        console.log('✅ ChatMensaje.query() funciona correctly.');

        // 2. Verificar Categoria
        const catCheck = await Categoria.query().select().limit(1);
        console.log('✅ Categoria.query() funciona correctly.');

        // 3. Verificar Gasto (asegurar que sigue bien)
        const gastoCheck = await Gasto.query().select().limit(1);
        console.log('✅ Gasto.query() funciona correctly.');

        // 4. Verificar Ingreso (asegurar que sigue bien y chequear columnas si es posible)
        const ingresoCheck = await Ingreso.query().select().limit(1);
        console.log('✅ Ingreso.query() funciona correctly.');

        console.log('🎉 Todas las verificaciones de modelo pasaron exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en verificación:', error);
        process.exit(1);
    }
}

verifyFixes();
