// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/tarefas.js';
import upload from '../uploads/uploadAneTar.js';

const router = Router();

// Rotas

// Validada (04/05)
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



// Validada (04/05)
// Buscar os dados de uma tarefa específica
router.get('/:id', controller.retrieveOne);


// Validada (04/05)
// Buscar todas as tarefas de um projeto
router.get('/projeto/:id', controller.retrieveAllProjeto);


// Validada (04/05)
// Alterar Tarefa
router.put('/:id', upload.single('anexoTarefa'), controller.update);
/*
    Dados a serem informados:
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
*/


// Validada (04/05)
// Adicionar administrador ao projeto
router.put('/updateOrdem/:id', controller.updateOrdem);
/*
    Dados a serem informados:
    ordem: Number ou tipo: String (antecipar, regredir)
*/


// Validada (04/05)
// Adicionar administrador ao projeto
router.put('/updateStatus/:id', controller.updateStatus);
/*
    Dados a serem informados:
    tipo_alteracao: String (Concluir, Reabrir))

*/


// Testar com tarefas / subtarefas / atividades 
// Deletar tarefa
router.delete('/:id', controller.delete);


export default router;