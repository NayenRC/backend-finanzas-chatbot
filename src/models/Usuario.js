import Model from "./Model.js";
import crypto from "crypto";

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

  async $beforeInsert() {
    if (!this.user_id) {
      this.user_id = crypto.randomUUID();
    }
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
  static async findByUser(user_id) {
    return this.query()
      .where(function () {
        this.where('user_id', user_id).orWhereNull('user_id');
      })
      .orderBy('nombre', 'asc');
  }
  static async findByEmail(email) {
    return this.query().findOne({ email });
  }

}

export default Usuario;
