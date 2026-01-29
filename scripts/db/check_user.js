import db from '../../src/config/db.js';
import Usuario from '../../src/models/Usuario.js';
import { Model } from 'objection';

Model.knex(db);

async function checkSpecificUser() {
    const emailToCheck = 'nayenromancepeda@gmail.com';
    try {
        console.log(`--- Checking User: ${emailToCheck} ---`);
        const user = await Usuario.query().findOne({ email: emailToCheck });
        if (user) {
            console.log('✅ User exists!');
            console.log(`ID: ${user.user_id}`);
            console.log(`Nombre: ${user.nombre}`);
            console.log(`Activo: ${user.activo}`);
            console.log(`Password Hash starts with: ${user.password.substring(0, 10)}...`);
        } else {
            console.log('❌ User NOT found.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking user:', error);
        process.exit(1);
    }
}

checkSpecificUser();
