import { Model } from "objection";
import db from "../config/db.js";

class Usuario extends Model {

  /* =========================
     Tabla y PK
  ========================= */
  static get tableName() {
    return "usuarios"; // ⚠️ MISMO nombre que en DB
  }

  static get idColumn() {
    return "user_id";
  }

  /* =========================
     Schema (opcional)
  ========================= */
  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        user_id: { type: "string", format: "uuid" },
        nombre: { type: "string" },
        email: { type: "string" },
        moneda: { type: "string" },
        telefono: { type: ["string", "null"] },
        activo: { type: "boolean" },
      },
    };
  }

  /* =========================
     Métodos custom
  ========================= */
  static async findByEmail(email) {
    return await db(this.tableName)
      .where({ email })
      .first();
  }
}

export default Usuario;
