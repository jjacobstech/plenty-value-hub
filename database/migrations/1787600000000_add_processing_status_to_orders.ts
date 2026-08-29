import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    await this.db.rawQuery(`
      ALTER TABLE orders
        DROP CONSTRAINT IF EXISTS orders_status_check,
        ADD CONSTRAINT orders_status_check
          CHECK (status IN ('pending', 'processing', 'completed', 'refunded', 'cancelled'))
    `)
  }

  async down() {
    // Update any processing orders back to pending before removing the constraint
    await this.db.rawQuery(`
      UPDATE orders SET status = 'pending' WHERE status = 'processing'
    `)
    await this.db.rawQuery(`
      ALTER TABLE orders
        DROP CONSTRAINT IF EXISTS orders_status_check,
        ADD CONSTRAINT orders_status_check
          CHECK (status IN ('pending', 'completed', 'refunded', 'cancelled'))
    `)
  }
}
