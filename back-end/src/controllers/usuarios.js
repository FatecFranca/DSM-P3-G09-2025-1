// Caro autor do arquivo, favor revisa-lo antes de liber-lo.
// Se esta mensagem ainda estiver aqui, significará que ele não foi revisado.

// Importando bibliotecas necessárias
import prisma from '../database/client.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// Importando validação de sessão
import { validarSessao } from './utils.js';

const controller = {};

// Função para validar senha do usuário
async function validaSenha(senhaAtual, idUsuario){

    // Obtendo os dados do usuário
    const verificaUsuario = await prisma.usuario.findFirst({
        where: { id: idUsuario }
    }); 
    
    // Comprando a senha informada com a senha do banco
    let verSenha = await bcrypt.compare(senhaAtual, verificaUsuario.senha);
    if(verSenha){
        return true;
    }else{
        return false;
    }
}

// Função para excluir uma imagem da pasta
async function deletarImagem(nomeArquivo) {

    // Caminho absoluto do arquivo
    const caminhoImagem = path.join(process.cwd(), 'src', 'uploads', 'imgUsuarios', nomeArquivo);

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

// Criando um novo usuário
controller.create = async function(req, res) {
    try {

        // Verificando se o email informado já não está em uso
        const emailCadastrado = await prisma.usuario.findFirst({
            where: { email: req.body.email }
        });

        // Vefificando se o email já está cadastrado
        if(emailCadastrado) {
            return res.status(400).json({ mensagem: "E-mail já está em uso!" });
        }

        // Criptografando a senha antes de cadastrar
        const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);
        req.body.senha = senhaCriptografada

        // Monta a URL da imagem
        const urlImagem = req.file ? `${req.file.filename}` : null;

        // Ajustando a url da imagem para a inserção no BD
        req.body.foto = urlImagem;

        // Deletando os dados que não serão inseridos no banco
        delete req.body.fotoUsuario;

        // Inserindo os dados do usuário no banco
        await prisma.usuario.create({ data: req.body });

        // Recuperando os dados do recem criado usuário para iniciar a sessão no vanegador
        const usuarioCadastrado = await prisma.usuario.findFirst({
            where: { email: req.body.email }
        });

        // Criando a sessão no navegador
        req.session.usuario = {
            id: usuarioCadastrado.id,
            nome: usuarioCadastrado.nome,
            email: usuarioCadastrado.email,
            foto: usuarioCadastrado.foto
        };

        // Retornando resultado para redirecionamento no front
        return res.status(201).json({result: true});
    }
    catch(error) {
        console.error(error);
        return res.status(500).send(error);
    }
}

// Desativa após o desenvolvimento
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

// Obtendo um usuário específico pelo ID
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

        // Verificando se o usuário existe
        if (!result){
            return res.status(400).json({mensagem: "Nenhum Usuário Encontrado!"});
        }
    
        // Retorna os dados obtidos
        res.send(result);
    }
    catch(error) {
        console.error(error);
        res.status(500).send(error);
    }
}

// Encerrar sessão
controller.encerrarSessao = async function(req, res) {

    // Destruindo a sessão
    req.session.destroy(err => {
        if (err) {
            return res.status(400).json({ result: false }); 
        } else {
            return res.status(200).json({ result: true }); 
        }
    });
}

// Verifica sessão
controller.verificaSessao = async function(req, res) {

    // Verificando se a sessão foi iniciada para retonar o status para o front
    if (req.session.usuario){
        return res.status(200).json({ result: true, dados: req.session.usuario }); 
    }else{
        return res.status(200).json({ result: false }); 
    }
}

// Logando com email e senha
controller.loginEmail = async function(req, res) {
    try {

        // Buscando os dados de um usuário específico
        const usuarioCadastrado = await prisma.usuario.findFirst({
            where: {email: req.params.email}
        });
    
        // Verificando se o usuário existe
        if (!usuarioCadastrado){
            return res.status(400).json({mensagem: "Usuário não Encontrado!"});
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha, usuarioCadastrado.id);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }

        // Criando a sessão no navegador
        req.session.usuario = {
            id: usuarioCadastrado.id,
            nome: usuarioCadastrado.nome,
            email: usuarioCadastrado.email,
            foto: usuarioCadastrado.foto
        };

        // Verificando se a sessão foi iniciada corretamente
        if (!req.session.usuario){
            return res.status(400).json({mensagem: "Não iniciou a sessão!"});
        }

        // Retornando resultado para redirecionamento no front
        return res.status(200).json({result: true});
    }
    catch(error) {
        console.error(error);
        return res.status(500).send(error);
    }
}

