// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/usuarios.js';
import upload from '../uploads/uploadImgUsu.js';

const router = Router();

// Criar usuário
router.post('/', upload.single('fotoUsuario'), controller.create);
/*
    Dados a serem informados:
    nome: String
    email: String
    senha: String
*/

// Desativa após o desenvolvimento
// router.get('/', controller.retrieveAll);

// Validada (04/05)
// Buscar dados de um usuário
router.get('/:id', controller.retrieveOne);

// Realizar Login
router.post('/email/:email', controller.loginEmail);
/*
    Dados a serem informados:
    senha: String
*/

// Encerrar sessão
router.get('/encerrarSessao/true', controller.encerrarSessao);

// Verifica se o usuário está logado
router.get('/verificaSessao/true', controller.verificaSessao);

// Alterar dados do usuário
router.put('/:id', upload.single('fotoUsuario'), controller.update);
/*
    Dados a serem informados:
    nome: String
    email: String
    foto: String (Opcional)
    senha: String (Será a nova senha)
    senha_atual: String (Senha antiga / atual)
*/

// Deletar usuário
router.delete('/:id', controller.delete);
/*
    Dados a serem informados:
    senha_atual: String (Senha antiga / atual)
*/

export default router;