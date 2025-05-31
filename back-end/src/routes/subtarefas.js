// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/subtarefas.js';
import upload from '../uploads/uploadAneSubTar.js';

const router = Router();

// Validada (07/05)
// Cadastro de Subtarefa
router.post('/', upload.single('anexoSub'), controller.create);
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


// Validada (07/05)
// Buscar os dados de uma subtarefa específica
router.get('/:id', controller.retrieveOne);


// Validada (07/05)
// Buscar todas as subtarefas de uma tarefa
router.get('/tarefa/:id', controller.retrieveAllTarefa);



// Alterar Subtarefa
router.put('/:id', upload.single('anexoSub'), controller.update);
/*
    Dados a serem informados:
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
*/


// Validada (07/05)
// Mudar ordem da subtarefa
router.put('/updateOrdem/:id', controller.updateOrdem);
/*
    Dados a serem informados:
    ordem: Number ou tipo: String (antecipar, regredir)
*/


// Validada (07/05)
// Mudar o status da subtarefa
router.put('/updateStatus/:id', controller.updateStatus);
/*
    Dados a serem informados:
    tipo_alteracao: String (Concluir, Reabrir)

*/


// Validada (07/05)
// Addicionar membro a subtarefa
router.put('/addMembro/:id', controller.addMembro);
/*
    Dados a serem informados:
    id_membro: String

*/


// Validada (07/05)
// Addicionar membro a subtarefa
router.put('/removeMembro/:id', controller.removeMembro);
/*
    Dados a serem informados:
    id_membro: String
*/


// Testar com atividades 
// Deletar subtarefa
router.delete('/:id', controller.delete);

export default router;