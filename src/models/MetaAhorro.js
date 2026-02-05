import Model from './Model.js';

class MetaAhorro extends Model {
  static get tableName() {
    return 'meta_ahorro';
  }

  static get idColumn() {
    return 'id_meta';
  }

  static findByUser(user_id) {
    return this.query()
      .where('user_id', user_id)
      .orderBy('created_at', 'desc');
  }

  static findByIdAndUser(id_meta, user_id) {
    return this.query()
      .where({ id_meta, user_id })
      .first();
  }

  static getByUser(user_id) {
    return this.findByUser(user_id);
  }

  // 🔧 FALTABAN ESTOS ↓↓↓

  static async updateByUser(id_meta, user_id, data) {
    const updated = await this.query()
      .patchAndFetchById(id_meta, data);

    if (!updated || updated.user_id !== user_id) {
      return null;
    }

    return updated;
  }

  static async deleteByUser(id_meta, user_id) {
    const meta = await this.findByIdAndUser(id_meta, user_id);
    if (!meta) return false;

    await this.query()
      .deleteById(id_meta);

    return true;
  }
}

export default MetaAhorro;
