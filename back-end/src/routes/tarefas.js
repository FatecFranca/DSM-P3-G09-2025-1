import{Router} from 'express';
import controller from '../controllers/tarefas.js';

const router = Router();

router.post('/', controller.create);
router.get('/', controller.retrieveAll);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;