// Criar validação da senha para poder eferuar as aterações eexclusões nos projetos, validar a senha do gestor
import prisma from '../database/client.js';
import bcrypt from 'bcrypt';

const controller = {};

// Função para validar senha do gestor
async function validaSenha(senhaNova, idGestor){
    const verificaGestor = await prisma.usuario.findUnique({
        where: { id: idGestor }
    }); 
    
    let verSenha = bcrypt.compare(senhaNova, verificaGestor.senha);
    if(verSenha){
        return true;
    }else{
        return false;
    }
}

// Criando um novo projeto
controller.create = async function(req, res) {
    try {

        req.body.status = "Pendente";
        req.body.data_criacao = new Date();
        console.log("Chegou aqui");
        req.body.data_limite = new Date(req.body.data_limite);
        await prisma.projeto.create({ data: req.body });

        // Retornando mensagem de sucesso
        res.status(201).json({mensagem: "Projeto Cadastrado com Sucessso!"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

// Obtendo todos os projetos cadastrados
controller.retrieveAll = async function(req, res) {
    try {
        // Buscando todos os projetos cadastrados
        const result = await prisma.projeto.findMany({
            orderBy: [ { data_criacao: 'asc' } ]
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhum Projeto Encontrado!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}

// Obtendo um projeto específico pelo id
controller.retrieveOne = async function(req, res) {
    try {
        // Buscando os dados de um projeto específico
        const result = await prisma.projeto.findUnique({
            where: {id: req.params.id}
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhum Projeto Encontrado!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}

// Obtendo todos os projetos pelo gestor
controller.retrieveAllGestor = async function(req, res) {
    try {
        // Buscando os dados de todos os projetos do gestor
        const result = await prisma.projeto.findMany({
            where: {id_gestor: req.params.id}
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhum Projeto Encontrado!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}

// Obtendo todos os projetos pelo administrador
controller.retrieveAllAdministrador = async function(req, res) {
    try {
        // Buscando os dados de todos os projetos em que o usuário é administrador
        const result = await prisma.projeto.findMany({
            where: {
                ids_administradores: {
                    has: req.params.id
                }
            }
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhum Projeto Encontrado!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}

// Obtendo todos os projetos pelo membro
controller.retrieveAllMembro = async function(req, res) {
    try {
        // Buscando os dados de todos os projetos em que o usuário é um membro
        const result = await prisma.projeto.findMany({
            where: {
                ids_membros: {
                    has: req.params.id
                }
            }
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhum Projeto Encontrado!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}

// Atualizando os dados do projeto
controller.update = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para alterar esse Projeto!" });
        
        }


        // Verificando se o usuário informou a senha de cadastro correta para a atualização dos dados do projeto
        const valSenha = validaSenha(req.body.senha_gestor, verificaProjeto.id_gestor);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Incorreta!" });
        }

        // Verificando se informou a data limite e alterando o seu formato para um formato aceitavel pelo MongoDB
        if (req.body.data_limite){
            req.body.data_limite = new Date(req.body.data_limite);
        }
        

        // Atualizando os dados do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: req.body
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        res.status(201).json({mensagem: "Projeto Atualizado com Sucesso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Projeto Não Encontrado!"});
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

// Não precisa existir, pois da para alterar ele somente pelo updatte normal, pois é possivel alterar um atributo somente no MongoDB
/*// Atualizando o gestor do projeto
// Testar amanhã (07/04)
controller.updateGestor = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor do projeto

        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para alterar esse Projeto!" });
        
        }

        // Atualizando o gestor do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                id_gestor: req.body.id_gestorNovo
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        res.status(201).json({mensagem: "Projeto Atualizado com Sucesso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Projeto Não Encontrado!"});
      }
      else {    // Outros tipos de erro
        // Deu errado: exibe o erro no terminal
        console.error(error);
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
      }
    }
}*/

// Adicionando um membro no projeto
controller.addMembro = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor do projeto

        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para adicionar membros nesse Projeto!" });
        
        }

        // Atualizando os membros do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                ids_membros: {
                    push: req.body.id_membro
                }
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        res.status(201).json({mensagem: "Membro adicionado no Projeto com Sucesso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Projeto Não Encontrado!"});
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

// Removendo um membro do projeto
controller.removeMembro = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para adicionar membros nesse Projeto!" });
        
        }

        // Obtendo os membros que permaneceram no projeto
        const projeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
          });

        const membrosManter = projeto.ids_membros.filter(membro => membro !== req.body.id_membro);

        // Atualizando os dados do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                ids_membros: membrosManter
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        res.status(201).json({mensagem: "Membro removido do Projeto com Sucesso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Projeto Não Encontrado!"});
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

// Adicionando um adminstrador no projeto
controller.addAdministrador = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor do projeto

        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para adicionar administradores nesse Projeto!" });
        
        }

        // Atualizando os administradores do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                ids_administradores: {
                    push: req.body.id_administrador
                }
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        res.status(201).json({mensagem: "Administrador adicionado no Projeto com Sucesso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Projeto Não Encontrado!"});
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

// Revomendo um administrador do projeto
controller.removeAdministrador = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para adicionar membros nesse Projeto!" });
        
        }

        // Obtendo os membros que permaneceram no projeto
        const projeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
          });

        const administradoresManter = projeto.ids_administradores.filter(adm => adm !== req.body.id_administrador);

        // Atualizando os dados do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                ids_administradores: administradoresManter
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        res.status(201).json({mensagem: "Administrador removido do Projeto com Sucesso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Projeto Não Encontrado!"});
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

// Deletando o projeto
controller.delete = async function(req, res) {
    try {

        // Verificando se quem está excluindo é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para excluir esse Projeto!" });
        
        }

        // Deletando todos os dados relacionados ao projeto
        // Criar depois as exclusões das Tarefas, Subtarefas e Atividades

        // Busca o projeto a ser excluído
        await prisma.projeto.delete({
            where: { id: req.params.id }
        });
    
        // Envia mensagem confirmando a exclusão
        res.status(201).json({mensagem: "Projeto Deletado com Sucessso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Projeto Não Encontrado!"});
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