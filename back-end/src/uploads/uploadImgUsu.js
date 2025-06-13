// Importando bibliotecas necessárias
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configura onde e como o arquivo será salvo
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'imgUsuarios'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {

  const tamanhoMaximo = 50 * 1024 * 1024;

  const tiposPermitidos = [
    'image/jpeg',
    'image/jpg',
    'image/png',
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
