// Importando bibliotecas necessárias
import{Router} from 'express';
import controller from '../controllers/notificacoes.js';

const router = Router();

// Desativar posteriormente
router.get('/', controller.retrieveAll);


// Buscar os dados de uma notificação específica
router.get('/:id', controller.retrieveOne);


// Buscar todas as atividades de uma subtarefa
router.get('/usuario/:id', controller.retrieveAllUsuario);


// Deletar atividade
router.delete('/:id', controller.delete);


export default router;