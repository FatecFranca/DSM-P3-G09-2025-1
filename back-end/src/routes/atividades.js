import{Router} from 'express'
import controller from '../controllers/atividades.js'

const router = Router()

router.post('/', controller.create)
router.get('/:id', controller.retrieveAll)
router.get('/subtask/:id_subtarefa', controller.retrieveSubTask)
router.get('/member/id:membro', controller.retrieveMember)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)
