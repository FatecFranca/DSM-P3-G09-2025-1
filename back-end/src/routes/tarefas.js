// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/tarefas.js';
import upload from '../uploads/uploadAneTar.js';

const router = Router();

// Cadastro de Tarefa
router.post('/', upload.single('anexoTarefa'), controller.create);
/*
    Dados a serem informados:
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
    id_projeto: String
*/


// Desativar posteriormente
router.get('/', controller.retrieveAll);


// Buscar os dados de uma tarefa específica
router.get('/:id', controller.retrieveOne);


// Buscar todas as tarefas de um projeto
router.get('/projeto/:id', controller.retrieveAllProjeto);


// Alterar Tarefa
router.put('/:id', upload.single('anexoTarefa'), controller.update);
/*
    Dados a serem informados:
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
*/


// Adicionar administrador ao projeto
router.put('/updateOrdem/:id', controller.updateOrdem);
/*
    Dados a serem informados:
    ordem: Number ou tipo: String (antecipar, regredir)
*/


// Adicionar administrador ao projeto
router.put('/updateStatus/:id', controller.updateStatus);
/*
    Dados a serem informados:
    tipo_alteracao: String (Concluir, Reabrir))

*/


// Deletar projeto
router.delete('/:id', controller.delete);


export default router;