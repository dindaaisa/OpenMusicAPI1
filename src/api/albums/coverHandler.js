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
    const file = request.payload.cover;
    if (!file || !file.hapi) {
      return h.response({ status: 'fail', message: 'File cover tidak ditemukan' }).code(400);
    }

    const headers = file.hapi.headers || {};
    const contentType = headers['content-type'] || '';
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(contentType)) {
      return h.response({ status: 'fail', message: 'Tipe file bukan gambar' }).code(400);
    }

    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = path.extname(file.hapi.filename) || '.jpg';
    const filename = `cover-${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // save
    const writeStream = fs.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      file.pipe(writeStream);
      file.on('end', resolve);
      file.on('error', reject);
    });

    // build URL (sesuaikan APP_BASE_URL di .env)
    const base = process.env.APP_BASE_URL ? process.env.APP_BASE_URL.replace(/\/$/, '') : '';
    const coverUrl = `${base}/uploads/${filename}`;

    await this._albumService.updateCoverUrl(albumId, coverUrl);

    return h.response({ status: 'success', message: 'Sampul berhasil diunggah', data: { coverUrl } }).code(201);
  }
}

module.exports = CoverHandler;