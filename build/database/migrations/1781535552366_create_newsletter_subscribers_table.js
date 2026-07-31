import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'newsletter_subscribers';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('email').unique().notNullable();
            table.string('name').nullable();
            table.json('interests').nullable();
            table.enum('status', ['active', 'unsubscribed']).defaultTo('active');
            table.string('source').nullable();
            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1781535552366_create_newsletter_subscribers_table.js.map