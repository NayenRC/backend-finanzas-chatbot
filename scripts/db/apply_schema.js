import knex from 'knex';
import 'dotenv/config';

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    },
});

async function applyChanges() {
    try {
        console.log('Adding columns to usuario chart...');
        await db.schema.alterTable('usuario', table => {
            table.string('reset_password_token').nullable().index();
            table.timestamp('reset_password_expires').nullable();
        });
        console.log('✅ Columns added successfully');

        // Mark migration as run in knex_migrations table if it exists
        try {
            await db('knex_migrations').insert({
                name: '20260128035859_add_reset_password_fields.js',
                batch: 2,
                migration_time: new Date()
            });
            console.log('✅ Migration marked as completed in database');
        } catch (e) {
            console.log('Could not mark migration in knex_migrations (this is fine if you dont use migrations normally)');
        }

    } catch (err) {
        console.error('❌ Failed to apply changes:', err);
    } finally {
        await db.destroy();
    }
}

applyChanges();
