// Importando bibliotecas necessárias
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configura onde e como o arquivo será salvo
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'anexoAtividades'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {

  const tamanhoMaximo = 50 * 1024 * 1024;

  const tiposPermitidos = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    if (file.size > tamanhoMaximo) {
        req.tamanhoExedido = true;
        cb(null, false);
    }
    cb(null, true);
  } else {
    req.tipoInvalido = true;
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter
});


export default upload;
