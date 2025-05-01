// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/projetos.js';
import upload from '../uploads/uploadAneProj.js';

const router = Router();

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


// Buscar dados de um projeto
router.get('/:id', controller.retrieveOne);


// Busca de projetos do gestor logado
router.get('/gestor/true', controller.retrieveAllGestor);


// Busca de projetos em que é administrador
router.get('/administrador/true', controller.retrieveAllAdministrador);


// Busca de projetos em que é membro
router.get('/membro/true', controller.retrieveAllMembro);


// Alterar projeto
router.put('/:id', upload.single('anexoProjeto'), controller.update);
/*
    Dados a serem informados:
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/


// Adicionar membro ao projeto
router.put('/addMembro/:id', controller.addMembro);
/*
    Dados a serem informados:
    id_membro: String
*/


// Remover membro ao projeto
router.put('/removeMembro/:id', controller.removeMembro);
/*
    Dados a serem informados:
    id_membro: String
*/


// Adicionar administrador ao projeto
router.put('/addAdministrador/:id', controller.addAdministrador);
/*
    Dados a serem informados:
    id_administrador: String
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/


// Remover administrador ao projeto
router.put('/removeAdministrador/:id', controller.removeAdministrador);
/*
    Dados a serem informados:
    id_administrador: String
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

// Alterar gestor do projeto
router.put('/updateGestor/:id', controller.updateGestor);
/*
    Dados a serem informados:
    id_gestorNovo: String
    senha_gestor: String (Usuário Informará a senha atual dele)
*/


// Mudar o status do projeto (finalizar ou reabrir)
router.put('/updateStatus/:id', controller.updateStatus);
/*
    Dados a serem informados:
    senha_gestor: String (Usuário Informará a senha atual dele)
    tipo_alteracao: (Concluir / Reabrir)
*/


// Deletar projeto
router.delete('/:id', controller.delete);
/*
    Dados a serem informados:
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

export default router;