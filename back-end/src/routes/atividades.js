// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/atividades.js';
import upload from '../uploads/uploadAneAti.js';

const router = Router();

// Cadastro de Atividade
router.post('/', upload.single('anexo'), controller.create);
/*
    Dados a serem informados:
    descricao: String
    anexo: String (Opcional)
    id_subtarefa: String
*/

// Desativar posteriormente
// router.get('/', controller.retrieveAll);

// Buscar os dados de uma atividade específica
router.get('/:id', controller.retrieveOne);

// Buscar todas as atividades de uma subtarefa
router.get('/subtarefa/:id', controller.retrieveAllSubTarefa);

// Alterar Atividade
router.put('/:id', upload.single('anexo'), controller.update);
/*
    Dados a serem informados:
    descricao: String
    anexo: String (Opcional)
*/

// Deletar atividade
router.delete('/:id', controller.delete);

export default router;