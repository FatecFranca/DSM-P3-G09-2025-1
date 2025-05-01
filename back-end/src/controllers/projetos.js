// Caro autor do arquivo, favor revisa-lo antes de liber-lo.
// Se esta mensagem ainda estiver aqui, significará que ele não foi revisado.

// Implemetar em Update / Create / Delete a adição do anexo do projeto em uma pasta, bem como a sua remoção caso necessário.

// Importando arquivos e bibliotecas importantes
import prisma from '../database/client.js';
import bcrypt from 'bcrypt';
const controller = {};

// Importando validação de sessão
import { validarSessao } from './utils.js';

// Validado (30/04)
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

// Validar com o front
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

// Validar com o anexo do front
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
        req.body.data_limite = new Date(req.body.data_limite);
        req.body.id_gestor = req.session.usuario.id;

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;

        await prisma.projeto.create({ data: req.body });

        // Retornando mensagem de sucesso
        return res.status(201).json({mensagem: "Projeto Cadastrado com Sucessso!"});
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
// Obtendo todos os projetos cadastrados
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

// Validado (30//04)
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
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}

// Validado (30/04)
// Obtendo todos os projetos pelo gestor
controller.retrieveAllGestor = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Buscando todos os projetos do gestor
        const projetosTodos = await prisma.projeto.findMany({
            where: {id_gestor: req.session.usuario.id}
        });

        // Todos os projetos finalizados
        const projetosConcluidos = await prisma.projeto.findMany({
            where: {id_gestor: req.session.usuario.id, status: "Concluído"}
        });
    
        // Todos os projetos pendentes
        const projetosPendentes = await prisma.projeto.findMany({
            where: {id_gestor: req.session.usuario.id, status: "Pendente"}
        });

        // Todos os projetos em andamento
        const projetosEmAndamento = await prisma.projeto.findMany({
            where: {id_gestor: req.session.usuario.id, status: "Em andamento"}
        });

        // Todos os projetos atrasados
        const projetosAtrasados = await prisma.projeto.findMany({
            where: {id_gestor: req.session.usuario.id, status: "Atrasado"}
        });

        // Retorna os dados obtidos
        return res.status(200).json({projetosTodos: projetosTodos, projetosConcluidos: projetosConcluidos, projetosEmAndamento: projetosEmAndamento, projetosAtrasados: projetosAtrasados, projetosPendentes: projetosPendentes});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

// Validado (30/04)
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

        // Todos os projetos em andamento
        const projetosEmAndamento = await prisma.projeto.findMany({
            where: {
                ids_administradores: {
                    has: req.session.usuario.id
                },
                status: "Em andamento"
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
        return res.status(200).json({projetosTodos: projetosTodos, projetosConcluidos: projetosConcluidos, projetosEmAndamento: projetosEmAndamento, projetosAtrasados: projetosAtrasados, projetosPendentes: projetosPendentes});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}

// Validado (30/04)
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

        // Todos os projetos em andamento
        const projetosEmAndamento = await prisma.projeto.findMany({
            where: {
                ids_membros: {
                    has: req.session.usuario.id
                },
                status: "Em andamento"
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
        return res.status(200).json({projetosTodos: projetosTodos, projetosConcluidos: projetosConcluidos, projetosEmAndamento: projetosEmAndamento, projetosAtrasados: projetosAtrasados, projetosPendentes: projetosPendentes});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}


// Atualizando os dados do projeto
controller.update = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
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
        }

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;
        console.log("Anexo:" + req.body.anexo);

        // Atualizando os dados do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: req.body
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({mensagem: "Projeto Atualizado com Sucesso!"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}


// Atualizando o gestor do projeto
controller.updateGestor = async function(req, res) {
    try {

        // Verificando se quem está alterando é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
            return res.status(400).json({ mensagem: "Você não tem permissão para alterar esse Projeto!"});
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_gestor, verificaProjeto.id_gestor);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }

        // Atualizando o gestor do projeto
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                id_gestor: req.body.id_gestorNovo
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({mensagem: "Gestor alterado com Sucesso! Você cedeu sua posição de Gestor do Projeto"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

// Validado (30/04)
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
            return res.status(201).json({mensagem: "Projeto Concluído!"});

        }else if (req.body.tipo_alteracao === "Reabrir"){
            // Atualizando o status e data de entrega do projeto
            await prisma.projeto.update({
                where: { id: req.params.id },
                data: {
                    status: "Em andamento",
                    data_entrega: null
                }
            });
        
            // Retornando mensagem de sucessao caso tenha atualizado
            return res.status(201).json({mensagem: "Projeto Reaberto!"});
        }
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

// Validado (30//04)
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
        return res.status(201).json({mensagem: "Membro adicionado no Projeto com Sucesso!"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}

// Validado (30//04)
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

        if(req.session.usuario.id !== verificaProjeto.id_gestor){
        
            return res.status(400).json({ mensagem: "Você não tem permissão para adicionar membros nesse Projeto!" });
        
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
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({mensagem: "Membro removido do Projeto com Sucesso!"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}

// Validado (30//04)
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
        return res.status(201).json({mensagem: "Administrador adicionado no Projeto com Sucesso!"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}

// Validado (30//04)
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
        return res.status(201).json({mensagem: "Administrador removido do Projeto com Sucesso!"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}


// Deletando o projeto
controller.delete = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se quem está excluindo é o gestor do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if(req.body.id_gestor !== verificaProjeto.id_gestor){
            return res.status(400).json({ mensagem: "Você não tem permissão para excluir esse Projeto!" });
        }

        // Verificando se a senha informada é a senha atual do usuario
        const valSenha = await validaSenha(req.body.senha_gestor, verificaProjeto.id_gestor);
        if (!valSenha){
            return res.status(400).json({ mensagem: "Senha Inválida!"});
        }

        // Deletando todos os dados relacionados ao projeto
        // Criar depois as exclusões das Tarefas, Subtarefas e Atividades

        // Busca o projeto a ser excluído
        await prisma.projeto.delete({
            where: { id: req.params.id }
        });
    
        // Envia mensagem confirmando a exclusão
        return res.status(201).json({mensagem: "Projeto Deletado com Sucessso!"});
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);
  
        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        return res.status(500).send(error);
    }
}

export default controller