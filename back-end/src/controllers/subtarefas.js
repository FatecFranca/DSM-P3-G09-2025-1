// Caro autor do arquivo, favor revisa-lo antes de liber-lo.
// Se esta mensagem ainda estiver aqui, significará que ele não foi revisado.

// Importando arquivos e bibliotecas importantes
import prisma from '../database/client.js';
const controller = {};

// Importando validação de sessão
import { validarSessao } from './utils.js';

// Testar com o front
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

// Validada (07/05)
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
        
        // Verificando se a data foi informada para converte-la em um formato aceitavel
        if (req.body.data_limite){
            req.body.data_limite = new Date(req.body.data_limite);

            // Verificando se a data infrmada é menor ou maior que a data atual, para atribuir o status correto
            if (req.body.data_limite < new Date()){
                return res.status(400).json({mensagem: "Data de Limite não pode ser Menor que a data Atual!"});
            }

        }

        // Obtendo os dados da tarefa
        const tarefa = await prisma.tarefa.findFirst({
            where: { id: req.body.id_tarefa }
        });

        if (!tarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        if (req.body.data_limite){
            if (tarefa.data_limite < req.body.data_limite){
                return res.status(400).json({mensagem: "Data limite para a entrega deve ser menor que a data limite para entrega da tarefa!"});
            }
        }else{
            return res.status(400).json({mensagem: "Data limite para a entrega deve ser informada!"});
        }

        // Obtendo os dados do projeto
        const projeto = await prisma.projeto.findFirst({
            where: { id: tarefa.id_projeto }
        });

        if (!projeto){
            return res.status(400).json({mensagem: "Tarefa pertence a um projeto inválido!"});
        }

        if (projeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if (tarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Tarefa já está Concluída! Não permitido alterações!"});
        }

        // Verificando se o usuário que está tentando cadastrar a sub é um adm ou gestor, pelo menos
        let encontrou = false;
        if (req.session.usuario.id !== projeto.id_gestor){
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
        return res.status(201).json({result: true});
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


// Desativar depois
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


// Validada (07/05)
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

        // Verificando se o usuário que está tentando obter os dados da sub é um adm ou gestor ou membro
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

// Validada (07/05)
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
        return res.status(200).json({ subtarefas: subtarefas, result: true });
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

// Validada (08/05)
// Atualizando os dados da subtarefa
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
        const verificaTarefa = await prisma.tarefa.findUnique({
            where: { id: verificaSubTarefa.id_tarefa }
        });

        if (!verificaTarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        if (req.body.data_limite){
            if (verificaTarefa.data_limite < req.body.data_limite){
                return res.status(400).json({mensagem: "Data limite para a entrega deve ser menor que a data limite para entrega da tarefa!"});
            }
        }else{
            return res.status(400).json({mensagem: "Data limite para a entrega deve ser informada!"});
        }

        // Obtendo os dados do projeto
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id_projeto }
        });

        if (!verificaProjeto){
            return res.status(400).json({mensagem: "Projeto não Encontrado!"});
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if (verificaTarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Tarefa já está Concluída! Não permitido alterações!"});
        }

        if (verificaSubTarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Subtarefa já está Concluída! Não permitido alterações!"});
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

            // Verificando se a data infrmada é menor ou maior que a data atual, para atribuir o status correto
            if (req.body.data_limite < new Date()){
                req.body.status = "Atrasada"
            }else{
                req.body.status = "Pendente"
            }

        }

        // Deletando o anexo
        if (verificaSubTarefa.anexo){
            deletarAnexo(verificaSubTarefa.anexo);
        }

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;

        // Deletando dados que não devem ser informados nessa função, mas que são alterados em outras
        delete req.body.ordem;
        delete req.body.id_tarefa;
        delete req.body.data_entrega;
        delete req.body.ids_membros;

        if (req.body.status === "Atrasada"){
            // Verificando se as notificações já foram enviadas para os usuários necessários 
            for (const idUsu of verificaSubTarefa.ids_membros){
                const notficacao = await prisma.notificacao.findFirst({
                    where: {
                        id_usuario: idUsu,
                        id_subtarefa: verificaSubTarefa.id,
                        tipo: "Atraso"
                    }
                });

                if (!notficacao){
                    
                    // Criando a notificação a ser apresentada ao novo membro da subtarefa

                    const notifica = {
                        tipo: "Atraso",
                        titulo: "Subtarefa Atrasada",
                        texto: "Há uma subtarefa Atrasada. Verifique se você pode contribuir para entrega-la o mais rápido possivel. Projeto: " + verificaProjeto.titulo + " => Tarefa: " + verificaTarefa.titulo + " => " + " Subtarefa: " + verificaSubTarefa.titulo,
                        id_usuario: idUsu,
                        id_subtarefa: verificaSubTarefa.id,
                        data_criacao: new Date()
                    }

                    await prisma.notificacao.create({
                        data: notifica
                    });
                }
            }
        }
        
        // Atualizando os dados do projeto
        await prisma.subTarefa.update({
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

// Validada (07/05)
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
        const verificaTarefa = await prisma.tarefa.findUnique({
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

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if (verificaTarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Tarefa já está Concluída! Não permitido alterações!"});
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

            // Deletando todas as notificações criadas dessa subtarefa
            await prisma.notificacao.deleteMany({
                where: {
                    id_subtarefa: req.params.id
                }
            });
        
            // Retornando mensagem de sucessao caso tenha atualizado
            return res.status(201).json({mensagem: "Subtarefa Concluída!"});

        }else if (req.body.tipo_alteracao === "Reabrir"){

            // Atualizando o status e data de entrega do projeto, de acordo com a data limite
            if (verificaSubTarefa.data_limite < new Date()){
                await prisma.subTarefa.update({
                    where: { id: req.params.id },
                    data: {
                        status: "Atrasada",
                        data_entrega: null
                    }
                });

                // Verificando se as notificações já foram enviadas para os usuários necessários 
                for (const idUsu of verificaSubTarefa.ids_membros){
                    const notficacao = await prisma.notificacao.findFirst({
                        where: {
                            id_usuario: idUsu,
                            id_subtarefa: verificaSubTarefa.id,
                            tipo: "Atraso"
                        }
                    });

                    if (!notficacao){
                        
                        // Criando a notificação a ser apresentada ao novo membro da subtarefa

                        const notifica = {
                            tipo: "Atraso",
                            titulo: "Subtarefa Atrasada",
                            texto: "Há uma subtarefa Atrasada. Verifique se você pode contribuir para entrega-la o mais rápido possivel. Projeto: " + verificaProjeto.titulo + " => Tarefa: " + verificaTarefa.titulo + " => " + " Subtarefa: " + verificaSubTarefa.titulo,
                            id_usuario: idUsu,
                            id_subtarefa: verificaSubTarefa.id,
                            data_criacao: new Date()
                        }

                        await prisma.notificacao.create({
                            data: notifica
                        });
                    }
                }

            }else{
                await prisma.subTarefa.update({
                    where: { id: req.params.id },
                    data: {
                        status: "Pendente",
                        data_entrega: null
                    }
                });
            }
           
        
            // Retornando mensagem de sucessao caso tenha atualizado
            return res.status(201).json({mensagem: "Subtarefa Reaberta!"});
        }else{
            return res.status(400).json({ mensagem: "Função Inválida! Operação não existente!"});
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

// Validada (07/05)
// Alterar a ordem de uma tarefa
controller.updateOrdem = async function(req, res) {
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

    // Verificando se a tarefa existe
    const verificaTarefa = await prisma.tarefa.findUnique({
        where: { id: verificaSubTarefa.id_tarefa }
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

    if (verificaProjeto.status === "Concluído"){
        return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
    }

    if (verificaTarefa.status === "Concluída"){
        return res.status(400).json({mensagem: "Tarefa já está Concluída! Não permitido alterações!"});
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
            id_tarefa: verificaSubTarefa.id_tarefa
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
        if (req.body.ordem < verificaSubTarefa.ordem){
            // Obtendo as outras tarefas que estão antes dele, mas depois de sua nova ordem, para recurem 1 (+1, de 2 para 3...)
            const subTarefasMenores = await prisma.subTarefa.findMany({
                where: {
                    id_tarefa: verificaTarefa.id, 
                    ordem: {
                        gte: req.body.ordem,
                        lt: verificaSubTarefa.ordem
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

        }else if (req.body.ordem > verificaSubTarefa.ordem){

            // Obtendo as outras tarefas que estão depois dela, mas antes de sua nova ordem, para avançarem 1 (-1, de 3 para 2...)
            const subTarefasMenores = await prisma.subTarefa.findMany({
                where: {
                    id_tarefa: verificaTarefa.id, 
                    ordem: {
                        lte: req.body.ordem,
                        gt: verificaSubTarefa.ordem
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
                id: verificaSubTarefa.id
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
                        equals: verificaSubTarefa.ordem - 1
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
                    id: verificaSubTarefa.id
                },
                data:{
                    ordem: verificaSubTarefa.ordem - 1
                }
            });

            return res.status(200).json({ result: true, mensagem: "Subtarefa alterada para a posição " + (verificaSubTarefa.ordem -1) + "!" });


        // Se for regredir uma casa, alterada sera +1 e a que esta no seu lugar sera -1 (Troca de posições)
        }else if (req.body.tipo === "regredir"){

            const subTarefaMaior = await prisma.subTarefa.findFirst({
                where: {
                    id_tarefa: verificaTarefa.id, 
                    ordem: {
                        equals: verificaSubTarefa.ordem + 1
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
                    id: verificaSubTarefa.id
                },
                data:{
                    ordem: verificaSubTarefa.ordem + 1
                }
            });

            return res.status(200).json({ result: true, mensagem: "Subtarefa alterada para a posição " + (verificaSubTarefa.ordem +1) + "!" });
        }
        
    }

    return res.status(400).json({ mensagem: "Um erro inesperado aconteceu! Verifique se a ordem não está como 0!"});

}

// Validada (07/05)
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
            where: { id: verificaSubTarefa.id_tarefa }
        });

        if (!verificaTarefa){
            return res.status(400).json({ mensagem: "Tarefa não encontrada!" });
        }

        // Verificando se quem está alterando é o gestor do projeto ou administrador
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id_projeto }
        });

        if (!verificaProjeto){
            return res.status(400).json({ mensagem: "Projeto não encontrado!" });
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if (verificaTarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Tarefa já está Concluída! Não permitido alterações!"});
        }

        if (verificaSubTarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Subtarefa já está Concluída! Não permitido alterações!"});
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
        }else{
            return res.status(400).json({ mensagem: "Você não pode se adicionar em uma Subtarefa!" });
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

        // Criando a notificação a ser apresentada ao novo membro da subtarefa

        const dtLimFormatada = new Date(verificaSubTarefa.data_limite).toLocaleDateString('pt-BR');

        const notifica = {
            tipo: "Atribuição",
            titulo: "Nova Subtarefa atribuida",
            texto: "Uma nova Subtarefa foi atribuida a você. Projeto: " + verificaProjeto.titulo + " => Tarefa: " + verificaTarefa.titulo + " => Subtarefa: " + verificaSubTarefa.titulo + " Com o praso de entraga para o dia " + dtLimFormatada + " Fique atento para contribuir com ela até este praso.",
            id_usuario: req.body.id_membro,
            id_subtarefa: verificaSubTarefa.id,
            data_criacao: new Date()
        }

        // Cadastrando a notificação
        await prisma.notificacao.create({
            data: notifica
        });

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
        return res.status(201).json({result: true});
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

// Validada (07/05)
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
            where: { id: verificaSubTarefa.id_tarefa }
        });

        if (!verificaTarefa){
            return res.status(400).json({ mensagem: "Tarefa não encontrada!" });
        }

        // Verificando se quem está alterando é o gestor do projeto ou administrador
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id_projeto }
        });

        if (!verificaProjeto){
            return res.status(400).json({ mensagem: "Projeto não encontrado!" });
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if (verificaTarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Tarefa já está Concluída! Não permitido alterações!"});
        }

        if (verificaSubTarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Subtarefa já está Concluída! Não permitido alterações!"});
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
                return res.status(400).json({ mensagem: "Você não tem permissão para remover um membro a essa Subtarefa!" });
            }
        }

        // Deletando todas as notificações criadas para esse usuário
        await prisma.notificacao.deleteMany({
            where: {
                id_subtarefa: verificaSubTarefa.id,
                id_usuario: req.params.id
            }
        })
    

        // Obtendo os membros que permaneceram na subtarefa
        const subtarefa = await prisma.subTarefa.findUnique({
            where: { id: req.params.id }
          });

        const membrosManter = subtarefa.ids_membros.filter(membro => membro !== req.body.id_membro);

        // Atualizando os membros removendo o solicitado
        await prisma.subTarefa.update({
            where: { id: req.params.id },
            data: {
                ids_membros: membrosManter
            }
        });
    
        // Retornando mensagem de sucessao caso tenha atualizado
        return res.status(201).json({result: true});
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


// Testar com atividades e Notificacao
// Deletando a subtarefa
controller.delete = async function(req, res) {
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
            where: { id: verificaSubTarefa.id_tarefa }
        });

        if (!verificaTarefa){
            return res.status(400).json({ mensagem: "Tarefa não encontrada!" });
        }

        // Verificando se quem está alterando é o gestor do projeto ou administrador
        const verificaProjeto = await prisma.projeto.findUnique({
            where: { id: verificaTarefa.id_projeto }
        });

        if (!verificaProjeto){
            return res.status(400).json({ mensagem: "Projeto não encontrado!" });
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
        }

        if (verificaTarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Tarefa já está Concluída! Não permitido alterações!"});
        }

        if (verificaSubTarefa.status === "Concluída"){
            return res.status(400).json({mensagem: "Subtarefa já está Concluída! Não permitido alterações!"});
        }

        if (verificaProjeto.status === "Concluído"){
            return res.status(400).json({mensagem: "Projeto já está Concluído! Não permitido alterações!"});
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

        // Atividades a deletar
        const atividadesDeletar = await prisma.atividade.findMany({
            where: { id_subtarefa: req.params.id }
        });

        // Notificações a deletar
        const notificacoesDeletar = await prisma.notificacao.findMany({
            where: { id_subtarefa: req.params.id }
        });

        // Verificando se a lista não voltou vazia
        if (atividadesDeletar){

            // SubTarefas a deletar
            for (const atividade of atividadesDeletar){

                // Deletando o anexo
                if (atividade.anexo){
                    deletarAnexo(atividade.anexo);
                }

                // Deletando as subtarefas
                await prisma.atividade.delete({
                    where: { id: atividade.id }
                });
    
            }
            
        }

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
        if (verificaSubTarefa.anexo){
            deletarAnexo(verificaSubTarefa.anexo);
        }

        // Busca a subtarefa a ser excluída
        await prisma.subTarefa.delete({
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
        return res.status(201).json({result: true});
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