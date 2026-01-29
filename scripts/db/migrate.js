import knex from 'knex';
import config from './knexfile.js';

const db = knex(config.development);

async function runMigrate() {
    try {
        console.log('Running migrations...');
        const [batchNo, log] = await db.migrate.latest();
        if (log.length === 0) {
            console.log('Already up to date');
        } else {
            console.log('Batch', batchNo, 'run:', log.length, 'migrations');
            console.log(log.join('\n'));
        }
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await db.destroy();
    }
}

runMigrate();
