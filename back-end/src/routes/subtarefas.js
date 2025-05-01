// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/subtarefas.js';
import upload from '../uploads/uploadAneSubTar.js';

const router = Router();

// Cadastro de Tarefa
router.post('/', upload.single('anexoSubtarefa'), controller.create);
/*
    Dados a serem informados:
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
    id_tarefa: String
*/


// Desativar posteriormente
router.get('/', controller.retrieveAll);


// Buscar os dados de uma subtarefa específica
router.get('/:id', controller.retrieveOne);


// Buscar todas as subtarefas de uma tarefa
router.get('/tarefa/:id', controller.retrieveAllTarefa);


// Alterar Tarefa
router.put('/:id', upload.single('anexoSubtarefa'), controller.update);
/*
    Dados a serem informados:
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
*/


// Mudar ordem da subtarefa
router.put('/updateOrdem/:id', controller.updateOrdem);
/*
    Dados a serem informados:
    ordem: Number ou tipo: String (antecipar, regredir)
*/


// Mudar o status da subtarefa
router.put('/updateStatus/:id', controller.updateStatus);
/*
    Dados a serem informados:
    tipo_alteracao: String (Concluir, Reabrir))

*/


// Addicionar membro a subtarefa
router.put('/addMembro/:id', controller.addMembro);
/*
    Dados a serem informados:
    id_membro: String

*/


// Addicionar membro a subtarefa
router.put('/removeMembro/:id', controller.removeMembro);
/*
    Dados a serem informados:
    id_membro: String

*/


// Deletar projeto
router.delete('/:id', controller.delete);


export default router;