// Caro autor do arquivo, favor revisa-lo antes de liber-lo.
// Se esta mensagem ainda estiver aqui, significará que ele não foi revisado.

// Importando arquivos e bibliotecas importantes
import prisma from '../database/client.js';
import bcrypt from 'bcrypt';
const controller = {};

// Importando validação de sessão
import { validarSessao } from './utils.js';

// Validada
// Função para validar senha do gestor
async function validaSenha(senhaNova, idGestor){
    const verificaGestor = await prisma.usuario.findUnique({
        where: { id: idGestor }
    }); 
    
    let verSenha = await bcrypt.compare(senhaNova, verificaGestor.senha);
    if(verSenha){
        return true;
    }else{
        return false;
    }
}

// Testar com o front
// Função para excluir um arquivo da pasta
async function deletarAnexo(nomeArquivo) {
    // Caminho absoluto do arquivo
    const caminhoAnexo = path.join(process.cwd(), '..', 'uploads', 'anexoProjetos', nomeArquivo);

    // Verifica se o arquivo existe antes de tentar excluir
    if (fs.existsSync(caminhoAnexo)) {
        fs.unlink(caminhoAnexo, (err) => {
        if (err) {
            console.error('Erro ao deletar o anexo:', err);
        } else {
            console.log('Anexo deletada com sucesso!');
        }
        });
    } else {
        console.log('Anexo não encontrado:', caminhoAnexo);
    }
}

// Validada (04/05) - Validar Anexo com Front
// Criando um novo projeto
controller.create = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        req.body.status = "Pendente";
        req.body.data_criacao = new Date();
        req.body.id_gestor = req.session.usuario.id;

        // Verificando se a data foi informada para converte-la em um formato aceitavel
        if (req.body.data_limite){
            req.body.data_limite = new Date(req.body.data_limite);

            // Verificando se a data infrmada é menor ou maior que a data atual, para atribuir o status correto
            if (req.body.data_limite < new Date()){
                return res.status(400).json({mensagem: "Data de Limite não pode ser Menor que a data Atual!"});
            }

        }

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;

        await prisma.projeto.create({ data: req.body });

        // Retornando mensagem de sucesso
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


