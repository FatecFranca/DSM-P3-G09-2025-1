import { Router } from 'express'
const router = Router()

/* GET home page. */
router.get('/', function (req, res) {
  res.send('Aplicação "Gerenciado de Projetos e Tarefas" rodando normalmente!')
})

export default router
