import db from '../../src/config/db.js';
import Usuario from '../../src/models/Usuario.js';
import { Model } from 'objection';

Model.knex(db);

async function listUsers() {
    try {
        const users = await Usuario.query().select('email', 'nombre', 'password', 'creado_en');
        console.log('--- USUARIOS EN DB ---');
        console.table(users.map(u => ({
            ...u,
            password: u.password ? u.password.substring(0, 10) + '...' : 'null'
        })));
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

listUsers();
