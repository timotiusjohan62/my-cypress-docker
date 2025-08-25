exports.up = function(knex) {
  return knex.schema.table('books', table => {
    // Add new columns
    table.string('isbn');
    table.string('genre');
    table.text('description');
    table.integer('pages');
    table.string('publisher');
  });
};

exports.down = function(knex) {
  return knex.schema.table('books', table => {
    // Remove columns if rolling back
    table.dropColumn('isbn');
    table.dropColumn('genre');
    table.dropColumn('description');
    table.dropColumn('pages');
    table.dropColumn('publisher');
  });
};