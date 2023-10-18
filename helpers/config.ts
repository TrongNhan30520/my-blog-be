import { diskStorage } from 'multer';

//config upload image by multer

export const storageConfig = (folder: string) =>
  diskStorage({
    destination: `uploads/${folder}`, //folder upload
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // config file name unique
    },
  });
