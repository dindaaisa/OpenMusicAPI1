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
    const { cover } = request.payload;

    // Pastikan file ada di payload
    if (!cover || !cover.hapi) {
      return h.response({ 
        status: 'fail', 
        message: 'File cover tidak ditemukan' 
      }).code(400);
    }

    // Get file metadata
    const file = cover;
    const headers = file.hapi.headers || {};
    const contentType = headers['content-type'] || '';
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];

    // Validasi tipe file gambar
    if (!allowed.includes(contentType)) {
      return h.response({ 
        status: 'fail', 
        message: 'Tipe file bukan gambar' 
      }).code(400);
    }

    // Tentukan path direktori upload
    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Tentukan ekstensi dan nama file
    const filename = file.hapi.filename || 'cover.jpg';
    const ext = path.extname(filename) || '.jpg';
    const newFilename = `cover-${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, newFilename);

    // Simpan file
    const writeStream = fs.createWriteStream(filePath);
    
    await new Promise((resolve, reject) => {
      file.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      file.on('error', reject);
    });

    // Bangun URL untuk mengakses gambar cover
    const base = process.env.APP_BASE_URL ? process.env.APP_BASE_URL.replace(/\/$/, '') : 'http://localhost:5000';
    const coverUrl = `${base}/uploads/${newFilename}`;

    // Update album dengan URL cover baru
    await this._albumService.updateCoverUrl(albumId, coverUrl);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }
}

module.exports = CoverHandler;