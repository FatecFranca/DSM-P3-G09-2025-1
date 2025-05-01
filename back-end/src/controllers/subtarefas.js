// Caro autor do arquivo, favor revisa-lo antes de liber-lo.
// Se esta mensagem ainda estiver aqui, significará que ele não foi revisado.

// Revisar deleção de subtarefas com atividades.

// Implemetar em Update / Create / Delete a adição do anexo da subtarefa em uma pasta, bem como a sua remoção caso necessário.

// Importando arquivos e bibliotecas importantes
import prisma from '../database/client.js';
const controller = {};

// Importando validação de sessão
import { validarSessao } from './utils.js';

// Validar com o front
// Função para excluir um arquivo da pasta
async function deletarAnexo(nomeArquivo) {
    // Caminho absoluto do arquivo
    const caminhoAnexo = path.join(process.cwd(), '..', 'uploads', 'anexoSubTarefas', nomeArquivo);

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

// Validado (01/05)
// Validar com o anexo do front
// Criando uma nova subtarefa
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
            where: { id: req.body.id_tarefa }
        });

        if (!tarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        // Obtendo os dados do projeto
        const projeto = await prisma.projeto.findFirst({
            where: { id: tarefa.id_projeto }
        });

        if (!projeto){
            return res.status(400).json({mensagem: "Tarefa pertence a um projeto inválido!"});
        }

        // Verificando se o usuário que está tentando cadastrar a sub é um adm ou gestor, pelo menos
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
            return res.status(400).json({mensagem: "Você não tem permissão para cadastrar Subtarefas nesse projeto!"});
        }

        const qtSubTarefas = await prisma.subTarefa.findMany({
            where: {
                id_tarefa: req.body.id_tarefa
            }
        });

        req.body.ordem = qtSubTarefas.length + 1;

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;

        await prisma.subTarefa.create({ data: req.body });

        // Retornando mensagem de sucesso
        return res.status(201).json({mensagem: "Subtarefa Cadastrada com Sucessso!"});
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

