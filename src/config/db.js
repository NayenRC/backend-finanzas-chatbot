import knex from 'knex'
import { Model } from 'objection'
import knexConfig from '../../knexfile.js'


// Seleccionamos la configuración basada en el entorno (development por defecto)
const environment = process.env.NODE_ENV || 'development'
const config = knexConfig[environment]


// Inicializamos la instancia de Knex
const db = knex(config)


// 🔥 Enlazamos Knex con Objection (OBLIGATORIO)
Model.knex(db)


console.log('🗄️ Base de datos conectada (Knex + Objection)')
console.log('🧪 NODE_ENV:', process.env.NODE_ENV);
console.log('🧪 DATABASE_URL exists:', !!process.env.DATABASE_URL);


// Exportamos la instancia para usarla en los modelos
export default db