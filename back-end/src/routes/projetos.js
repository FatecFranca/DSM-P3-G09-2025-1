import{Router} from 'express';
import controller from '../controllers/projetos.js';

const router = Router();

router.post('/', controller.create);
// Dados a serem informados
/*
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
    id_gestor: String
*/

//router.get('/', controller.retrieveAll);

router.get('/:id', controller.retrieveOne);
// Dados a serem informados
/*
    id String (Projeto) via URL
*/

router.get('/gestor/:id', controller.retrieveAllGestor);
// Dados a serem informados
/*
    id String (Gestor) via URL
*/

router.get('/administrador/:id', controller.retrieveAllAdministrador);
// Dados a serem informados
/*
    id String (Administrador) via URL
*/

router.get('/membro/:id', controller.retrieveAllMembro);
// Dados a serem informados
/*
    id String (Membro) via URL
*/

router.put('/:id', controller.update);
// Dados a serem informados
/*
    id String (Projeto) via URL
    titulo: String
    descricao: String
    data_limite: Date ou String [2025-04-01]
    anexo: String (Opcional)
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

router.put('/addMembro/:id', controller.addMembro);
// Dados a serem informados
/*
    id String (Projeto) via URL
    id_membro: String
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

router.put('/removeMembro/:id', controller.removeMembro);
// Dados a serem informados
/*
    id String (Projeto) via URL
    id_membro: String
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

router.put('/addAdministrador/:id', controller.addAdministrador);
// Dados a serem informados
/*
    id String (Projeto) via URL
    id_administrador: String
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

router.put('/removeAdministrador/:id', controller.removeAdministrador);
// Dados a serem informados
/*
    id String (Projeto) via URL
    id_administrador: String
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

router.put('/updateGestor/:id', controller.updateGestor);
// Dados a serem informados
/*
    id String (Projeto) via URL
    id_gestorNovo: String
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

router.put('/updateStatus/:id', controller.updateStatus);
// Dados a serem informados
/*
    id String (Projeto) via URL
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
    tipo_alteracao: (Concluir / Reabrir)
*/

router.delete('/:id', controller.delete);
// Dados a serem informados
/*
    id String (Projeto) via URL
    id_gestor: String (Usuário Logado)
    senha_gestor: String (Usuário Informará a senha atual dele)
*/

export default router;