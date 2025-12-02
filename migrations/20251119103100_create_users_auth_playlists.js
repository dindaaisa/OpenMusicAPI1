/* Migration: create users, authentications, playlists, playlistsongs, collaborations, activities (V2)
   node-pg-migrate format
*/
exports.shorthands = undefined;

exports.up = (pgm) => {
  // users
  pgm.createTable('users', {
    id: { type: 'varchar(50)', primaryKey: true },
    username: { type: 'varchar(150)', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    fullname: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // authentications (store refresh tokens)
  pgm.createTable('authentications', {
    id: { type: 'varchar(50)', primaryKey: true },
    token: { type: 'text', notNull: true }, // refresh token
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // playlists
  pgm.createTable('playlists', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    owner: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // playlist songs mapping
  pgm.createTable('playlistsongs', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true },
    song_id: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // collaborations (optional)
  pgm.createTable('collaborations', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true },
    user_id: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // activities (optional)
  pgm.createTable('playlist_song_activities', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true },
    song_id: { type: 'varchar(50)', notNull: true },
    user_id: { type: 'varchar(50)', notNull: true },
    action: { type: 'varchar(10)', notNull: true }, // 'add'|'delete'
    time: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Foreign keys
  pgm.addConstraint('playlists', 'fk_playlists_owner', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('playlistsongs', 'fk_playlistsongs_playlist', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('playlistsongs', 'fk_playlistsongs_song', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('collaborations', 'fk_collaborations_playlist', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('collaborations', 'fk_collaborations_user', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('playlist_song_activities', 'fk_activities_playlist', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('playlist_song_activities', 'fk_activities_song', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('playlist_song_activities', 'fk_activities_user', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  // remove FKs and drop tables in reverse order
  pgm.dropConstraint('playlist_song_activities', 'fk_activities_user');
  pgm.dropConstraint('playlist_song_activities', 'fk_activities_song');
  pgm.dropConstraint('playlist_song_activities', 'fk_activities_playlist');
  pgm.dropTable('playlist_song_activities');

  pgm.dropConstraint('collaborations', 'fk_collaborations_user');
  pgm.dropConstraint('collaborations', 'fk_collaborations_playlist');
  pgm.dropTable('collaborations');

  pgm.dropConstraint('playlistsongs', 'fk_playlistsongs_song');
  pgm.dropConstraint('playlistsongs', 'fk_playlistsongs_playlist');
  pgm.dropTable('playlistsongs');

  pgm.dropConstraint('playlists', 'fk_playlists_owner');
  pgm.dropTable('playlists');

  pgm.dropTable('authentications');
  pgm.dropTable('users');
};