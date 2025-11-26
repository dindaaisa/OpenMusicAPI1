/* Migration: create albums and songs (V1)
   node-pg-migrate format
*/
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    year: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('songs', {
    id: { type: 'varchar(50)', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    year: { type: 'integer', notNull: true },
    performer: { type: 'varchar(255)', notNull: true },
    genre: { type: 'varchar(100)' },
    duration: { type: 'integer' },
    album_id: { type: 'varchar(50)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // add FK songs.album_id -> albums.id
  pgm.addConstraint('songs', 'fk_songs_album', {
    foreignKeys: {
      columns: 'album_id',
      references: 'albums(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs_album');
  pgm.dropTable('songs');
  pgm.dropTable('albums');
};