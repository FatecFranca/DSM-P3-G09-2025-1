import prisma from '../database/client.js'

const controller = {}

// Criando uma nova atividade
controller.create = async function(req, res) {
    try {
        await prisma.atividade.create({ data: req.body })

        // Retornando mensagem de sucesso
        res.status(201).json({mensagem: "Atividade Cadastrada com Sucessso!"})
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error)

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error)
    }
}

// Obtendo todas as atividades realizadas
controller.retrieveAll = async function(req, res) {
    try {
        // Buscando todas as atividades criadas
        const result = await prisma.atividade.findMany({
            orderBy: [ { data_criacao: 'asc' } ]
        })
    
        // Retorna os dados obtidos
        res.send(result)
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error)

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error)
    }
}

// Obtendo todas as atividades de uma determinada SubTarefa
controller.retrieveSubTask = async function(req, res) {
    try {
        // Buscando todas as atividades criadas para uma determinada SubTarefa
        const result = await prisma.atividade.findMany({
            where: [{id_subtarefa: req.params.id_subtarefa}],
            orderBy: [ { data_criacao: 'asc' } ]
        })
    
        // Retorna os dados obtidos
        res.send(result)
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error)

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error)
    }
}

// Obtendo todas as atividades de um determinado Membro
controller.retrieveMember = async function(req, res) {
    try {
        // Buscando todas as atividades criadas para um determinado Membro
        const result = await prisma.atividade.findMany({
            where: [{id_membro: req.params.id_membro}],
            orderBy: [ { data_criacao: 'asc' } ]
        })
    
        // Retorna os dados obtidos
        res.send(result)
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error)

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error)
    }
}

// Obtendo uma atividade específica
controller.retrieveOne = async function(req, res) {
    try {
        // Buscando os dados de uma atividade específica
        const result = await prisma.atividade.findUnique({
            where: {id: req.params.id}
        })
    
        // Retorna os dados obtidos
        res.send(result)
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error)

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error)
    }
}

// Atualizando os dados da atividade
controller.update = async function(req, res) {
    try {
      // Atualizando os dados da atividade
      await prisma.atividade.update({
        where: { id: req.params.id },
        data: req.body
      })
  
      // Retrnando mensagem de sucessao caso tenha atualizado
      res.status(201).json({mensagem: "Atividade Atualizada com Sucesso!"})
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
        res.status(404).end()
      }
      else {    // Outros tipos de erro
        // Deu errado: exibe o erro no terminal
        console.error(error)
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error)
      }
    }
}

// Deletando a atividade
controller.delete = async function(req, res) {
    try {
      // Busca o documento a ser excluído pelo id passado
      await prisma.atividade.delete({
        where: { id: req.params.id }
      })
  
      // Envia mensagem confirmando a exclusão
      res.status(201).json({mensagem: "Usuário Deletado com Sucessso!"})
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
        res.status(404).end()
      }
      else {    // Outros tipos de erro
        // Deu errado: exibe o erro no terminal
        console.error(error)
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error)
      }
    }
  }

export default controller