// Caro autor do arquivo, favor revisa-lo antes de liber-lo.
// Se esta mensagem ainda estiver aqui, significará que ele não foi revisado.

// Importando arquivos e bibliotecas importantes
import prisma from '../database/client.js';
const controller = {};

// Importando validação de sessão
import { validarSessao } from './utils.js';

// Desativar posteriormente
controller.retrieveAll = async function(req, res) {
    try {
        // Buscando todas a tarefas cadastradas
        const result = await prisma.notificacao.findMany({
            orderBy: [ { data_criacao: 'asc' } ]
        });
    
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


// Obtendo uma notifição específica pelo id
controller.retrieveOne = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Obtendo os dados da atividade
        const notificacao = await prisma.notificacao.findFirst({
            where: { id: req.params.id, id_usuario: req.session.usuario.id }
        });

        if (!notificacao){
            return res.status(400).json({mensagem: "Notificação não Encontrada!"});
        }

        // Retorna os dados obtidos
        return res.send(notificacao);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Notificação Não Encontrada!"});
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


// Obtendo todas as notificação do usuário 
controller.retrieveAllUsuario = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Obtendo os dados da subtarefa
        const notificacao = await prisma.notificacao.findMany({
            where: { id_usuario: req.params.id }
        });

        if (!notificacao){
            return res.status(400).json({mensagem: "Nenhuma Notificação encontrada!"});
        }

        // Retorna os dados obtidos
        return res.send(notificacao);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Nenhuma Notificação Encontrada!"});
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


// Deletando a notificação
controller.delete = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se a notificação existe
        const verificaNotificacao = await prisma.notificacao.findUnique({
          where: { id: req.params.id, id_usuario: req.session.usuario.id }
        });

        if (!verificaNotificacao){
            return res.status(400).json({mensagem: "Notificação não Encontrada!"});
        }

        // Busca a atividade a ser excluída
        await prisma.atividade.delete({
            where: { id: req.params.id }
        });
    
        // Envia mensagem confirmando a exclusão
        return res.status(201).json({result: true});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Notificação Não Encontrada!"});
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