import{Router} from 'express';
import controller from '../controllers/projetos.js';

const router = Router();

router.post('/', controller.create);
router.get('/', controller.retrieveAll);
router.get('/:id', controller.retrieveOne);
router.get('/gestor/:id', controller.retrieveAllGestor);
router.get('/administrador/:id', controller.retrieveAllAdministrador);
router.get('/membro/:id', controller.retrieveAllMembro);
router.put('/:id', controller.update);
router.put('/addMembro/:id', controller.addMembro);
router.put('/removeMembro/:id', controller.removeMembro);
router.put('/addAdministrador/:id', controller.addAdministrador);
router.put('/removeAdministrador/:id', controller.removeAdministrador);
router.delete('/:id', controller.delete);

export default router;