import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('products', (table) => {
      table.string('digital_asset_url').nullable()
      table.string('digital_asset_name').nullable()
    })

    this.schema.alterTable('orders', (table) => {
      table.json('shipping_details').nullable()
    })
  }

  async down() {
    this.schema.alterTable('products', (table) => {
      table.dropColumn('digital_asset_url')
      table.dropColumn('digital_asset_name')
    })

    this.schema.alterTable('orders', (table) => {
      table.dropColumn('shipping_details')
    })
  }
}
