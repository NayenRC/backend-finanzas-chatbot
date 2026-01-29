import db from '../../src/config/db.js';
import Usuario from '../../src/models/Usuario.js';
import { Model } from 'objection';

Model.knex(db);

async function verifyFieldRetrieval() {
    const email = `test_${Date.now()}@test.com`;
    const password = 'mypassword123';
    const bcrypt = (await import('bcrypt')).default;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('1. Inserting user...');
        const newUser = await Usuario.query().insert({
            user_id: (await import('uuid')).v4(),
            nombre: 'Test User',
            email: email,
            password: hashedPassword,
            activo: true
        });
        console.log('✅ User inserted.');

        console.log('2. Fetching user with findOne...');
        const fetchedUser = await Usuario.query().findOne({ email });

        console.log('--- Fetched User Fields ---');
        console.log('Has password field:', !!fetchedUser.password);
        if (fetchedUser.password) {
            console.log('Password length:', fetchedUser.password.length);
            const match = await bcrypt.compare(password, fetchedUser.password);
            console.log('Bcrypt compare result:', match);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyFieldRetrieval();
