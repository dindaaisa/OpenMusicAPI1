exports.up = async function (knex) {
    // Tambah kolom cover_url ke albums jika belum ada
    if (await knex.schema.hasTable('albums')) {
      const hasCover = await knex.schema.hasColumn('albums', 'cover_url');
      if (!hasCover) {
        await knex.schema.alterTable('albums', (table) => {
          table.text('cover_url').nullable();
        });
      }
    }
  
    // Buat tabel user_album_likes jika belum ada
    if (!(await knex.schema.hasTable('user_album_likes'))) {
      await knex.schema.createTable('user_album_likes', (table) => {
        table.string('id', 50).primary();
        table.string('user_id', 50).notNullable();
        table.string('album_id', 50).notNullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  
        table
          .foreign('user_id')
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');
        table
          .foreign('album_id')
          .references('id')
          .inTable('albums')
          .onDelete('CASCADE');
  
        table.unique(['user_id', 'album_id']);
      });
    }
  };
  
  exports.down = async function (knex) {
    // Hapus tabel user_album_likes jika ada
    if (await knex.schema.hasTable('user_album_likes')) {
      await knex.schema.dropTable('user_album_likes');
    }
  
    // Hapus kolom cover_url dari albums jika ada
    if (await knex.schema.hasTable('albums')) {
      const hasCover = await knex.schema.hasColumn('albums', 'cover_url');
      if (hasCover) {
        await knex.schema.alterTable('albums', (table) => {
          table.dropColumn('cover_url');
        });
      }
    }
  };