// Desativar posteriormente
controller.retrieveAll = async function(req, res) {
    try {
        // Buscando todos os projetos cadastrados
        const result = await prisma.projeto.findMany({
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

// Validada (04/05)
// Obtendo um projeto específico pelo id
controller.retrieveOne = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Obtendo os dados do projeto
        const projeto = await prisma.projeto.findFirst({
            where: { id: req.params.id }
        });

        if (!projeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        // Verificando se o usuário que está consultando os dados é pelo menos um membro ou administrador do projeto
        let encontrou = false;
        if (req.session.usuario.id !== projeto.id_gestor){
            projeto.ids_membros.forEach(membro => {
                if (membro === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                projeto.ids_administradores.forEach(adm => {
                    if (adm === req.session.usuario.id){
                        encontrou = true;
                    }
                });
            }
        }else{
            encontrou = true;
        }

        if (!encontrou){
            return res.status(400).json({mensagem: "Você não tem permissão para obter os dados desse projeto!"});
        }
        
        // Retorna os dados obtidos
        return res.send(projeto);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Validada (04/05)
// Obtendo todos os projetos pelo gestor
controller.retrieveAllGestor = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Todos os projetos finalizados
        const projetosConcluidos = await prisma.projeto.findMany({
            where: {id_gestor: req.session.usuario.id, status: "Concluído"}
        });
    
        // Todos os projetos pendentes
        const projetosPendentes = await prisma.projeto.findMany({
            where: {id_gestor: req.session.usuario.id, status: "Pendente"}
        });

        // Todos os projetos atrasados
        const projetosAtrasados = await prisma.projeto.findMany({
            where: {id_gestor: req.session.usuario.id, status: "Atrasado"}
        });

        // Retorna os dados obtidos
        return res.status(200).json({projetosConcluidos: projetosConcluidos, projetosAtrasados: projetosAtrasados, projetosPendentes: projetosPendentes});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

// Validada (04/05)
// Obtendo todos os projetos pelo administrador
controller.retrieveAllAdministrador = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Buscando todos os projetos do administrador
        const projetosTodos = await prisma.projeto.findMany({
            where: {
                ids_administradores: {
                    has: req.session.usuario.id
                }
            }
        });

        // Todos os projetos finalizados
        const projetosConcluidos = await prisma.projeto.findMany({
            where: {
                ids_administradores: {
                    has: req.session.usuario.id
                },
                status: "Concluído"
            }
        });
    
        // Todos os projetos pendentes
        const projetosPendentes = await prisma.projeto.findMany({
            where: {
                ids_administradores: {
                    has: req.session.usuario.id
                },
                status: "Pendente"
            }
        });

        // Todos os projetos atrasados
        const projetosAtrasados = await prisma.projeto.findMany({
            where: {
                ids_administradores: {
                    has: req.session.usuario.id
                },
                status: "Atrasado"
            }
        });

        // Retorna os dados obtidos
        return res.status(200).json({projetosConcluidos: projetosConcluidos, projetosAtrasados: projetosAtrasados, projetosPendentes: projetosPendentes});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}

// Validada (04/05)
// Obtendo todos os projetos pelo membro
controller.retrieveAllMembro = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Buscando todos os projetos do administrador
        const projetosTodos = await prisma.projeto.findMany({
            where: {
                ids_membros: {
                    has: req.session.usuario.id
                }
            }
        });

        // Todos os projetos finalizados
        const projetosConcluidos = await prisma.projeto.findMany({
            where: {
                ids_membros: {
                    has: req.session.usuario.id
                },
                status: "Concluído"
            }
        });
    
        // Todos os projetos pendentes
        const projetosPendentes = await prisma.projeto.findMany({
            where: {
                ids_membros: {
                    has: req.session.usuario.id
                },
                status: "Pendente"
            }
        });

        // Todos os projetos atrasados
        const projetosAtrasados = await prisma.projeto.findMany({
            where: {
                ids_membros: {
                    has: req.session.usuario.id
                },
                status: "Atrasado"
            }
        });

        // Retorna os dados obtidos
        return res.status(200).json({projetosConcluidos: projetosConcluidos, projetosAtrasados: projetosAtrasados, projetosPendentes: projetosPendentes});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

// Validada (04/05)
// Atualizando os dados do projeto
controller.update = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            return res.status(400).json({ mensagem: "Você não tem permissão para alterar esse Projeto!" });
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_gestor, verificaProjeto.id_gestor);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }
        delete req.body.senha_gestor;

        // Verificando se a data foi informada para converte-la em um formato aceitavel
        if (req.body.data_limite){
            req.body.data_limite = new Date(req.body.data_limite);

            // Verificando se a data infrmada é menor ou maior que a data atual, para atribuir o status correto
            if (req.body.data_limite < new Date()){
                req.body.status = "Atrasado"
            }else{
                req.body.status = "Pendente"
            }

        }

        // Deletando o anexo
        if (verificaProjeto.anexo){
            deletarAnexo(verificaProjeto.anexo);
        }

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;

        // Atualizando os dados do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: req.body
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({result: true});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Validada (04/05)
// Atualizando o gestor do projeto
controller.updateGestor = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            return res.status(400).json({ mensagem: "Você não tem permissão para alterar esse Projeto!"});
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_gestor, verificaProjeto.id_gestor);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }

        // Verificando se os id do novo gestor existe
        const verificaGestor = await prisma.usuario.findUnique({
            where: { id: req.body.id_gestorNovo }
        });

        if (!verificaGestor){
            return res.status(400).json({ mensagem: "Novo Gestor não Existe!"});
        }

        // Removendo o novo gestor das suas outras funções, se tiver (ADM/Membro)
        // Obtendo os membros que permaneceram no projeto
        const membrosManter = verificaProjeto.ids_membros.filter(membro => membro !== req.body.id_gestorNovo);

        // Atualizando os membros removendo o novo gestor
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                ids_membros: membrosManter
            }
        });

        // Obtendo os adms que permaneceram no projeto
        const admsManter = verificaProjeto.ids_administradores.filter(adm => adm !== req.body.id_gestorNovo);

        // Atualizando os membros removendo o novo gestor
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                ids_administradores: admsManter
            }
        });

        // Atualizando o gestor do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                id_gestor: req.body.id_gestorNovo
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({result: true, mensagem: "Gestor alterado com Sucesso! Você cedeu sua posição e não tem mais acesso ao Projeto!"});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Projeto não Encontrado!"});
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

