import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'rate_limits';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('key', 255).notNullable().primary();
            table.integer('points', 9).notNullable().defaultTo(0);
            table.bigint('expire').unsigned();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1782914000000_create_rate_limits_table.js.map