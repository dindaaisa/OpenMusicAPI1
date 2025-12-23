class PlaylistService {
    // Method untuk mengambil data playlist berdasarkan ID
    async getPlaylistById(playlistId) {
      // Logika untuk mengambil data playlist dari database atau cache
      const playlist = await db.query('SELECT * FROM playlists WHERE id = ?', [playlistId]);
      return playlist[0]; // Mengembalikan hasil pertama (jika ada)
    }
  
    // Method untuk mengecek apakah playlist ada di database
    async verifyPlaylist(playlistId) {
      const result = await db.query('SELECT COUNT(*) FROM playlists WHERE id = ?', [playlistId]);
      return result[0]['COUNT(*)'] > 0; // Mengembalikan true jika playlist ada
    }
  }
  
  module.exports = new PlaylistService();
  