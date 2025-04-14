import{Router} from 'express';
import controller from '../controllers/usuarios.js';

const router = Router();

router.post('/', controller.create);
// Dados a serem informados
/*
    nome: String
    email: String
    foto: String (Opcional)
    senha: String
*/

// Desativa após o desenvolvimento
router.get('/', controller.retrieveAll);
// Dados a serem informados
/*
    Nenhum dado, somente requisitar na URL normal
*/

router.get('/:id', controller.retrieveOne);
// Dados a serem informados
/*
    id via URL
*/

// (Login)
router.get('/email/:email', controller.loginEmail);
// Dados a serem informados
/*
    email via URL
*/

router.put('/:id', controller.update);
// Dados a serem informados
/*
    id via URL
    nome: String
    email: String
    foto: String (Opcional)
    senha: String (Será a nova senha)
    senha_atual: String (Senha antiga / atual)
*/

router.delete('/:id', controller.delete);
// Dados a serem informados
/*
    id via URL
    senha_atual: String (Senha antiga / atual)
*/

export default router;