// Logando com Google
controller.loginGoogle = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ mensagem: "Token do Firebase não fornecido." });
        }

        // Verifica o token com o Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);
        const email = decodedToken.email;

        const usuario = await prisma.usuario.findFirst({
            where: { email: email }
        });

        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado no sistema." });
        }

        // Cria a sessão
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            foto: usuario.foto
        };

        return res.status(200).json({ mensagem: "Login com Google validado com sucesso." });

    } catch (error) {
        console.error("Erro na validação do login com Google:", error);
        return res.status(401).json({ mensagem: "Token inválido ou expirado." });
    }
};

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

        // Obtendo os dados do usuário
        const verUsuario = await prisma.usuario.findFirst({
            where: { id: req.params.id }
        });
        if (!verUsuario){
            return res.status(400).json({ mensagem: "Usuário não encontrado!" });
        }

        // Verificando se o email informado já não está em uso
        if(verUsuario.email !== req.body.email){
            const emailCadastrado = await prisma.usuario.findFirst({
                where: { email: req.body.email }
            });
            if(emailCadastrado) {
                return res.status(400).json({ mensagem: "E-mail já está em uso!" });
            }
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_atual, req.params.id);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }

        // Criptografando a senha antes de ser alterados os dados
        const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);
        req.body.senha = senhaCriptografada;

        // Monta a URL da imagem
        const urlImagem = req.file ? `${req.file.filename}` : null;

        // Ajustando a url da imagem para a inserção no BD
        req.body.foto = urlImagem;
        console.log("Foto:" + req.body.foto);

        // Deletando a foto antiga do usuário caso tenha sido alterada
        if (verUsuario.foto){
            if (verUsuario.foto !== req.body.foto && verUsuario.foto !== null){
                deletarImagem(verUsuario.foto);
            }
        }

        // Deletando os dados que não serão inseridos no banco
        delete req.body.fotoUsuario;
        delete req.body.senha_atual;

        // Atualizando os dados do usuário
        await prisma.usuario.update({
            where: { id: req.params.id },
            data: req.body
        });

        // Recuperando os dados alterados do usuário para atualizar a sessão no vanegador
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
        return res.status(201).json({result: true});
    }
    catch(error) {
        // Caso o usuário não seja encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            res.status(400).json({mensagem: "Usuário Não Encontrado!"});
        }else {
            console.error(error);
            res.status(500).send(error);
        }
    }
}

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

        // Deletando os dados para não haver conflitos no body
        delete req.body.senha_atual;

        // Busca o usuário a ser excluído
        const usuarioDeletar = await prisma.usuario.findFirst({
            where: { id: req.params.id }
        });


        // Deletando a foto do usuário
        if (usuarioDeletar.foto){
            deletarImagem(usuarioDeletar.foto);
        }

        // buscando os projetos em que o usuário é gestor para excluí-los
        const projetosDeletar = await prisma.projeto.findMany({
            where: { id_gestor: req.session.usuario.id }
        });

        if (projetosDeletar){

            // Variáveis para armazenar as tarefas, subtarefas e atividades a serem deletadas
            let tarefasDeletar;
            let subtaresDeletar;
            let atividadesDeletar;

            // Projetos a deletar
            for (const projeto of projetosDeletar){

                // Buscando as tarefas do projeto
                tarefasDeletar = await prisma.tarefa.findMany({
                    where: { id_projeto: projeto.id }
                });

                if (tarefasDeletar){

                    // Tarefas a deletar
                    for (const tarefa of tarefasDeletar){

                        // Buscando as subtarefas da tarefa
                        subtaresDeletar = await prisma.subTarefa.findMany({
                            where: { id_tarefa: tarefa.id }
                        });

                        if (subtaresDeletar){

                            // SubTarefas a deletar
                            for (const subTarefa of subtaresDeletar){

                                // Buscando as atividades da subtarefa
                                atividadesDeletar = await prisma.atividade.findMany({
                                    where: { id_subtarefa: subTarefa.id }
                                });

                                if (atividadesDeletar){

                                    // Atividades a deletar
                                    for (const atividade of atividadesDeletar){

                                        // Deletando o anexo da atividade caso exista
                                        if (atividade.anexo){
                                            deletarAnexo(atividade.anexo);
                                        }

                                        // Deletando as atividades
                                        await prisma.atividade.delete({
                                            where: { id: atividade.id }
                                        });
                                    }
                                }

                                // Notificações a deletar de cada subtarefa
                                const notificacoesDeletar = await prisma.notificacao.findMany({
                                    where: { id_subtarefa: subTarefa.id }
                                });

                                if (notificacoesDeletar){

                                    // notificações a deletar
                                    for (const notificacao of notificacoesDeletar){

                                        // Deletando as notificações
                                        await prisma.notificacao.delete({
                                            where: { id: notificacao.id }
                                        });
                            
                                    }
                                    
                                }

                                // Deletando o anexo da subtarefa caso exista
                                if (subTarefa.anexo){
                                    deletarAnexo(subTarefa.anexo);
                                }

                                // Deletando a subtarefa
                                await prisma.subTarefa.delete({
                                    where: { id: subTarefa.id }
                                });
                    
                            }
                            
                        }

                        // Deletando o anexo da tarefa caso exista
                        if (tarefa.anexo){
                            deletarAnexo(tarefa.anexo);
                        }

                        // Deletando a tarefa
                        await prisma.tarefa.delete({
                            where: { id: tarefa.id }
                        });
            
                    }

                }

                // Deletando o anexo do projeto caso exista
                if (projeto.anexo){
                    deletarAnexo(projeto.anexo);
                }

                // Deletando o projeto
                await prisma.projeto.delete({
                    where: { id: projeto.id }
                });

            }
        }

        // Obtendo as notificações do usuário a serem deletadas
        const notificacoesDeletar = await prisma.notificacao.findMany({
            where: { id_usuario: req.session.usuario.id }
        });

        // Deletando as notificações do usuário
        if (notificacoesDeletar){
            for (const notificacao of notificacoesDeletar){
                await prisma.notificacao.delete({
                    where: { id: notificacao.id }
                });
            }
        }

        // Excluir o usuário
        await prisma.usuario.delete({
            where: { id: req.params.id }
        });

        // Destruindo sessão
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({ mensagem: 'Erro ao encerrar sessão' });
            } else {
                console.log('Logout realizado com sucesso');
                res.status(201).json({result: true});
            }
        });

    }
    catch(error) {
        //Caso o usuário não seja encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
        res.status(400).json({mensagem: "Usuário Não Encontrado!"});

        }else {
        console.error(error);
        res.status(500).send(error);
        }
    }
}

export default controller;