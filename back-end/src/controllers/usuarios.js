// Caro autor do arquivo, favor revisa-lo antes de liber-lo.
// Se esta mensagem ainda estiver aqui, significará que ele não foi revisado.


// Verificar com o Front em Update / Create / Delete a adição do anexo de imagens.
// Posteriormente está aprovado

// Importando bibliotecas necessárias
import prisma from '../database/client.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// Importando validação de sessão
import { validarSessao } from './utils.js';

const controller = {};

// Validado (12-04)
// Função para validar senha do usuário
async function validaSenha(senhaAtual, idUsuario){
    const verificaUsuario = await prisma.usuario.findFirst({
        where: { id: idUsuario }
    }); 
    
    let verSenha = await bcrypt.compare(senhaAtual, verificaUsuario.senha);
    if(verSenha){
        return true;
    }else{
        return false;
    }
}

// Validado (12-04) - Validar com o Front Agora
// Função para excluir uma imagem da pasta
async function deletarImagem(nomeArquivo) {
    // Caminho absoluto do arquivo
    const caminhoImagem = path.join(process.cwd(), '..', 'uploads', 'imgUsuarios', nomeArquivo);

    // Verifica se o arquivo existe antes de tentar excluir
    if (fs.existsSync(caminhoImagem)) {
        fs.unlink(caminhoImagem, (err) => {
        if (err) {
            console.error('Erro ao deletar a imagem:', err);
        } else {
            console.log('Imagem deletada com sucesso!');
        }
        });
    } else {
        console.log('Imagem não encontrada:', caminhoImagem);
    }
}

