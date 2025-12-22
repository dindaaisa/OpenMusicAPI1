exports.up = async function (knex) {
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

  // playlists
  const hasPlaylists = await knex.schema.hasTable('playlists');
  if (!hasPlaylists) {
    await knex.schema.createTable('playlists', (table) => {
      table.string('id', 50).primary();
      table.string('name', 255).notNullable();
      table.string('owner', 50).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  // playlistsongs
  const hasPlaylistsongs = await knex.schema.hasTable('playlistsongs');
  if (!hasPlaylistsongs) {
    await knex.schema.createTable('playlistsongs', (table) => {
      table.string('id', 50).primary();
      table.string('playlist_id', 50).notNullable();
      table.string('song_id', 50).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
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
  }

  // Add foreign key constraints where referenced tables exist.
  // playlists.owner -> users(id)  (users exists in this migration)
  if (await knex.schema.hasTable('playlists')) {
    await knex.schema.alterTable('playlists', (table) => {
      // avoid duplicate FK creation
      try {
        table
          .foreign('owner')
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');
      } catch (e) {
        // ignore if FK already exists / cannot be created
      }
    });
  }

  // playlistsongs: playlist_id -> playlists, song_id -> songs (songs may be created in other migration)
  if (await knex.schema.hasTable('playlistsongs')) {
    await knex.schema.alterTable('playlistsongs', async (table) => {
      // playlist_id -> playlists (playlists exists)
      try {
        table
          .foreign('playlist_id')
          .references('id')
          .inTable('playlists')
          .onDelete('CASCADE');
      } catch (e) { /* ignore */ }
      // song_id -> songs (only add if songs table exists)
      if (await knex.schema.hasTable('songs')) {
        try {
          table
            .foreign('song_id')
            .references('id')
            .inTable('songs')
            .onDelete('CASCADE');
        } catch (e) { /* ignore */ }
      }
    });
  }

  // collaborations: playlist_id -> playlists, user_id -> users
  if (await knex.schema.hasTable('collaborations')) {
    await knex.schema.alterTable('collaborations', (table) => {
      try {
        table
          .foreign('playlist_id')
          .references('id')
          .inTable('playlists')
          .onDelete('CASCADE');
      } catch (e) { /* ignore */ }
      try {
        table
          .foreign('user_id')
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');
      } catch (e) { /* ignore */ }
    });
  }

  // playlist_song_activities: playlist_id -> playlists, song_id -> songs, user_id -> users
  if (await knex.schema.hasTable('playlist_song_activities')) {
    await knex.schema.alterTable('playlist_song_activities', async (table) => {
      try {
        table
          .foreign('playlist_id')
          .references('id')
          .inTable('playlists')
          .onDelete('CASCADE');
      } catch (e) { /* ignore */ }
      if (await knex.schema.hasTable('songs')) {
        try {
          table
            .foreign('song_id')
            .references('id')
            .inTable('songs')
            .onDelete('CASCADE');
        } catch (e) { /* ignore */ }
      }
      try {
        table
          .foreign('user_id')
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');
      } catch (e) { /* ignore */ }
    });
  }
};

exports.down = async function (knex) {
  // remove constraints and drop tables in reverse dependency order
  // drop playlist_song_activities
  if (await knex.schema.hasTable('playlist_song_activities')) {
    try {
      await knex.schema.alterTable('playlist_song_activities', (table) => {
        table.dropForeign('user_id');
        table.dropForeign('song_id');
        table.dropForeign('playlist_id');
      });
    } catch (e) { /* ignore */ }
    await knex.schema.dropTable('playlist_song_activities');
  }

  // drop collaborations
  if (await knex.schema.hasTable('collaborations')) {
    try {
      await knex.schema.alterTable('collaborations', (table) => {
        table.dropForeign('user_id');
        table.dropForeign('playlist_id');
      });
    } catch (e) { /* ignore */ }
    await knex.schema.dropTable('collaborations');
  }

  // drop playlistsongs
  if (await knex.schema.hasTable('playlistsongs')) {
    try {
      await knex.schema.alterTable('playlistsongs', (table) => {
        table.dropForeign('song_id');
        table.dropForeign('playlist_id');
      });
    } catch (e) { /* ignore */ }
    await knex.schema.dropTable('playlistsongs');
  }

  // drop playlists
  if (await knex.schema.hasTable('playlists')) {
    try {
      await knex.schema.alterTable('playlists', (table) => {
        table.dropForeign('owner');
      });
    } catch (e) { /* ignore */ }
    await knex.schema.dropTable('playlists');
  }

  // drop authentications
  if (await knex.schema.hasTable('authentications')) {
    await knex.schema.dropTable('authentications');
  }

  // drop users
  if (await knex.schema.hasTable('users')) {
    await knex.schema.dropTable('users');
  }
};