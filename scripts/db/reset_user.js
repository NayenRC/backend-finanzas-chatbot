import db from '../../src/config/db.js';
import Usuario from '../../src/models/Usuario.js';
import { Model } from 'objection';

Model.knex(db);

const emailToRemove = 'nayenromancepeda@gmail.com';

async function resetUser() {
    try {
        console.log(`🔍 Buscando usuario: ${emailToRemove}...`);
        const user = await Usuario.query().findOne({ email: emailToRemove });

        if (!user) {
            console.log('❌ El usuario no existe. No es necesario borrar nada.');
            process.exit(0);
        }

        console.log(`✅ Usuario encontrado (ID: ${user.user_id}). Eliminando...`);
        await Usuario.query().deleteById(user.user_id);

        console.log('🗑️ Usuario eliminado exitosamente. Ahora puedes registrarte de nuevo.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetUser();
