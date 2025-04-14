// Importando bibliotecas necessárias
import prisma from '../database/client.js';
import bcrypt from 'bcrypt';

const controller = {};

// Função para validar senha do usuário
async function validaSenha(senhaAtual, idUsuario){
    const verificaUsuario = await prisma.usuario.findUnique({
        where: { id: idUsuario }
    }); 
    
    let verSenha = await bcrypt.compare(senhaAtual, verificaUsuario.senha);
    if(verSenha){
        return true;
    }else{
        return false;
    }
}

// Validado (12-04) - Implementar Cadastro de Imagens
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

        // Recuperando os dados do recem criado usuário para iniciar a sessão no vanegador
        const usuarioCadastrado = await prisma.usuario.findUnique({
            where: { email: req.body.email }
        });

        // Criando a sessão no navegador
        req.session.usuario = {
            id_usuario: usuarioCadastrado.id,
            nome_usuario: usuarioCadastrado.nome,
            email_usuario: usuarioCadastrado.email,
            foto_usuario: usuarioCadastrado.foto
        };

        // Retornando resultado para redirecionamento no front
        // console.log(req.session.usuario);
        res.status(201).json({result: true});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

// Desativa após o desenvolvimento
// Não se faz necessário no momento, e poderia ser perigoso tal ferramenta ser usada de forma incorreta
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

// Validado (12-04)
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

// Validado (12-04)
// Obtendo um usuário específico pelo email (Login)
controller.loginEmail = async function(req, res) {
    try {
        // Buscando os dados de um usuário específico
        const verificaEmail = await prisma.usuario.findUnique({
            where: {email: req.params.email}
        });
    
        if (!verificaEmail){
            return res.status(400).json({mensagem: "Usuário Não Encontrado!"});
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_atual, verificaEmail.id);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }

        // Recuperando os dados alterados do usuário para iniciar a sessão no vanegador
        const usuarioCadastrado = await prisma.usuario.findUnique({
            where: { email: req.params.email }
        });

        // Alterando os dados da sessão
        req.session.usuario = {
            id_usuario: usuarioCadastrado.id,
            nome_usuario: usuarioCadastrado.nome,
            email_usuario: usuarioCadastrado.email,
            foto_usuario: usuarioCadastrado.foto
        };

        // Retornando resultado para redirecionamento no front
        // console.log(req.session.usuario);
        res.status(201).json({result: true});
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

// Validado (12-04) - Implementar Cadastro de Imagens novas e remover as antigas
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

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_atual, req.params.id);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }
        delete req.body.senha_atual;

        // Criptografando a senha antes de ser alterados os dados
        const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);

        req.body.senha = senhaCriptografada;

        // Atualizando os dados do usuário
        await prisma.usuario.update({
            where: { id: req.params.id },
            data: req.body
        });

        // Recuperando os dados alterados do usuário para iniciar a sessão no vanegador
        const usuarioCadastrado = await prisma.usuario.findUnique({
            where: { email: req.body.email }
        });

        // Alterando os dados da sessão
        req.session.usuario = {
            id_usuario: usuarioCadastrado.id,
            nome_usuario: usuarioCadastrado.nome,
            email_usuario: usuarioCadastrado.email,
            foto_usuario: usuarioCadastrado.foto
        };
    
        // Retornando mensagem de sucessao caso tenha atualizado
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

// Validado (12-04) - Implementar remoção de imagens do usuário
// Deletando o usuário
controller.delete = async function(req, res) {
    try {
        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_atual, req.params.id);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }
        delete req.body.senha_atual;

        // Busca o usuário a ser excluído
        await prisma.usuario.delete({
            where: { id: req.params.id }
        });

        // Destruindo sessão
        req.session.destroy(err => {
            if (err) {
            res.status(500).json({ mensagem: 'Erro ao encerrar sessão' });
            } else {
            console.log('Logout realizado com sucesso');
            }
        });
    
        // Envia resultado confirmando a exclusão
        res.status(201).json({result: true});
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

export default controller;