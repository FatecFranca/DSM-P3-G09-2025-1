// Validar a senha do usuário, ao tentar alterar os dados ou exlcuir a conta
import prisma from '../database/client.js';
import bcrypt from 'bcrypt';

const controller = {};

// Criando um novo usuário
controller.create = async function(req, res) {
    try {

        // Verificando se o email informado já não está em uso
        const emailCadastrado = await prisma.usuario.findUnique({
            where: { email: req.body.email }
        });

        if(emailCadastrado) {
            return res.status(400).json({ mensagem: "Email já está em uso!" });
        }

        // Criptografando a senha antes de cadastrar
        const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);
        req.body.senha = senhaCriptografada

        await prisma.usuario.create({ data: req.body });

        // Retornando mensagem de sucesso
        res.status(201).json({mensagem: "Usuário Cadastrado com Sucessso!"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

// Obtendo todos os usuários cadastrados
controller.retrieveAll = async function(req, res) {
    try {
        // Buscando todas os usuários cadastrados
        const result = await prisma.usuario.findMany({
            orderBy: [ { nome: 'asc' } ]
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhum Usuário Encontrado!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}

// Obtendo um usuário específico pelo id
controller.retrieveOne = async function(req, res) {
    try {
        // Buscando os dados de um usuário específico
        const result = await prisma.usuario.findUnique({
            where: {id: req.params.id}
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Usuário Não Encontrado!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}

// Obtendo um usuário específico pelo id
controller.retrieveOneEmail = async function(req, res) {
    try {
        // Buscando os dados de um usuário específico
        const result = await prisma.usuario.findUnique({
            where: {email: req.params.email}
        });
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025') {
            // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Usuário Não Encontrado!"});
        }else{
            // Deu errado: exibe o erro no terminal
            console.error(error);

            // Envia o erro ao front-end, com status de erro
            // HTTP 500: Internal Server Error
            res.status(500).send(error);
        }
    }
}

// Atualizando os dados do usuário
controller.update = async function(req, res) {
    try {

        // Verificando se o email a ser atualizado é o mesmo que o email atual
        const verificaEmail = await prisma.usuario.findUnique({
            where: { id: req.params.id }
        });

        if(verificaEmail.email !== req.body.email){
            // Verificando se o email informado já não está em uso
            const emailCadastrado = await prisma.usuario.findUnique({
                where: { email: req.body.email }
            });

            if(emailCadastrado) {
                return res.status(400).json({ mensagem: "Email já está em uso!" });
            }
        }


        // Criptografando a senha antes de ser alterados os dados
        const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);

        req.body.senha = senhaCriptografada;

        // Atualizando os dados do usuário
        await prisma.usuario.update({
            where: { id: req.params.id },
            data: req.body
        });
    
        // Retrnando mensagem de sucessao caso tenha atualizado
        res.status(201).json({mensagem: "Usuário Atualizado com Sucesso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não alterar ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Usuário Não Encontrado!"});
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

// Deletando o usuário
controller.delete = async function(req, res) {
    try {
      // Busca o usuário a ser excluído
      await prisma.usuario.delete({
        where: { id: req.params.id }
      });
  
      // Envia mensagem confirmando a exclusão
      res.status(201).json({mensagem: "Usuário Deletado com Sucessso!"});
    }
    catch(error) {
      // P2025: erro do Prisma referente a objeto não encontrado
      if(error?.code === 'P2025') {
        // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
        res.status(400).json({mensagem: "Usuário Não Encontrado!"});
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