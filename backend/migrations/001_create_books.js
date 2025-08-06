exports.up = function (knex) {
  return knex.schema.createTable('books', (table) => {
    table.increments('id').primary();
    table.string('title');
    table.string('author');
    table.integer('published');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('books');
};
