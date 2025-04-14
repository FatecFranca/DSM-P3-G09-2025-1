// Caro autor do arquivo, favor revisa-lo antes de liber-lo.
// Se esta mensagem ainda estiver aqui, significará que ele não foi revisado.

// Implemetar em Update / Create / Delete a adição do anexo da tarefa em uma pasta, bem como a sua remoção caso necessário.

// Alterar ordem

// Importando arquivos e bibliotecas importantes
import prisma from '../database/client.js';
const controller = {};


// Criando uma nova tarefa
controller.create = async function(req, res) {
    try {

        // Obtendo a ultíma tarefa para inserir a ordem correta
        const ultimaTarefa = await prisma.tarefa.findUnique({
            orderBy: {ordem: "des"}
        });

        req.body.ordem = ultimaTarefa.ordem + 1;
        req.body.status = "Pendente";
        req.body.data_criacao = new Date();
        req.body.data_limite = new Date(req.body.data_limite);
        await prisma.tarefa.create({ data: req.body });

        // Retornando mensagem de sucesso
        res.status(201).json({mensagem: "Tarefa Cadastrada com Sucessso!"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

/*
// Obtendo todas as tarefas cadastradas
controller.retrieveAll = async function(req, res) {
    try {
        // Buscando todas as tarefas cadastradas
        const result = await prisma.tarefa.findMany({
            orderBy: [ { data_criacao: 'asc' } ]
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhuma Tarefa Encontrada!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}
*/

// Obtendo todas as tarefas cadastradas de um determinado projeto
controller.retrieveAllProjeto = async function(req, res) {
    try {
        // Buscando todas as tarefas cadastradas
        const result = await prisma.tarefa.findMany({
            where: [{ id_projeto: req.body.id_projeto}],
            orderBy: [ { ordem: 'asc' } ]
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhuma Tarefa Encontrada!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}

// Obtendo uma tarefa específica pelo id
controller.retrieveOne = async function(req, res) {
    try {
        // Buscando os dados de uma tarefa específica
        const result = await prisma.tarefa.findUnique({
            where: {id: req.params.id}
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhuma Tarefa Encontrada!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}


// Atualizando os dados da tarefa
controller.update = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor ou algum administrador da tarefa
        const verificaTarefa = await prisma.tarefa.findUnique({
            where: { id: req.params.id }
        });

        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id_projeto }
        });

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
            let achou = 0;
            verificaProjeto.ids_administradores.forEach(id => {
                if (id === req.body.id_administrador){
                    achou = 1;
                }
            });

            if (achou !== 1){
                return res.status(400).json({ mensagem: "Você não tem permissão para alterar essa Tarefa!"});
            }
        }

        delete req.body.id_administrador;
        delete req.body.id_gestor;

        // Verificando se a data foi informada para converte-la em um formato aceitavel
        if (req.body.data_limite){
            req.body.data_limite = new Date(req.body.data_limite);
        }

        // Atualizando os dados da tarefa
        await prisma.tarefa.update({
            where: { id: req.params.id },
            data: req.body
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        res.status(201).json({mensagem: "Tarefa Atualizada com Sucesso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Tarefa Não Encontrada!"});
      }
      else {    // Outros tipos de erro
        // Deu errado: exibe o erro no terminal
        console.error(error);
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
      }
    }
}


// Deletando a tarefa
controller.delete = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor ou algum administrador da tarefa
        const verificaTarefa = await prisma.tarefa.findUnique({
            where: { id: req.params.id }
        });

        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id_projeto }
        });

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
            let achou = 0;
            verificaProjeto.ids_administradores.forEach(id => {
                if (id === req.body.id_administrador){
                    achou = 1;
                }
            });

            if (achou !== 1){
                return res.status(400).json({ mensagem: "Você não tem permissão para alterar essa Tarefa!"});
            }
        }

        delete req.body.id_administrador;
        delete req.body.id_gestor;

        // Deletando todos os dados relacionados ao projeto
        // Criar depois as exclusões das Subtarefas e Atividades

        // Busca o projeto a ser excluído
        await prisma.tarefa.delete({
            where: { id: req.params.id }
        });
    
        // Envia mensagem confirmando a exclusão
        res.status(201).json({mensagem: "Tarefa Deletada com Sucessso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Tarefa Não Encontrada!"});
      }
      else {    // Outros tipos de erro
        // Deu errado: exibe o erro no terminal
        console.error(error);
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
      }
    }
  }

export default controller