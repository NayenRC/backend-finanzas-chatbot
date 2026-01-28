import { Model } from 'objection';

class Usuario extends Model {
  // 1. Nombre exacto de la tabla en tu base de datos Supabase
  static get tableName() {
    return 'usuario';
  }

  // 2. Nombre de la columna que es Llave Primaria
  static get idColumn() {
    return 'user_id';
  }

  // 3. Validación opcional de datos (Schema)
  static get jsonSchema() {
    return {
      type: 'object',
      // required: ['nombre', 'email'], // Descomenta si quieres forzar validación
      properties: {
        user_id: { type: 'string', format: 'uuid' },
        nombre: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', minLength: 1, maxLength: 255 },
        moneda: { type: 'string', maxLength: 3 }, // Ej: 'CLP', 'USD'
        telefono: { type: 'string' },
        activo: { type: 'boolean' },
        reset_password_token: { type: ['string', 'null'] },
        reset_password_expires: { type: ['string', 'null', 'object'], format: 'date-time' }
      }
    };
  }
}


export default Usuario;