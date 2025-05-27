// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/projetos.js';
import upload from '../uploads/uploadAneProj.js';

const router = Router();

// Rotas

// Validada (04/05) - Validar Anexo com Front
// Cadastro de projeto
router.post('/', upload.single('anexoProjeto'), controller.create);
/*
    Dados a serem informados:
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
*/


// Desativar posteriormente
router.get('/', controller.retrieveAll);


// Validada (04/05) 
// Buscar dados de um projeto
router.get('/:id', controller.retrieveOne);


// Validada (04/05)
// Busca de projetos do gestor logado
router.get('/gestor/true', controller.retrieveAllGestor);


// Validada (04/05)
// Busca de projetos em que é administrador
router.get('/administrador/true', controller.retrieveAllAdministrador);


// Validada (04/05)
// Busca de projetos em que é membro
router.get('/membro/true', controller.retrieveAllMembro);


// Validada (04/05)
// Alterar projeto
router.put('/:id', upload.single('anexo'), controller.update);
/*
    Dados a serem informados:
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/


// Validada (04/05)
// Adicionar membro ao projeto
router.put('/addMembro/:id', controller.addMembro);
/*
    Dados a serem informados:
    email_usuario: String
*/


// Validada (04/05)
// Remover membro ao projeto
router.put('/removeMembro/:id', controller.removeMembro);
/*
    Dados a serem informados:
    id_membro: String
*/


// Validada (04/05) 
// Adicionar administrador ao projeto
router.put('/addAdministrador/:id', controller.addAdministrador);
/*
    Dados a serem informados:
    email_usuario: String
*/


// Validada (04/05)
// Remover administrador ao projeto
router.put('/removeAdministrador/:id', controller.removeAdministrador);
/*
    Dados a serem informados:
    id_administrador: String
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/


// Validada (04/05)
// Alterar gestor do projeto
router.put('/updateGestor/:id', controller.updateGestor);
/*
    Dados a serem informados:
    id_gestorNovo: String
    senha_gestor: String (Usuário Informará a senha atual dele)
*/


// Validada (04/05)
// Mudar o status do projeto (finalizar ou reabrir)
router.put('/updateStatus/:id', controller.updateStatus);
/*
    Dados a serem informados:
    senha_gestor: String (Usuário Informará a senha atual dele)
    tipo_alteracao: (Concluir / Reabrir)
*/


// Testar com tarefas / subtarefas / atividades 
// Deletar projeto
router.delete('/:id', controller.delete);
/*
    Dados a serem informados:
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

export default router;