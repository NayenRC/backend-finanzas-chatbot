import db from './src/config/db.js';
import Usuario from './src/models/Usuario.js';
import { Model } from 'objection';

Model.knex(db);

async function fixUser() {
    const email = 'nayenignacia@gmail.com';
    try {
        console.log(`🔍 Buscando usuario: ${email}`);
        const user = await Usuario.query().findOne({ email });

        if (user) {
            console.log('✅ Usuario encontrado. Eliminando para permitir re-registro limpio...');
            await Usuario.query().delete().where({ email });
            console.log('🚀 Usuario eliminado exitosamente.');
        } else {
            console.log('❓ El usuario no existe en la base de datos vinculada a este script.');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixUser();
