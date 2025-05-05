// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/usuarios.js';
import upload from '../uploads/uploadImgUsu.js';

const router = Router();

// Rotas

// Validada (04/05) - Validar Imagem com Front
// Criar usuário
router.post('/', upload.single('fotoUsuario'), controller.create);
/*
    Dados a serem informados:
    nome: String
    email: String
    senha: String
*/


// Desativa após o desenvolvimento
router.get('/', controller.retrieveAll);


// Validada (04/05)
// Buscar dados de um usuário
router.get('/:id', controller.retrieveOne);


// Validada (04/05)
// Realizar Login
router.post('/email/:email', controller.loginEmail);
/*
    Dados a serem informados:
    senha: String
*/


// Validada (04/05)
// Encerrar sessão
router.get('/encerrarSessao/true', controller.encerrarSessao);


// Validada (04/05) - Validar Imagem com Front
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


// Testar com projetos / tarefas / subtarefas / atividades 
// Deletar usuário
router.delete('/:id', controller.delete);
/*
    Dados a serem informados:
    senha_atual: String (Senha antiga / atual)
*/

export default router;