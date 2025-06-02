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
    const caminhoAnexo = path.join(process.cwd(), '..', 'uploads', 'anexoAtividades', nomeArquivo);

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

// Validada (08/05)
// Criando uma nova atividade
controller.create = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Ajustando alguns dados
        req.body.data_realizacao = new Date();

        // Obtendo os dados da subtarefa
        const verificaSubTarefa = await prisma.subTarefa.findFirst({
            where: { id: req.body.id_subtarefa }
        });

        if (!verificaSubTarefa){
            return res.status(400).json({mensagem: "Subtarefa não Encontrada!"});
        }

        // Obtendo os dados da tarefa
        const verificaTarefa = await prisma.tarefa.findFirst({
          where: { id: verificaSubTarefa.id_tarefa }
        });

        if (!verificaTarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        // Obtendo os dados da projeto
        const verificaProjeto = await prisma.projeto.findFirst({
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

        // Verificando se o usuário que está tentando cadastrar a atividade é um adm ou gestor, ou pelo menos  membro
        let encontrou = false;
        if (req.session.usuario.id !== verificaProjeto.id_gestor){
            verificaSubTarefa.ids_membros.forEach(membro => {
                if (membro === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                verificaProjeto.ids_administradores.forEach(adm => {
                    if (adm === req.session.usuario.id){
                        encontrou = true;
                    }
                });
            }
        }else{
            encontrou = true;
        }

        if (!encontrou){
            return res.status(400).json({mensagem: "Você não tem permissão para cadastrar atividades nessa Subtarefa!"});
        }

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;

        req.body.id_membro = req.session.usuario.id;

        await prisma.atividade.create({ data: req.body });

        // Retornando mensagem de sucesso
        return res.status(201).json({result: true});
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Atividade Não Cadastrada!"});
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
controller.retrieveAll = async function(req, res) {
    try {
        // Buscando todas a tarefas cadastradas
        const result = await prisma.atividade.findMany({
            orderBy: [ { data_realizacao: 'asc' } ]
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


// Validada (08/05)
// Obtendo uma atividade específica pelo id
controller.retrieveOne = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Obtendo os dados da atividade
        const atividade = await prisma.atividade.findFirst({
            where: { id: req.params.id }
        });

        if (!atividade){
            return res.status(400).json({mensagem: "Atividade não Encontrada!"});
        }

        // Obtendo os dados da subtarefa
        const subTarefa = await prisma.subTarefa.findFirst({
            where: { id: atividade.id_subtarefa }
        });

        if (!subTarefa){
            return res.status(400).json({mensagem: "Subtarefa não Encontrada!"});
        }

        // Obtendo os dados da tarefa
        const tarefa = await prisma.tarefa.findFirst({
          where: { id: subTarefa.id_tarefa }
        });

        if (!tarefa){
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        // Obtendo os dados da tarefa
        const projeto = await prisma.projeto.findFirst({
            where: { id: tarefa.id_projeto }
        });

        if (!projeto){
            return res.status(400).json({mensagem: "Projeto não encontrado!"});
        }

        // Verificando se o usuário que está tentando visualizar a atividade é um adm ou gestor ou membro do projeto
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
            return res.status(400).json({mensagem: "Você não tem permissão para obter os dados dessa Atividade!"});
        }
        
        // Retorna os dados obtidos
        return res.send(atividade);
    }
    catch(error) {
        // P2025: erro do Prisma referente a objeto não encontrado
        if(error?.code === 'P2025' || error?.code === 'P2023') {
            // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
            res.status(400).json({mensagem: "Atividade Não Encontrada!"});
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
// Obtendo todas as subtarefas pela tarefa 
controller.retrieveAllSubTarefa = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Obtendo os dados da subtarefa
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
            return res.status(400).json({mensagem: "Tarefa não Encontrada!"});
        }

        // Obtendo os dados da tarefa
        const projeto = await prisma.projeto.findFirst({
            where: { id: tarefa.id_projeto }
        });

        if (!projeto){
            return res.status(400).json({mensagem: "Projeto não encontrado!"});
        }

        // Verificando se o usuário que está tentando visualizar a atividade é um adm ou gestor ou membro do projeto
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
            return res.status(400).json({mensagem: "Você não tem permissão para obter os dados dessas Atividades!"});
        }

        const atividades = await prisma.atividade.findMany({
          where: {
            id_subtarefa: req.params.id
          }
        })

        if (!atividades){
          return res.status(400).json({mensagem: "Nenhuma atividade realizada!"});
        }

        // Retorna os dados obtidos
        return res.status(200).json({result: true, atividades: atividades});
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
        const verificaAtividade = await prisma.atividade.findUnique({
          where: { id: req.params.id }
        });

        if (!verificaAtividade){
            return res.status(400).json({mensagem: "Atividade não Encontrada!"});
        }

        // Verificando se a tarefa existe
        const verificaSubTarefa = await prisma.subTarefa.findUnique({
            where: { id: verificaAtividade.id_subtarefa }
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

        // Verificando se quem está alterando é o gestor do projeto ou um administrador ou o usuário que realizou a atividade
        if (req.session.usuario.id !== verificaAtividade.id_membro){
          if(req.session.usuario.id !== verificaProjeto.id_gestor){
            let encontrou;
            verificaProjeto.ids_administradores.forEach(adm => {
                if (adm === req.session.usuario.id){
                    encontrou = true;
                }
            });

            if (!encontrou){
                return res.status(400).json({ mensagem: "Você não tem permissão para alterar essa Atividade!" });
            }
          }
        }

        // Deletando o anexo
        if (verificaAtividade.anexo){
          deletarAnexo(verificaAtividade.anexo);
        }

        // Deletando possiveis dados que podem atrapalha a atuaalização
        delete req.body.data_realizacao;
        delete req.body.id_subtarefa;

        // Monta a URL da anexo
        const urlAnexo = req.file ? `${req.file.filename}` : null;

        // Ajustando a url do anexo para a inserção no BD
        req.body.anexo = urlAnexo;

        // Deletando dados que podem ser enviados mas não devem ser alterados
        delete req.body.data_realizacao;
        delete req.body.id_subtarefa;

        // Atualizando os dados do projeto
        await prisma.atividade.update({
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
            res.status(400).json({mensagem: "Atividade Não Encontrada!"});
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

// Validado (10/05)
// Deletando a atividade
controller.delete = async function(req, res) {
    try {

        // Verificando se a sessão foi iniciada
        const valSes = validarSessao(req);

        if (!valSes){
            return res.status(400).json({ mensagem: "Sessão não iniciada!" }); 
        }

        // Verificando se a tarefa existe
        const verificaAtividade = await prisma.atividade.findUnique({
          where: { id: req.params.id }
        });

        if (!verificaAtividade){
            return res.status(400).json({mensagem: "Atividade não Encontrada!"});
        }

        // Verificando se a tarefa existe
        const verificaSubTarefa = await prisma.subTarefa.findUnique({
            where: { id: verificaAtividade.id_subtarefa }
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

        // Verifica se o usuário tem permissão para deletar
        if(req.session.usuario.id !== verificaAtividade.id_membro){
          if(req.session.usuario.id !== verificaProjeto.id_gestor){
              let encontrou;
              verificaProjeto.ids_administradores.forEach(adm => {
                  if (adm === req.session.usuario.id){
                      encontrou = true;
                  }
              });

              if (!encontrou){
                  return res.status(400).json({ mensagem: "Você não tem permissão para deletar essa Atividade!" });
              }
          }
        }

        // Deletando o anexo
        if (verificaAtividade.anexo){
          deletarAnexo(verificaAtividade.anexo);
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
            res.status(400).json({mensagem: "Atividade Não Encontrada!"});
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