// Validado (12-04) - Validar com o Front Agora
// Criando um novo usuário
controller.create = async function(req, res) {
    try {

        // Verificando se o email informado já não está em uso
        const emailCadastrado = await prisma.usuario.findFirst({
            where: { email: req.body.email }
        });

        if(emailCadastrado) {
            return res.status(400).json({ mensagem: "Email já está em uso!" });
        }

        // Criptografando a senha antes de cadastrar
        const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);
        req.body.senha = senhaCriptografada

        // Monta a URL da imagem
        const urlImagem = req.file ? `${req.file.filename}` : null;

        // Ajustando a url da imagem para a inserção no BD
        req.body.foto = urlImagem;
        console.log("Foto:" + req.body.foto);

        await prisma.usuario.create({ data: req.body });

        // Recuperando os dados do recem criado usuário para iniciar a sessão no vanegador
        const usuarioCadastrado = await prisma.usuario.findFirst({
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
        return res.status(201).json({result: true});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
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

        if (!result){
            return res.status(400).json({mensagem: "Nenhum Usuário Encontrado!"});
        }
    
        // Retorna os dados obtidos
        return res.send(result);
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}

// Validado (12-04)
// Obtendo um usuário específico pelo id
controller.retrieveOne = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Buscando os dados de um usuário específico
        const result = await prisma.usuario.findFirst({
            where: {id: req.params.id}
        });

        if (!result){
            return res.status(400).json({mensagem: "Nenhum Usuário Encontrado!"});
        }
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}


// Obter todos os usuários de uma subtarefa
// Implementa na subtarefa não aqui


// Validado (29/04)
// Encerrar sessão
controller.encerrarSessao = async function(req, res) {
    req.session.destroy(err => {
        if (err) {
            return res.status(400).json({ result: false }); 
        } else {
            return res.status(200).json({ result: true }); 
        }
    });
}

// Validado (12-04)
// Obtendo um usuário específico pelo email (Login)
controller.loginEmail = async function(req, res) {
    try {
        // Buscando os dados de um usuário específico
        const verUsuario = await prisma.usuario.findFirst({
            where: {email: req.params.email}
        });
    
        if (!verUsuario){
            return res.status(400).json({mensagem: "Usuário Não Encontrado!"});
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_atual, verUsuario.id);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }

        // Recuperando os dados alterados do usuário para iniciar a sessão no vanegador
        const usuarioCadastrado = await prisma.usuario.findFirst({
            where: { email: req.params.email }
        });

        // Alterando os dados da sessão
        req.session.usuario = {
            id: usuarioCadastrado.id,
            nome: usuarioCadastrado.nome,
            email: usuarioCadastrado.email,
            foto: usuarioCadastrado.foto
        };

        // Retornando resultado para redirecionamento no front
        // console.log(req.session.usuario);
        return res.status(201).json({result: true});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}

// Validado (12-04) - Verificar exclusão e upload de imagens com o Front
// Atualizando os dados do usuário
controller.update = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }


        // Verificando se o usuário a ser alterado é o que esta com a sessão ativa
        if (req.params.id !== req.session.usuario.id){
            return res.status(400).json({ mensagem: "Usuário não pode alterar dados de outro!" });
        }

        // Verificando se o email a ser atualizado é o mesmo que o email atual
        const verUsuario = await prisma.usuario.findFirst({
            where: { id: req.params.id }
        });

        if (!verUsuario){
            return res.status(400).json({ mensagem: "Usuário não encontrado!" });
        }

        if(verUsuario.email !== req.body.email){
            // Verificando se o email informado já não está em uso
            const emailCadastrado = await prisma.usuario.findFirst({
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

        // Monta a URL da imagem
        const urlImagem = req.file ? `${req.file.filename}` : null;

        // Ajustando a url da imagem para a inserção no BD
        req.body.foto = urlImagem;
        console.log("Foto:" + req.body.foto);

        // Deletando a foto antiga do usuário
        if (verUsuario.foto){
            deletarImagem(verUsuario.foto);
        }

        // Atualizando os dados do usuário
        await prisma.usuario.update({
            where: { id: req.params.id },
            data: req.body
        });

        // Recuperando os dados alterados do usuário para iniciar a sessão no vanegador
        const usuarioCadastrado = await prisma.usuario.findFirst({
            where: { email: req.body.email }
        });

        // Alterando os dados da sessão
        req.session.usuario = {
            id: usuarioCadastrado.id,
            nome: usuarioCadastrado.nome,
            email: usuarioCadastrado.email,
            foto: usuarioCadastrado.foto
        };
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({mensagem: "Usuário Atualizado com Sucesso!"});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Validar Quando estiver com as atividade, tarefas e subtarefas cadastradas
// Validado (01/05) - Verificar exclusão de imagens com o Front
// Excluir projetos quando gestor e dados de outros projetos e tarefas
// Deletando o usuário
controller.delete = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se o usuário a ser excluido é o que esta com a sessão ativa
        if (req.params.id !== req.session.usuario.id){
            return res.status(400).json({ mensagem: "Usuário não pode exluir outro usuário!" });
        }
        
        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_atual, req.params.id);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }
        delete req.body.senha_atual;

        // Busca o usuário a ser excluído
        const usuarioDeletar = await prisma.usuario.findFirst({
            where: { id: req.params.id }
        });


        // Deletando a foto do usuário
        if (usuarioDeletar.foto){
            deletarImagem(usuarioDeletar.foto);
        }

        // Deletando os projetos em que ele é gestor
        const projetosDeletar = await prisma.projeto.findMany({
            where: { id_gestor: req.session.usuario.id }
        });

        // Verificando se a lsita não voltou vazia
        if (projetosDeletar){
            let tarefasDeletar;
            let subtaresDeletar;

            // Tarefas a deletar
            for (const projeto of projetosDeletar){

                // Deletando as tarefas
                tarefasDeletar = await prisma.tarefa.findMany({
                    where: { id_projeto: projeto.id }
                });

                // Verificando se a lsita não voltou vazia
                if (tarefasDeletar){

                    // Tarefas a deletar
                    for (const tarefa of tarefasDeletar){

                        subtaresDeletar = await prisma.subTarefa.findMany({
                            where: { id_tarefa: tarefa.id }
                        });

                        // Verificando se a lsita não voltou vazio
                        if (subtaresDeletar){

                            // Atividades e SubTarefas a deletar
                            for (const subTarefa of subtaresDeletar){

                                // Deletando as atividades
                                await prisma.atividade.delete({
                                    where: { id_subtarefa: subTarefa.id }
                                });

                                // Deletando as subtarefas
                                await prisma.subTarefa.delete({
                                    where: { id_subtarefa: subTarefa.id }
                                });
                    
                            }

                        }

                        // Deletando as tarefas
                        await prisma.tarefa.delete({
                            where: { id_tarefa: tarefa.id }
                        });
            
                    }

                }

                // Deletando os projetos
                await prisma.projeto.delete({
                    where: { id_projeto: projeto.id }
                });

            }
        }

        // Exclui o usuário
        await prisma.usuario.delete({
            where: { id: req.params.id }
        });

        // Destruindo sessão
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao encerrar sessão' });
            } else {
                console.log('Logout realizado com sucesso');
                // Envia resultado confirmando a exclusão
                res.status(201).json({result: true});
            }
        });

    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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