// Desativar posteriormente
// Obtendo todos os subtarefas cadastradas
controller.retrieveAll = async function(req, res) {
    try {
        // Buscando todas a tarefas cadastradas
        const result = await prisma.subTarefa.findMany({
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
// Obtendo uma subtarefa específica pelo id
controller.retrieveOne = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Obtendo os dados da SubTarefa
        const subTarefa = await prisma.subTarefa.findFirst({
            where: { id: req.params.id }
        });

        if (!subTarefa){
            return res.status(400).json({mensagem: "Subtarefa não Encontrada!"});
        }

        // Obtendo os dados da tarefa
        const tarefa = await prisma.tarefa.findFirst({
            where: { id: subTarefa.id_tarefa }
        });

        if (!tarefa){
            return res.status(400).json({mensagem: "Tarefa não encontrada para essa Subtarefa!"});
        }

        // Obtendo os dados da tarefa
        const projeto = await prisma.projeto.findFirst({
            where: { id: tarefa.id_projeto }
        });

        if (!projeto){
            return res.status(400).json({mensagem: "Projeto não encontrado!"});
        }

        // Verificando se o usuário que está tentando cadastrar a sub é um adm ou gestor, pelo menos
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
        return res.send(subTarefa);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Subtarefa Não Encontrada!"});
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
// Obtendo todas as subtarefas pela tarefa 
controller.retrieveAllTarefa = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        const tarefa = await prisma.tarefa.findFirst({
            where: {
                id: req.params.id
            }
        });

        if (!tarefa){
            return res.status(400).json({ mensagem: "Tarefa não Encontrada!" }); 
        }

        // Obtendo os dados do projeto pelo id da tarefa informada
        const projeto = await prisma.projeto.findFirst({
            where: {
                id: tarefa.id_projeto
            }
        });

        if (!projeto){
            return res.status(400).json({ mensagem: "Projeto não Encontrado!" }); 
        }

        // Verificando se o usuário tem permissão para ver as subtarefas desse projeto
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
            return res.status(400).json({mensagem: "Você não tem permissão para obter as subtarefas desse projeto!"});
        }

        // Buscando todos as subtarefas do projeto
        const subtarefas = await prisma.subTarefa.findMany({
            where: {id_tarefa: req.params.id},
            orderBy: {
                ordem: 'asc'
            }
        });

        if (!subtarefas){
            return res.status(400).json({ mensagem: "Nenhuma subtarefa Encontrada!" }); 
        }

        // Retorna os dados obtidos
        return res.send(subtarefas);
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


// Atualizando os dados da tarefa
controller.update = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se a tarefa existe
        const verificaSubTarefa = await prisma.subTarefa.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaSubTarefa){
            return res.status(400).json({mensagem: "Subtarefa não Encontrada!"});
        }

        // Obtendo os dados da tarefa para validação
        const verificaTarefa = await prisma.subTarefa.findUnique({
            where: { id: verificaSubTarefa.id_tarefa }
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
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({mensagem: "Subtarefa Atualizada com Sucesso!"});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Tarefa  não Encontrada!"});
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


// Finalizando/Reabrindo a tarefa (Mudando Status e Data Entrega)
controller.updateStatus = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se a Subtarefa existe
        const verificaSubTarefa = await prisma.subTarefa.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaSubTarefa){
            return res.status(400).json({mensagem: "Subtarefa não Encontrada!"});
        }

        // Obtendo os dados da taera a qual ela pertence
        const verificaTarefa = await prisma.subTarefa.findUnique({
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
                return res.status(400).json({ mensagem: "Você não tem permissão para alterar essa Subtarefa!" });
            }
        }

        // Verificando qual o tipo de alteração (Conclusão da Subtarefa ou reabertura)
        if (req.body.tipo_alteracao === "Concluir"){
            // Atualizando o status e data de entrega da Subtarefa
            await prisma.subTarefa.update({
                where: { id: req.params.id },
                data: {
                    status: "Concluída",
                    data_entrega: new Date()
                }
            });
        
            // Retornando mensagem de sucessao caso tenha atualizado
            return res.status(201).json({mensagem: "Subtarefa Concluída!"});

        }else if (req.body.tipo_alteracao === "Reabrir"){
            // Atualizando o status e data de entrega do projeto
            await prisma.subTarefa.update({
                where: { id: req.params.id },
                data: {
                    status: "Pendente",
                    data_entrega: null
                }
            });
        
            // Retornando mensagem de sucessao caso tenha atualizado
            return res.status(201).json({mensagem: "Subtarefa Reaberta!"});
        }
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Subtarefa Não Encontrada!"});
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


// Alterar a ordem de uma tarefa
controller.updateOrdem = async function(req, res) {
    // Verificando se a sessão foi iniciada
    const valSes = validarSessao(req);

    if (!valSes){
        return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
    }

    // Verificando se a tarefa existe
    const verificaSubtarefa = await prisma.subTarefa.findUnique({
        where: { id: req.params.id }
    });

    if (!verificaSubtarefa){
        return res.status(400).json({mensagem: "Subtarefa não Encontrada!"});
    }

    // Verificando se a tarefa existe
    const verificaTarefa = await prisma.tarefa.findUnique({
        where: { id: verificaSubtarefa.id_tarefa }
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

    // Obtendo a quantidade de subtarefas da tarefa
    const qtSubtarefas = await prisma.subTarefa.findMany({
        where: {
            id_projeto: verificaSubtarefa.id_tarefa
        }
    });

    // Verificando qual será o tipo de alteração (Especificada ou +/-)
    // Se for ordem estabelecida
    if (req.body.ordem){

        // Verificando se a ordem indicada já não é maior que a ordem máxima já cadastrada ou se não é menor que 1
        if (req.body.ordem < 1 || req.body.ordem === 0){
            return res.status(400).json({ mensagem: "Ordem inválida! Menor que um!" });
        }
        if (qtSubtarefas.length < req.body.ordem){
            return res.status(400).json({ mensagem: "Ordem inválida! Maior que a quantidade de subtarefas da tarefa!" });
        }

        // Se a ordem nova for menor qua a atual (de prioridade 5 para 2, ser mais urgente)
        if (req.body.ordem < verificaSubtarefa.ordem){
            // Obtendo as outras tarefas que estão antes dele, mas depois de sua nova ordem, para recurem 1 (+1, de 2 para 3...)
            const subTarefasMenores = await prisma.subTarefa.findMany({
                where: {
                    id_tarefa: verificaTarefa.id, 
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
            if (subTarefasMenores){
                for (const subTarefa of subTarefasMenores){
                    await prisma.subTarefa.update({
                        where: {
                            id: subTarefa.id
                        },
                        data:{
                            ordem: subTarefa.ordem + 1
                        }
                    });
                }
            }

        }else if (req.body.ordem > verificaSubtarefa.ordem){

            // Obtendo as outras tarefas que estão depois dela, mas antes de sua nova ordem, para avançarem 1 (-1, de 3 para 2...)
            const subTarefasMenores = await prisma.subTarefa.findMany({
                where: {
                    id_tarefa: verificaTarefa.id, 
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
            if (subTarefasMenores){
                for (const subTarefa of subTarefasMenores){
                    await prisma.subTarefa.update({
                        where: {
                            id: subTarefa.id
                        },
                        data:{
                            ordem: subTarefa.ordem - 1
                        }
                    });
                }
            }

        }

        await prisma.subTarefa.update({
            where: {
                id: verificaSubtarefa.id
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
            const subTarefaMenor = await prisma.subTarefa.findFirst({
                where: {
                    id_tarefa: verificaTarefa.id, 
                    ordem: {
                        equals: verificaSubtarefa.ordem - 1
                    }
                }
            });

            if (!subTarefaMenor){
                return res.status(400).json({ mensagem: "Essa Subtarefa já é a Primeira!" });
            }
    
            await prisma.subTarefa.update({
                where: {
                    id: subTarefaMenor.id
                },
                data:{
                    ordem: subTarefaMenor.ordem + 1
                }
            });

            await prisma.subTarefa.update({
                where: {
                    id: verificaSubtarefa.id
                },
                data:{
                    ordem: verificaSubtarefa.ordem - 1
                }
            });

            return res.status(200).json({ result: true, mensagem: "Subtarefa alterada para a posição " + (verificaTarefa.ordem -1) + "!" });


        // Se for regredir uma casa, alterada sera +1 e a que esta no seu lugar sera -1 (Troca de posições)
        }else if (req.body.tipo === "regredir"){

            const subTarefaMaior = await prisma.subTarefa.findFirst({
                where: {
                    id_tarefa: verificaTarefa.id, 
                    ordem: {
                        equals: verificaSubtarefa.ordem + 1
                    }
                }
            });

            if (!subTarefaMaior){
                return res.status(400).json({ mensagem: "Essa Subtarefa já é a Última!" });
            }
    
    
            await prisma.subTarefa.update({
                where: {
                    id: subTarefaMaior.id
                },
                data:{
                    ordem: subTarefaMaior.ordem - 1
                }
            });

            await prisma.subTarefa.update({
                where: {
                    id: verificaSubtarefa.id
                },
                data:{
                    ordem: verificaSubtarefa.ordem + 1
                }
            });

            return res.status(200).json({ result: true, mensagem: "Subtarefa alterada para a posição " + (verificaTarefa.ordem +1) + "!" });
        }
        
    }

    return res.status(400).json({ mensagem: "Um erro inesperado aconteceu! Verifique se a ordem não está como 0!"});

}


// Adicionando um membro na subtarefa
controller.addMembro = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Obtendo os dados da subtarefa
        const verificaSubTarefa = await prisma.subTarefa.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaSubTarefa){
            return res.status(400).json({ mensagem: "Subtarefa não encontrada!" });
        }

        // Obtendo os dados da tarefa
        const verificaTarefa = await prisma.tarefa.findUnique({
            where: { id: verificaSubTarefa.id }
        });

        if (!verificaTarefa){
            return res.status(400).json({ mensagem: "Tarefa não encontrada!" });
        }

        // Verificando se quem está alterando é o gestor do projeto ou administrador
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({ mensagem: "Projeto não encontrado!" });
        }

        // Verifica se o usuário tem permissão para adicionar um membro a tarefa
        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            let encontrou;
            verificaProjeto.ids_administradores.forEach(adm => {
                if (adm === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                return res.status(400).json({ mensagem: "Você não tem permissão para adicionar um membro a essa Subtarefa!" });
            }
        }

        // Verificando se o usuário a ser inderido é um membro do projeto
        let encontrou = false;
        if(req.session.usuario.id !== req.body.id_membro){
            verificaProjeto.ids_membros.forEach(membro => {
                if(req.body.id_membro === membro){
                    encontrou = true;
                }
            }); 

            if (!encontrou){
                verificaProjeto.ids_administradores.forEach(adm => {
                    if(req.body.id_membro === adm){
                        encontrou = true;
                    }
                }); 
            } 
        }else{
            encontrou = true;
        }

        
        if (!encontrou){
            return res.status(400).json({ mensagem: "Usuário não é um Membro do Projeto! Contacte o Gestor do Projeto!" });
        }

        encontrou = false;
        verificaSubTarefa.ids_membros.forEach(membro => {
            if(req.body.id_membro === membro){
                encontrou = true;
            }
        }); 

        if (encontrou){
            return res.status(400).json({ mensagem: "Membro já está alocado a Subtarefa!"});
        }

        // Atualizando os membros da subtarefa
        await prisma.subTarefa.update({
            where: { id: req.params.id },
            data: {
                ids_membros: {
                    push: req.body.id_membro
                }
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({mensagem: "Membro adicionado na Subtarefa com Sucesso!"});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Subtarefa Não Encontrada!"});
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


// Removendo um membro da subtarefa
controller.removeMembro = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Obtendo os dados da subtarefa
        const verificaSubTarefa = await prisma.subTarefa.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaSubTarefa){
            return res.status(400).json({ mensagem: "Subtarefa não encontrada!" });
        }

        // Obtendo os dados da tarefa
        const verificaTarefa = await prisma.tarefa.findUnique({
            where: { id: verificaSubTarefa.id }
        });

        if (!verificaTarefa){
            return res.status(400).json({ mensagem: "Tarefa não encontrada!" });
        }

        // Verificando se quem está alterando é o gestor do projeto ou administrador
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id }
        });

        if (!verificaProjeto){
            return res.status(400).json({ mensagem: "Projeto não encontrado!" });
        }

        // Verifica se o usuário tem permissão para adicionar um membro a tarefa
        if(req.session.usuario.id !== verificaProjeto.id_gestor){
            let encontrou;
            verificaProjeto.ids_administradores.forEach(adm => {
                if (adm === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                return res.status(400).json({ mensagem: "Você não tem permissão para adicionar um membro a essa Subtarefa!" });
            }
        }

        // Obtendo os membros que permaneceram na subtarefa
        const subtarefa = await prisma.subTarefa.findUnique({
            where: { id: req.params.id }
          });

        const membrosManter = subtarefa.ids_membros.filter(membro => membro !== req.body.id_membro);

        // Atualizando os membros removendo o solicitado
        await prisma.projeto.update({
            where: { id: req.params.id },
            data: {
                ids_membros: membrosManter
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({mensagem: "Membro removido da Subtarefa com Sucesso!"});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Subtarefa Não Encontrada!"});
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


// Validar com front para verificar o anexo e Deletar as subtarefas e atividades
// Deletando o projeto
controller.delete = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se a subtarefa existe
        const verificaSubtarefa = await prisma.subTarefa.findUnique({
            where: { id: req.params.id }
        });

        if (!verificaSubtarefa){
            return res.status(400).json({mensagem: "Subtarefa não Encontrada!"});
        }

        // Verificando se a tarefa existe
        const verificaTarefa = await prisma.tarefa.findUnique({
            where: { id: verificaSubtarefa.id_tarefa }
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
                return res.status(400).json({ mensagem: "Você não tem permissão para deletar essa Subtarefa!" });
            }
        }

        // Subtarefas a deletar
        const atividadesDeletar = await prisma.atividade.findMany({
            where: { id_subtarefa: req.params.id }
        });

        // Verificando se a lista não voltou vazio
        if (atividadesDeletar){

            // SubTarefas a deletar
            for (const atividade of atividadesDeletar){

                // Deletando as subtarefas
                await prisma.atividade.delete({
                    where: { id: atividade.id }
                });
    
            }
            
        }

        // Busca a subtarefa a ser excluída
        await prisma.tarefa.delete({
            where: { id: req.params.id }
        });

        // Ajustando as ordens das subtarefas devido a exclusão dessa
        const subTarefasCadastradas = await prisma.subTarefa.findMany({
            where: {
                id_tarefa: verificaTarefa.id
            },
            orderBy: {
                ordem: 'asc'
            }
        });

        if (subTarefasCadastradas){
            let cont = 1;
            for (const subTarefa of subTarefasCadastradas){
                await prisma.subTarefa.update({
                    where: {
                        id: subTarefa.id
                    },
                    data: { 
                        ordem: cont
                    }
                });
                cont += 1;
            }
        }
    
        // Envia mensagem confirmando a exclusão
        return res.status(201).json({mensagem: "Subtarefa Deletada com Sucessso!"});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Subtarefa Não Encontrada!"});
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