const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CoverHandler {
  constructor({ albumService }) {
    this._albumService = albumService;
    this.postCoverHandler = this.postCoverHandler.bind(this);
  }

  async postCoverHandler(request, h) {
    const { id: albumId } = request.params;
    
    // Verify album exists first
    await this._albumService.verifyAlbumExists(albumId);
    
    const file = request.payload.cover;

    // Pastikan file ada di payload
    if (!file) {
      return h.response({ status: 'fail', message: 'File cover tidak ditemukan' }).code(400);
    }

    // Check if file is a stream with hapi metadata
    if (!file.hapi) {
      return h.response({ status: 'fail', message: 'Format file tidak valid' }).code(400);
    }

    const headers = file.hapi.headers || {};
    const contentType = headers['content-type'] || '';
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    // Validasi tipe file gambar
    if (!allowed.includes(contentType)) {
      return h.response({ status: 'fail', message: 'Tipe file bukan gambar' }).code(400);
    }

    // Tentukan path direktori upload
    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // Tentukan ekstensi dan nama file
    const ext = path.extname(file.hapi.filename) || '.jpg';
    const filename = `cover-${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Simpan file
    const writeStream = fs.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      file.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      file.on('error', reject);
    });

    // Bangun URL untuk mengakses gambar cover
    const base = process.env.APP_BASE_URL ? process.env.APP_BASE_URL.replace(/\/$/, '') : '';
    const coverUrl = `${base}/uploads/${filename}`;

    // Update album dengan URL cover baru
    await this._albumService.updateCoverUrl(albumId, coverUrl);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
      data: { coverUrl }
    }).code(201);
  }
}

module.exports = CoverHandler;
