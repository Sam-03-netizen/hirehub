import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer keeps the file in memory; we stream the buffer straight to Cloudinary.
export const uploadBuffer = (buffer, folder, resourceType = 'auto') =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: `hirehub/${folder}`, resource_type: resourceType }, (err, result) =>
        err ? reject(err) : resolve(result)
      )
      .end(buffer);
  });
