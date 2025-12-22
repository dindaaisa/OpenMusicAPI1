exports.up = async function (knex) {
  // albums
  const hasAlbums = await knex.schema.hasTable('albums');
  if (!hasAlbums) {
    await knex.schema.createTable('albums', (table) => {
      table.string('id', 50).primary();
      table.string('name', 255).notNullable();
      table.integer('year').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.text('cover_url').nullable();
    });
  }

  // songs (references albums)
  const hasSongs = await knex.schema.hasTable('songs');
  if (!hasSongs) {
    await knex.schema.createTable('songs', (table) => {
      table.string('id', 50).primary();
      table.string('title', 255).notNullable();
      table.integer('year').notNullable();
      table.string('performer', 255).notNullable();
      table.string('genre', 100).nullable();
      table.integer('duration').nullable();
      table.string('album_id', 50).nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });

    // add FK songs.album_id -> albums.id
    await knex.schema.alterTable('songs', (table) => {
      table
        .foreign('album_id')
        .references('id')
        .inTable('albums')
        .onDelete('CASCADE');
    });
  }

  // users
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
      table.string('id', 50).primary();
      table.string('username', 150).notNullable().unique();
      table.text('password').notNullable();
      table.string('fullname', 255).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  // authentications
  const hasAuth = await knex.schema.hasTable('authentications');
  if (!hasAuth) {
    await knex.schema.createTable('authentications', (table) => {
      table.string('id', 50).primary();
      table.text('token').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  // playlists (owner -> users)
  const hasPlaylists = await knex.schema.hasTable('playlists');
  if (!hasPlaylists) {
    await knex.schema.createTable('playlists', (table) => {
      table.string('id', 50).primary();
      table.string('name', 255).notNullable();
      table.string('owner', 50).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.alterTable('playlists', (table) => {
      table
        .foreign('owner')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
    });
  }

  // playlistsongs (playlist_id -> playlists, song_id -> songs)
  const hasPlaylistSongs = await knex.schema.hasTable('playlistsongs');
  if (!hasPlaylistSongs) {
    await knex.schema.createTable('playlistsongs', (table) => {
      table.string('id', 50).primary();
      table.string('playlist_id', 50).notNullable();
      table.string('song_id', 50).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.alterTable('playlistsongs', (table) => {
      table
        .foreign('playlist_id')
        .references('id')
        .inTable('playlists')
        .onDelete('CASCADE');
      table
        .foreign('song_id')
        .references('id')
        .inTable('songs')
        .onDelete('CASCADE');
    });
  }

  // collaborations
  const hasCollabs = await knex.schema.hasTable('collaborations');
  if (!hasCollabs) {
    await knex.schema.createTable('collaborations', (table) => {
      table.string('id', 50).primary();
      table.string('playlist_id', 50).notNullable();
      table.string('user_id', 50).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.alterTable('collaborations', (table) => {
      table
        .foreign('playlist_id')
        .references('id')
        .inTable('playlists')
        .onDelete('CASCADE');
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
    });
  }

  // playlist_song_activities
  const hasActivities = await knex.schema.hasTable('playlist_song_activities');
  if (!hasActivities) {
    await knex.schema.createTable('playlist_song_activities', (table) => {
      table.string('id', 50).primary();
      table.string('playlist_id', 50).notNullable();
      table.string('song_id', 50).notNullable();
      table.string('user_id', 50).notNullable();
      table.string('action', 10).notNullable(); // 'add'|'delete'
      table.timestamp('time').notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.alterTable('playlist_song_activities', (table) => {
      table
        .foreign('playlist_id')
        .references('id')
        .inTable('playlists')
        .onDelete('CASCADE');
      table
        .foreign('song_id')
        .references('id')
        .inTable('songs')
        .onDelete('CASCADE');
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
    });
  }
};

exports.down = async function (knex) {
  // drop in reverse order (FK dependencies)
  if (await knex.schema.hasTable('playlist_song_activities')) {
    await knex.schema.dropTable('playlist_song_activities');
  }
  if (await knex.schema.hasTable('collaborations')) {
    await knex.schema.dropTable('collaborations');
  }
  if (await knex.schema.hasTable('playlistsongs')) {
    await knex.schema.dropTable('playlistsongs');
  }
  if (await knex.schema.hasTable('playlists')) {
    await knex.schema.dropTable('playlists');
  }
  if (await knex.schema.hasTable('authentications')) {
    await knex.schema.dropTable('authentications');
  }
  if (await knex.schema.hasTable('users')) {
    await knex.schema.dropTable('users');
  }
  if (await knex.schema.hasTable('songs')) {
    await knex.schema.dropTable('songs');
  }
  if (await knex.schema.hasTable('albums')) {
    await knex.schema.dropTable('albums');
  }
};