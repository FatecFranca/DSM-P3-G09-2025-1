// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/atividades.js';
import upload from '../uploads/uploadAneAti.js';

const router = Router();


// Validada (08/05)
// Cadastro de Atividade
router.post('/', upload.single('anexoAtividade'), controller.create);
/*
    Dados a serem informados:
    descricao: String
    anexo: String (Opcional)
    id_subtarefa: String
*/


// Desativar posteriormente
router.get('/', controller.retrieveAll);


// Validada (08/05)
// Buscar os dados de uma atividade específica
router.get('/:id', controller.retrieveOne);


// Validada (08/05)
// Buscar todas as atividades de uma subtarefa
router.get('/subtarefa/:id', controller.retrieveAllSubTarefa);


// Validada (08/05)
// Alterar Atividade
router.put('/:id', upload.single('anexoAtividade'), controller.update);
/*
    Dados a serem informados:
    descricao: String
    anexo: String (Opcional)
*/


// Validado (10/05)
// Deletar atividade
router.delete('/:id', controller.delete);


export default router;