// Validada (04/05)
// Finalizando/Reabrindo o projeto (Mudando Status e Data Entrega)
controller.updateStatus = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });


        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            return res.status(400).json({ mensagem: "Você não tem permissão para alterar esse Projeto!"});
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_gestor, verificaProjeto.id_gestor);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }

        // Verificando qual o tipo de alteração (Conclusão do Projeto ou reabertura do Projeto)
        if (req.body.tipo_alteracao === "Concluir"){
            // Atualizando o status e data de entrega do projeto
            await prisma.projeto.update({
                where: { id: req.params.id },
                data: {
                    status: "Concluído",
                    data_entrega: new Date()
                }
            });
        
            // Retornando mensagem de sucessao caso tenha atualizado
            return res.status(201).json({result: true, mensagem: "Projeto Concluído!"});

        }else if (req.body.tipo_alteracao === "Reabrir"){
            // Atualizando o status e data de entrega do projeto
            await prisma.projeto.update({
                where: { id: req.params.id },
                data: {
                    status: "Pendente",
                    data_entrega: null
                }
            });
        
            // Retornando mensagem de sucessao caso tenha atualizado
            return res.status(201).json({result: true, mensagem: "Projeto Reaberto!"});
        }else{
            return res.status(400).json({ mensagem: "Função Inválida!"});
        }
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Validada (04/05) 
// Adicionando um membro no projeto
controller.addMembro = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({ mensagem: "Projeto não encontrado!" });
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        // Verificando se é o gestor que está tentando adicionar um membro
        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            return res.status(400).json({ mensagem: "Você não tem permissão para adicionar membros nesse Projeto!" });
        }

        // Verificando se o usuário a ser inserido já não esta cadastrado em membros ou em adminitradores ou é o próprio gestor (Não permitir adcionar)
        if(req.session.usuario.id === req.body.id_membro){
            return res.status(400).json({ mensagem: "Você é o gestor do projeto, não pode ser membro!" });
        }

        let encontrou = false;
        verificaProjeto.ids_membros.forEach(membro => {
            if(req.body.id_membro === membro){
                encontrou = true;
            }
        }); 

        if (encontrou){
            return res.status(400).json({ mensagem: "Membro já está no projeto!" });
        }else{
            verificaProjeto.ids_administradores.forEach(adm => {
                if(req.body.id_membro === adm){
                    encontrou = true;
                }
            }); 
        }

        if (encontrou){
            return res.status(400).json({ mensagem: "Membro já está no projeto!" });
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
        return res.status(201).json({result: true});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Validada (04/05) 
// Removendo um membro do projeto
controller.removeMembro = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if(req.session.usuario.id !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para remover membros nesse Projeto!" });
        
        }

        // Obtendo os membros que permaneceram no projeto
        const projeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        const membrosManter = projeto.ids_membros.filter(membro => membro !== req.body.id_membro);

        // Atualizando os membros removendo o solicitado
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                ids_membros: membrosManter
            }
        });

        // Removendo o usuário da subtarefas em que ele participa, desse projeto
        // Buscar todas as tarefas do projeto
        const tarefas = await prisma.tarefa.findMany({
            where: {
                id_projeto: verificaProjeto.id
            },
            select: { id: true }
        });

        const idsTarefas = tarefas.map(tarefa => tarefa.id);

        // Buscar subtarefas relacionadas às tarefas
        const subtarefas = await prisma.subTarefa.findMany({
            where: {
                id_tarefa: { in: idsTarefas }
            }
        });

        for (const subtarefa of subtarefas) {
            if (subtarefa.ids_membros.includes(usuarioId)) {
                
                // Remove o usuário da lista
                const novosMembros = subtarefa.ids_membros.filter(id => id !== usuarioId);

                // Atualiza a subtarefa
                await prisma.subTarefa.update({
                    where: { id: subtarefa.id },
                    data: {
                        ids_membros: novosMembros
                    }
                });
            }
        }
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({result: true});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Validada (04/05) 
// Adicionando um adminstrador no projeto
controller.addAdministrador = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({ mensagem: "Projeto não encontrado!" });
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        // Verificando se é o gestor que está tentando adicionar um membro
        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            return res.status(400).json({ mensagem: "Você não tem permissão para adicionar membros nesse Projeto!" });
        }

        // Verificando se o usuário a ser inserido já não esta cadastrado em membros ou em adminitradores ou é o próprio gestor (Não permitir adcionar)
        if(req.session.usuario.id === req.body.id_administrador){
            return res.status(400).json({ mensagem: "Você é o gestor do projeto, não pode ser membro!" });
        }

        let encontrou = false;
        verificaProjeto.ids_membros.forEach(membro => {
            if(req.body.id_administrador === membro){
                encontrou = true;
            }
        }); 

        if (encontrou){
            return res.status(400).json({ mensagem: "Membro já está no projeto!" });
        }else{
            verificaProjeto.ids_administradores.forEach(adm => {
                if(req.body.id_administrador === adm){
                    encontrou = true;
                }
            }); 
        }

        if (encontrou){
            return res.status(400).json({ mensagem: "Membro já está no projeto!" });
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
        return res.status(201).json({result: true});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Validada (04/05)
// Removendo um administrador do projeto
controller.removeAdministrador = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            return res.status(400).json({ mensagem: "Você não tem permissão para remover membros nesse Projeto!" });
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
        return res.status(201).json({result: true});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Testar com tarefas / subtarefas / atividades e Notificacao
// Deletando o projeto
controller.delete = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if(req.session.usuario.id !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para remover membros nesse Projeto!" });
        
        }

        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            return res.status(400).json({ mensagem: "Você não tem permissão para excluir esse Projeto!" });
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_gestor, verificaProjeto.id_gestor);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }

        // Deletando o anexo
        if (verificaProjeto.anexo){
            deletarAnexo(verificaProjeto.anexo);
        }

        // Deletando as tarefas
        const tarefasDeletar = await prisma.tarefa.findMany({
            where: { id_projeto: verificaProjeto.id }
        });

        let subtaresDeletar;
        let atividadesDeletar;

        // Verificando se a lsita não voltou vazia
        if (tarefasDeletar){

            // Tarefas a deletar
            for (const tarefa of tarefasDeletar){

                subtaresDeletar = await prisma.subTarefa.findMany({
                    where: { id_tarefa: tarefa.id }
                });

                // Verificando se a lsita não voltou vazio
                if (subtaresDeletar){

                    // SubTarefas a deletar
                    for (const subTarefa of subtaresDeletar){

                        atividadesDeletar = await prisma.atividade.findMany({
                            where: { id_subtarefa: subTarefa.id }
                        });

                        if (atividadesDeletar){

                            // Atividades a deletar
                            for (const atividade of atividadesDeletar){

                                // Deletando o anexo
                                if (atividade.anexo){
                                    deletarAnexo(atividade.anexo);
                                }

                                // Deletando as atividades
                                await prisma.atividade.delete({
                                    where: { id: atividade.id }
                                });
                            }
                        }

                        // Notificações a deletar
                        const notificacoesDeletar = await prisma.notificacao.findMany({
                            where: { id_subtarefa: subTarefa.id }
                        });

                        // Verificando se a lista não voltou vazia
                        if (notificacoesDeletar){

                            // SubTarefas a deletar
                            for (const notificacao of notificacoesDeletar){

                                // Deletando as subtarefas
                                await prisma.notificacao.delete({
                                    where: { id: notificacao.id }
                                });
                    
                            }
                            
                        }

                        // Deletando o anexo
                        if (subTarefa.anexo){
                            deletarAnexo(subTarefa.anexo);
                        }

                        // Deletando as subtarefas
                        await prisma.subTarefa.delete({
                            where: { id: subTarefa.id }
                        });
            
                    }
                    
                }

                // Deletando o anexo
                if (tarefa.anexo){
                    deletarAnexo(tarefa.anexo);
                }

                // Deletando as tarefas
                await prisma.tarefa.delete({
                    where: { id: tarefa.id }
                });
    
            }

        }

        // Busca o projeto a ser excluído
        await prisma.projeto.delete({
            where: { id: req.params.id }
        });
    
        // Envia mensagem confirmando a exclusão
        return res.status(201).json({result: true});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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