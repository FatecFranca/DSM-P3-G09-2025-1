// Importando bibliotecas necessárias
// Arrumar anexo de tarefas
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

const upload = multer({ storage });

export default upload;
