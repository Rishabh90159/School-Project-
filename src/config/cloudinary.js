import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|txt)$/i.test(file.originalname);
    if (allowed) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX, TXT allowed'), false);
  },
});

export async function uploadBufferToCloudinary(buffer, folder = 'student-portal', options = {}) {
  console.log("coming to the uploadbuffertocloud");
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'raw', ...options },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    uploadStream.end(buffer);
  });
}

export default cloudinary;
