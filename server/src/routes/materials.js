import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import Material from '../models/Material.js';
import { auth, teacherOnly } from '../middleware/auth.js';
import { upload, uploadBufferToCloudinary } from '../config/cloudinary.js';
import cloudinary from '../config/cloudinary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'materials');

function getMaterialFilePath(materialId) {
  return path.join(UPLOADS_DIR, String(materialId));
}

function parseCloudinaryRawUrl(fileUrl) {
  try {
    const pathname = new URL(fileUrl).pathname;
    const withVersion = pathname.match(/\/raw\/upload\/v(\d+)\/(.+)$/);
    if (withVersion) {
      return { publicId: decodeURIComponent(withVersion[2]), version: parseInt(withVersion[1], 10) };
    }
    const noVersion = pathname.match(/\/raw\/upload\/(.+)$/);
    return noVersion ? { publicId: decodeURIComponent(noVersion[1]), version: null } : null;
  } catch {
    return null;
  }
}

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const materials = await Material.find().populate('uploadedBy', 'name').sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve file for View (local copy first to avoid Cloudinary 401; fallback to Cloudinary)
router.get('/:id/file', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    if (!material.fileUrl) return res.status(404).json({ message: 'No file for this material' });

    const contentType = material.fileName?.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : material.fileName?.toLowerCase().match(/\.(doc|docx)$/) ? 'application/msword' : 'application/octet-stream';
    const disposition = `inline; filename="${(material.fileName || 'file').replace(/"/g, '%22')}"`;
    res.setHeader('Content-Disposition', disposition);

    const localPath = getMaterialFilePath(material._id);
    try {
      await fs.access(localPath);
      res.setHeader('Content-Type', contentType);
      const buffer = await fs.readFile(localPath);
      return res.send(buffer);
    } catch {
      // No local file: fetch from Cloudinary (may 401 if access restricted)
    }

    const fetchOptions = {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*',
      },
    };
    let urlToFetch = material.fileUrl;
    const parsed = parseCloudinaryRawUrl(material.fileUrl);
    if (parsed && process.env.CLOUDINARY_API_SECRET) {
      try {
        const opts = { resource_type: 'raw', sign_url: true, type: 'upload' };
        if (parsed.version != null) opts.version = parsed.version;
        urlToFetch = cloudinary.url(parsed.publicId, opts);
      } catch (e) {
        console.error('[materials/file] Signed URL build failed:', e.message);
      }
    }

    const fetchRes = await fetch(urlToFetch, fetchOptions);
    if (!fetchRes.ok) {
      console.error(`[materials/file] Cloudinary returned ${fetchRes.status} for ${material.fileUrl}`);
      return res.status(502).json({
        message: 'Failed to fetch file from storage',
        detail: `Storage returned ${fetchRes.status}. Re-upload the material to enable viewing.`,
      });
    }
    res.setHeader('Content-Type', contentType);
    const buffer = await fetchRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[materials/file] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/',
  auth,
  teacherOnly,
  upload.single('file'),
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('type').optional().isIn(['pdf', 'notes', 'link']),
  body('subject').optional().trim(),
  body('topic').optional().trim(),
  body('linkUrl').optional().trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { title, description, type, subject, topic, linkUrl } = req.body;
      let fileUrl, fileName;
      if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadBufferToCloudinary(req.file.buffer, 'student-portal/materials', {
          resource_type: 'raw',
          public_id: `${Date.now()}-${req.file.originalname.replace(/\s/g, '_')}`,
        });
        fileUrl = result.secure_url;
        fileName = req.file.originalname;
      }

      const material = await Material.create({
        title,
        description,
        type: type || 'pdf',
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
        linkUrl: linkUrl || undefined,
        subject,
        topic,
        uploadedBy: req.user._id,
      });

      if (req.file?.buffer) {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        await fs.writeFile(getMaterialFilePath(material._id), req.file.buffer);
      }

      await material.populate('uploadedBy', 'name');
      res.status(201).json(material);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    const localPath = getMaterialFilePath(material._id);
    try {
      await fs.unlink(localPath);
    } catch {
      // ignore if no local file
    }
    await material.deleteOne();
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
