// Caro autor do arquivo, favor revisa-lo antes de liber-lo.
// Se esta mensagem ainda estiver aqui, significará que ele não foi revisado.

// Revisar deleção de tarefas com atividades e subtarefas.

// Implemetar em Update / Create / Delete a adição do anexo da tarefa em uma pasta, bem como a sua remoção caso necessário.

// Importando arquivos e bibliotecas importantes
import prisma from '../database/client.js';
const controller = {};

// Importando validação de sessão
import { atualizaStatus, validarSessao } from './utils.js';

// Validar com o front
// Função para excluir um arquivo da pasta
async function deletarAnexo(nomeArquivo) {
    // Caminho absoluto do arquivo
    const caminhoAnexo = path.join(process.cwd(), '..', 'uploads', 'anexoTarefas', nomeArquivo);

    // Verifica se o arquivo existe antes de tentar excluir
    if (fs.existsSync(caminhoAnexo)) {
        fs.unlink(caminhoAnexo, (err) => {
        if (err) {
            console.error('Erro ao deletar o anexo:', err);
        } else {
            console.log('Anexo deletado com sucesso!');
        }
        });
    } else {
        console.log('Anexo não encontrado:', caminhoAnexo);
    }
}

// Validado (01/05) - Testar depois anexo com front
// Validar com o anexo do front
// Criando uma nova tarefa
controller.create = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Ajustando alguns dados
        req.body.status = "Pendente";
        req.body.data_criacao = new Date();
        req.body.data_limite = new Date(req.body.data_limite);

        // Obtendo os dados da tarefa
        const tarefa = await prisma.tarefa.findFirst({
            where: { id: req.params.id }
        });

        if (!tarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        // Obtendo os dados da tarefa
        const tarefaProjeto = await prisma.projeto.findFirst({
            where: { id: tarefa.id_projeto }
        });

        if (!tarefaProjeto){
            return res.status(400).json({mensagem: "Tarefa pertence um projeto inválido!"});
        }

        // Verificando se o usuário que está consultando os dados é pelo menos um membro ou administrador do projeto
        let encontrou = false;
        if (req.session.usuario.id !== tarefaProjeto.id_gestor){
            tarefaProjeto.ids_membros.forEach(membro => {
                if (membro === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                tarefaProjeto.ids_administradores.forEach(adm => {
                    if (adm === req.session.usuario.id){
                        encontrou = true;
                    }
                });
            }
        }else{
            encontrou = true;
        }

        if (!encontrou){
            return res.status(400).json({mensagem: "Você não tem permissão para cadastrar tarefas nesse projeto!"});
        }

        const qtTarefasProjeto = await prisma.tarefa.findMany({
            where: {
                id_projeto: req.body.id_projeto
            }
        });

        req.body.ordem = qtTarefasProjeto.length + 1;

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;

        await prisma.tarefa.create({ data: req.body });

        // Retornando mensagem de sucesso
        return res.status(201).json({mensagem: "Tarefa Cadastrada com Sucessso!"});
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
// Obtendo todos os tarefas cadastradas
controller.retrieveAll = async function(req, res) {
    try {
        // Buscando todas a tarefas cadastradas
        const result = await prisma.tarefa.findMany({
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

// Validado (01/05)
// Obtendo uma tarefa específica pelo id
controller.retrieveOne = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Obtendo os dados da tarefa
        const tarefa = await prisma.tarefa.findFirst({
            where: { id: req.params.id }
        });

        if (!tarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        // Obtendo os dados da tarefa
        const tarefaProjeto = await prisma.projeto.findFirst({
            where: { id: tarefa.id_projeto }
        });

        if (!tarefaProjeto){
            return res.status(400).json({mensagem: "Tarefa pertence um projeto inválido!"});
        }

        // Verificando se o usuário que está consultando os dados é pelo menos um membro ou administrador do projeto
        let encontrou = false;
        if (req.session.usuario.id !== tarefaProjeto.id_gestor){
            tarefaProjeto.ids_membros.forEach(membro => {
                if (membro === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                tarefaProjeto.ids_administradores.forEach(adm => {
                    if (adm === req.session.usuario.id){
                        encontrou = true;
                    }
                });
            }
        }else{
            encontrou = true;
        }

        if (!encontrou){
            return res.status(400).json({mensagem: "Você não tem permissão para obter os dados dessa tarefa!"});
        }
        
        // Retorna os dados obtidos
        return res.send(tarefa);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Validado (01/05)
// Obtendo todas as tarefas pelo projeto 
controller.retrieveAllProjeto = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        const projeto = await prisma.projeto.findFirst({
            where: {
                id: req.params.id
            }
        });

        if (!projeto){
            return res.status(400).json({ mensagem: "Projeto não Encontrado!" }); 
        }

        // Verificando se o usuário tem permissão para ver as tarefas desse projeto
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
            return res.status(400).json({mensagem: "Você não tem permissão para obter as tarefas desse projeto!"});
        }

        // Buscando todos as tarefas do projeto
        const tarefas = await prisma.tarefa.findMany({
            where: {id_projeto: req.params.id},
            orderBy: {
                ordem: 'asc'
            }
        });

        if (!tarefas){
            return res.status(400).json({ mensagem: "Nenhuma tarefa Encontrada!" }); 
        }

        // Retorna os dados obtidos
        return res.send(tarefas);
    }
    catch(error) {
        // Deu errado: exibe o erro no terminal
        console.error(error);

        // Envia o erro ao front-end, com status de erro
        // HTTP 500: Internal Server Error
        res.status(500).send(error);
    }
}

// Validado (01/05)
// Atualizando os dados da tarefa
controller.update = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se a tarefa existe
        const verificaTarefa = await prisma.tarefa.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaTarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        // Obtendo os dados do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id_projeto }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        // Verificando se quem está alterando é o gestor do projeto ou um administrador
        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            let encontrou;
            verificaProjeto.ids_administradores.forEach(adm => {
                if (adm === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                return res.status(400).json({ mensagem: "Você não tem permissão para alterar essa Tarefa!" });
            }
        }

        // Verificando se a data foi informada para converte-la em um formato aceitavel
        if (req.body.data_limite){
            req.body.data_limite = new Date(req.body.data_limite);
        }

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;

        // Deletando a possibilidade de ser informada a ordem da tarefa, há uma função específica para esse controle.
        // Deletanndo também possíbilidade de alterar o projeto da tarefa
        delete req.body.ordem;
        delete req.body.id_projeto;

        // Atualizando os dados do projeto
        await prisma.tarefa.update({
            where: { id: req.params.id },
            data: req.body
        });

        // Chamando a função para atualizar os status dos projetos, tarefas e subtarefas do usuário
        const atzStatus = atualizaStatus(req);

        if (!atzStatus){
            return res.status(400).json({ mensagem: "Erro ao atualizar Status de Projetos!" }); 
        }
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({mensagem: "Tarefa Atualizada com Sucesso!"});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Tarefa / Projeto não Encontrada(o)! Verifique os dados enviados!"});
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

// Validado (01/05)
// Finalizando/Reabrindo a tarefa (Mudando Status e Data Entrega)
controller.updateStatus = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se a tarefa existe
        const verificaTarefa = await prisma.tarefa.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaTarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        // Verificando se quem está alterando é o gestor do projeto ou um administrador
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id_projeto }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        // Verifica se o usuário tem permissão para alterar
        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            let encontrou;
            verificaProjeto.ids_administradores.forEach(adm => {
                if (adm === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                return res.status(400).json({ mensagem: "Você não tem permissão para alterar essa Tarefa!" });
            }
        }

        // Verificando qual o tipo de alteração (Conclusão da Tarefa ou reabertura)
        if (req.body.tipo_alteracao === "Concluir"){
            // Atualizando o status e data de entrega do projeto
            await prisma.tarefa.update({
                where: { id: req.params.id },
                data: {
                    status: "Concluída",
                    data_entrega: new Date()
                }
            });

            // Chamando a função para atualizar os status dos projetos, tarefas e subtarefas do usuário
            const atzStatus = atualizaStatus(req);

            if (!atzStatus){
                return res.status(400).json({ mensagem: "Erro ao atualizar Status de Projetos!" }); 
            }
        
            // Retornando mensagem de sucessao caso tenha atualizado
            return res.status(201).json({mensagem: "Tarefa Concluída!"});

        }else if (req.body.tipo_alteracao === "Reabrir"){
            // Atualizando o status e data de entrega do projeto
            await prisma.tarefa.update({
                where: { id: req.params.id },
                data: {
                    status: "Pendente",
                    data_entrega: null
                }
            });

            // Chamando a função para atualizar os status dos projetos, tarefas e subtarefas do usuário
            const atzStatus = atualizaStatus(req);

            if (!atzStatus){
                return res.status(400).json({ mensagem: "Erro ao atualizar Status de Projetos!" }); 
            }
        
            // Retornando mensagem de sucessao caso tenha atualizado
            return res.status(201).json({mensagem: "Tarefa Reaberta!"});
        }
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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

// Validado (01/05)
// Alterar a ordem de uma tarefa
controller.updateOrdem = async function(req, res) {
    // Verificando se a sessão foi iniciada
    const valSes = validarSessao(req);

    if (!valSes){
        return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
    }

    // Verificando se a tarefa existe
    const verificaTarefa = await prisma.tarefa.findUnique({
        where: { id: req.params.id }
    });

    if (!verificaTarefa){
        return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
    }

    // Verificando se quem está alterando é o gestor do projeto ou um administrador
    const verificaProjeto = await prisma.projeto.findUnique({
        where: { id: verificaTarefa.id_projeto }
    });

    if (!verificaProjeto){
        return res.status(400).json({mensagem: "Projeto não Encontrado!"});
    }

    const qtTarefasProjeto = await prisma.tarefa.findMany({
        where: {
            id_projeto: verificaTarefa.id_projeto
        }
    });

    // Verifica se o usuário tem permissão para alterar
    if(req.session.usuario.id !== verificaProjeto.id_gestor){
        let encontrou;
        verificaProjeto.ids_administradores.forEach(adm => {
            if (adm === req.session.usuario.id){
                encontrou = true;
            }
        });

        if (!encontrou){
            return res.status(400).json({ mensagem: "Você não tem permissão para alterar essa Tarefa!" });
        }
    }

    // Verificando qual será o tipo de alteração (Especificada ou +/-)
    // Se for ordem estabelecida
    if (req.body.ordem){

        // Verificando se a ordem indicada já não é maior que a ordem máxima já cadastrada ou se não é menor que 1
        if (req.body.ordem < 1 || req.body.ordem === 0){
            return res.status(400).json({ mensagem: "Ordem inválida! Menor que um!" });
        }
        if (qtTarefasProjeto.length < req.body.ordem){
            return res.status(400).json({ mensagem: "Ordem inválida! Maior que a quantidade de tarefas do projeto!" });
        }

        // Se a ordem nova for menor qua a atual (de prioridade 5 para 2, ser mais urgente)
        if (req.body.ordem < verificaTarefa.ordem){
            // Obtendo as outras tarefas que estão antes dele, mas depois de sua nova ordem, para recurem 1 (+1, de 2 para 3...)
            const tarefasMenores = await prisma.tarefa.findMany({
                where: {
                    id_projeto: verificaProjeto.id, 
                    ordem: {
                        gte: req.body.ordem,
                        lt: verificaTarefa.ordem
                    }
                },
                orderBy: {
                    ordem: "asc"
                }
            });

            // Alterando (+1), menos prioridade
            if (tarefasMenores){
                for (const tarefa of tarefasMenores){
                    await prisma.tarefa.update({
                        where: {
                            id: tarefa.id
                        },
                        data:{
                            ordem: tarefa.ordem + 1
                        }
                    });
                }
            }

        }else if (req.body.ordem > verificaTarefa.ordem){

            // Obtendo as outras tarefas que estão depois dela, mas antes de sua nova ordem, para avançarem 1 (-1, de 3 para 2...)
            const tarefasMenores = await prisma.tarefa.findMany({
                where: {
                    id_projeto: verificaProjeto.id, 
                    ordem: {
                        lte: req.body.ordem,
                        gt: verificaTarefa.ordem
                    }
                },
                orderBy: {
                    ordem: "asc"
                }
            });

            // Alterando (-1), mais prioridade
            if (tarefasMenores){
                for (const tarefa of tarefasMenores){
                    await prisma.tarefa.update({
                        where: {
                            id: tarefa.id
                        },
                        data:{
                            ordem: tarefa.ordem - 1
                        }
                    });
                }
            }

        }

        await prisma.tarefa.update({
            where: {
                id: verificaTarefa.id
            },
            data: {
                ordem: req.body.ordem
            }
        });

        return res.status(200).json({ result: true, mensagem: "Tarefa alterada para a posição " + req.body.ordem + "!" });

    // Se for pot tipo (uma casa para frente ou para traz)
    }else if (req.body.tipo){

        // Se for avançar uma casa, alterada sera -1 e a que esta no seu lugar sera +1 (Troca de posições)
        if (req.body.tipo === "antecipar"){
            const tarefaMenor = await prisma.tarefa.findFirst({
                where: {
                    id_projeto: verificaProjeto.id, 
                    ordem: {
                        equals: verificaTarefa.ordem - 1
                    }
                }
            });

            if (!tarefaMenor){
                return res.status(400).json({ mensagem: "Essa Tarefa já é a Primeira!" });
            }
    
            await prisma.tarefa.update({
                where: {
                    id: tarefaMenor.id
                },
                data:{
                    ordem: tarefaMenor.ordem + 1
                }
            });

            await prisma.tarefa.update({
                where: {
                    id: verificaTarefa.id
                },
                data:{
                    ordem: verificaTarefa.ordem - 1
                }
            });

            return res.status(200).json({ result: true, mensagem: "Tarefa alterada para a posição " + (verificaTarefa.ordem -1) + "!" });


        // Se for regredir uma casa, alterada sera +1 e a que esta no seu lugar sera -1 (Troca de posições)
        }else if (req.body.tipo === "regredir"){

            const tarefaMaior = await prisma.tarefa.findFirst({
                where: {
                    id_projeto: verificaProjeto.id, 
                    ordem: {
                        equals: verificaTarefa.ordem + 1
                    }
                }
            });

            if (!tarefaMaior){
                return res.status(400).json({ mensagem: "Essa Tarefa já é a Última!" });
            }
    
    
            await prisma.tarefa.update({
                where: {
                    id: tarefaMaior.id
                },
                data:{
                    ordem: tarefaMaior.ordem - 1
                }
            });

            await prisma.tarefa.update({
                where: {
                    id: verificaTarefa.id
                },
                data:{
                    ordem: verificaTarefa.ordem + 1
                }
            });

            return res.status(200).json({ result: true, mensagem: "Tarefa alterada para a posição " + (verificaTarefa.ordem +1) + "!" });
        }
        
    }

    return res.status(400).json({ mensagem: "Um erro inesperado aconteceu! Verifique se a ordem não está como 0!"});

}

// Validado (01/05)
// Validar com front para verificar o anexo e Deletar as subtarefas e atividades
// Deletando o projeto
controller.delete = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se a tarefa existe
        const verificaTarefa = await prisma.tarefa.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaTarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        // Verificando se quem está alterando é o gestor do projeto ou um administrador
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id_projeto }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        // Verifica se o usuário tem permissão para alterar
        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            let encontrou;
            verificaProjeto.ids_administradores.forEach(adm => {
                if (adm === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                return res.status(400).json({ mensagem: "Você não tem permissão para deletar essa Tarefa!" });
            }
        }

        // Subtarefas a deletar
        const subtaresDeletar = await prisma.subTarefa.findMany({
            where: { id_tarefa: req.params.id }
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

                        // Deletando as atividades
                        await prisma.atividade.delete({
                            where: { id: atividade.id }
                        });
                    }
                }

                // Deletando as subtarefas
                await prisma.subTarefa.delete({
                    where: { id: subTarefa.id }
                });
    
            }
            
        }

        // Busca o a tarefa a ser excluída
        await prisma.tarefa.delete({
            where: { id: req.params.id }
        });

        // Ajustando as ordens das tarefas devido a exclusão dessa
        const tarefasCadastradas = await prisma.tarefa.findMany({
            where: {
                id_projeto: verificaProjeto.id
            },
            orderBy: {
                ordem: 'asc'
            }
        });

        if (tarefasCadastradas){
            let cont = 1;
            for (const tarefa of tarefasCadastradas){
                await prisma.tarefa.update({
                    where: {
                        id: tarefa.id
                    },
                    data: { 
                        ordem: cont
                    }
                });
                cont += 1;
            }
        }
    
        // Envia mensagem confirmando a exclusão
        return res.status(201).json({mensagem: "Tarefa Deletada com Sucessso!"});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
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