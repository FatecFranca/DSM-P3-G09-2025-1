import prisma from '../database/client.js';

// Função para validar a sessão
export function validarSessao(req){
    if (req.session.usuario){
        return true;
    }else{
        return false;
    }
}

// Função para ter uma diferença em dias de duas datas, para ver se é necessário enviar uma notificação pela data limite estar próxima
export function diferencaEmDias(data1, data2) {
    const umDiaEmMs = 1000 * 60 * 60 * 24;
    const diffEmMs = new Date(data1) - new Date(data2);
    return Math.floor(diffEmMs / umDiaEmMs);
}

export function converterData(dataFormatar, tipo){
    const data = new Date(dataFormatar)
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    let dataFormatada = '';
    if (tipo === "Hora"){
        dataFormatada = `${dia}/${mes}/${ano} - ${horas}:${minutos} hrs`;
    }else{
        dataFormatada = `${dia}/${mes}/${ano}`;
    }

    return dataFormatada;
}

// Atualizando os status dos projetos, tarefas e subtarefas caso a data de entrega de cada um já esteja vencida
export async function atualizaStatus(){

    // Buscando todos os projetos do gestor
    const projetosTodos = await prisma.projeto.findMany({
        where:{
            status: {
                not: "Concluído"
            }
        }
    });

    for (const projeto of projetosTodos){

        // Se estiver Concluído não fará nada
        if (projeto.status !== "Concluído"){
                
                // Obtendo as tarefas a serem ajustadas
                const tarefasAjustar = await prisma.tarefa.findMany({
                    where: {
                        id_projeto: projeto.id
                    }
                });

                for (const tarefa of tarefasAjustar){

                    // Obtendo as subtarefas a serem ajustadas
                    const subTarefasAjustar = await prisma.subTarefa.findMany({
                        where: {
                            id_tarefa: tarefa.id
                        }
                    });

                    for (const subTarefa of subTarefasAjustar){

                        // Ajustando o status se as datas estivem off
                        if (subTarefa.data_limite < new Date() && (subTarefa.status === "Pendente" || subTarefa.status === "Atrasada")){

                            // Verificando se as notificações já foram enviadas para os usuários necessários 
                            for (const idUsu of subTarefa.ids_membros){
                                const notficacao = await prisma.notificacao.findFirst({
                                    where: {
                                        id_usuario: idUsu,
                                        id_subtarefa: subTarefa.id,
                                        tipo: "Atraso"
                                    }
                                });

                                if (!notficacao){

                                    // Criando a notificação a ser apresentada ao membro da subtarefa
                                    const dataFormatada = converterData(subTarefa.data_limite, 'Normal');

                                    const notifica = {
                                        tipo: "Atraso",
                                        titulo: "Subtarefa Atrasada",
                                        texto: "Há uma subtarefa Atrasada, com praso máximo de entrega para o dia <b>" + dataFormatada + "</b>. Verifique se você pode contribuir para entrega-la o mais rápido possível. \n\nProjeto: <em>" + projeto.titulo + "</em> ➡️ Tarefa: <em>" + tarefa.titulo + "</em> ➡️ Subtarefa: <em><a href='tarefas.html?id=" + projeto.id + "'>" + subTarefa.titulo + "</a></em>",
                                        id_usuario: idUsu,
                                        id_subtarefa: subTarefa.id,
                                        data_criacao: new Date()
                                    }

                                    await prisma.notificacao.create({
                                        data: notifica
                                    });
                                }
                            }

                            for (const idUsu of projeto.ids_administradores){
                                const notficacao = await prisma.notificacao.findFirst({
                                    where: {
                                        id_usuario: idUsu,
                                        id_subtarefa: subTarefa.id,
                                        tipo: "Atraso"
                                    }
                                });

                                if (!notficacao){

                                    // Criando a notificação a ser apresentada ao membro da subtarefa
                                    const dataFormatada = converterData(subTarefa.data_limite, 'Normal');

                                    const notifica = {
                                        tipo: "Atraso",
                                        titulo: "Subtarefa Atrasada",
                                        texto: "Há uma subtarefa Atrasada, com praso máximo de entrega para o dia <b>" + dataFormatada + "</b>. Verifique se você pode contribuir para entrega-la o mais rápido possível. \n\nProjeto: <em>" + projeto.titulo + "</em> ➡️ Tarefa: <em>" + tarefa.titulo + "</em> ➡️ Subtarefa: <em><a href='tarefas.html?id=" + projeto.id + "'>" + subTarefa.titulo + "</a></em>",
                                        id_usuario: idUsu,
                                        id_subtarefa: subTarefa.id,
                                        data_criacao: new Date()
                                    }

                                    await prisma.notificacao.create({
                                        data: notifica
                                    });
                                }
                            }

                            const notficacaoGestor = await prisma.notificacao.findFirst({
                                where: {
                                    id_usuario: projeto.id_gestor,
                                    id_subtarefa: subTarefa.id,
                                    tipo: "Atraso"
                                }
                            });

                            if (!notficacaoGestor){

                                // Criando a notificação a ser apresentada ao membro da subtarefa
                                const dataFormatada = converterData(subTarefa.data_limite, 'Normal');

                                const notifica = {
                                    tipo: "Atraso",
                                    titulo: "Subtarefa Atrasada",
                                    texto: "Há uma subtarefa Atrasada, com praso máximo de entrega para o dia <b>" + dataFormatada + "</b>. Verifique com os Membros do projeto e com os Administradores, a fim de saber qual o motivo do atraso e o que é possível fazer para agilizar a sua entrega. \n\nProjeto: <em>" + projeto.titulo + "</em> ➡️ Tarefa: <em>" + tarefa.titulo + "</em> ➡️ Subtarefa: <em><a href='tarefas.html?id=" + projeto.id + "'>" + subTarefa.titulo + "</a></em>",
                                    id_usuario: projeto.id_gestor,
                                    id_subtarefa: subTarefa.id,
                                    data_criacao: new Date()
                                }

                                await prisma.notificacao.create({
                                    data: notifica
                                });
                            }

                            await prisma.subTarefa.update({
                                where: {
                                    id: subTarefa.id
                                },
                                data:
                                {
                                    status: 'Atrasada'
                                }
                            });


                        }else if (subTarefa.data_limite > new Date() && subTarefa.status === "Atrasada"){

                            await prisma.subTarefa.update({
                                where: {
                                    status: "Atrasada",
                                    id: subTarefa.id
                                },
                                data:
                                {
                                    status: 'Pendente'
                                }
                            });

                            // Deletando as notificações de atraso que não são mais precisas
                            await prisma.notificacao.deleteMany({
                                where: {
                                    id_subtarefa: subTarefa.id
                                }
                            });

                        }

                        // Verificando se os prasos estão curtos para algumas subtarefas, para enviar uma notificação
                        if (subTarefa.status === "Pendente" && subTarefa.data_limite > new Date()){

                            const diasEntrega = diferencaEmDias(subTarefa.data_limite, new Date());

                            if (diasEntrega <= 3){
                                // Verificando se as notificações já foram enviadas para os usuários necessários 
                                for (const idUsu of subTarefa.ids_membros){
                                    const notficacao = await prisma.notificacao.findFirst({
                                        where: {
                                            id_usuario: idUsu,
                                            id_subtarefa: subTarefa.id,
                                            tipo: "Prazo Curto"
                                        }
                                    });

                                    if (!notficacao){

                                        // Criando a notificação a ser apresentada ao novo membro da subtarefa

                                        const notifica = {
                                            tipo: "Prazo Curto",
                                            titulo: "Prazo para a Entrega Curto",
                                            texto: "Há uma subtarefa com o Prazo para a Entrega Curto, com no máximo " + diasEntrega + " dia(s) para entregar. Verifique se você pode contribuir para entrega-la o mais rápido possivel. \n\nProjeto: <em>" + projeto.titulo + "</em> ➡️ Tarefa: <em>" + tarefa.titulo + "</em> ➡️ Subtarefa: <em><a href='tarefas.html?id=" + projeto.id + "'>" + subTarefa.titulo + "</a></em>",
                                            id_usuario: idUsu,
                                            id_subtarefa: subTarefa.id,
                                            data_criacao: new Date()
                                        }

                                        await prisma.notificacao.create({
                                            data: notifica
                                        });
                                    }
                                }

                                for (const idUsu of projeto.ids_administradores){
                                    const notficacao = await prisma.notificacao.findFirst({
                                        where: {
                                            id_usuario: idUsu,
                                            id_subtarefa: subTarefa.id,
                                            tipo: "Prazo Curto"
                                        }
                                    });

                                    if (!notficacao){

                                        // Criando a notificação a ser apresentada ao novo membro da subtarefa

                                        const notifica = {
                                            tipo: "Prazo Curto",
                                            titulo: "Prazo para a Entrega Curto",
                                            texto: "Há uma subtarefa com o Prazo para a Entrega Curto, com no máximo " + diasEntrega + " dia(s) para entregar. Verifique se você pode contribuir para entrega-la o mais rápido possivel. \n\nProjeto: <em>" + projeto.titulo + "</em> ➡️ Tarefa: <em>" + tarefa.titulo + "</em> ➡️ Subtarefa: <em><a href='tarefas.html?id=" + projeto.id + "'>" + subTarefa.titulo + "</a></em>",
                                            id_usuario: idUsu,
                                            id_subtarefa: subTarefa.id,
                                            data_criacao: new Date()
                                        }

                                        await prisma.notificacao.create({
                                            data: notifica
                                        });
                                    }
                                }

                                const notficacao = await prisma.notificacao.findFirst({
                                    where: {
                                        id_usuario: projeto.id_gestor,
                                        id_subtarefa: subTarefa.id,
                                        tipo: "Prazo Curto"
                                    }
                                });

                                if (!notficacao){

                                    // Criando a notificação a ser apresentada ao novo membro da subtarefa

                                    const notifica = {
                                        tipo: "Prazo Curto",
                                        titulo: "Prazo para a Entrega Curto",
                                        texto: "Há uma subtarefa com o Prazo para a Entrega Curto, com no máximo " + diasEntrega + " dia(s) para entregar. Verifique com sua equipe, afim de realiza-la o mais breve possível. \n\nProjeto: <em>" + projeto.titulo + "</em> ➡️ Tarefa: <em>" + tarefa.titulo + "</em> ➡️ Subtarefa: <em><a href='tarefas.html?id=" + projeto.id + "'>" + subTarefa.titulo + "</a></em>",
                                        id_usuario: projeto.id_gestor,
                                        id_subtarefa: subTarefa.id,
                                        data_criacao: new Date()
                                    }

                                    await prisma.notificacao.create({
                                        data: notifica
                                    });
                                }
                            }
                        }
                    }

                    // Ajustando as tarefas caso a data esteja off
                    if (tarefa.data_limite < new Date() && tarefa.status === "Pendente"){
                        await prisma.tarefa.update({
                            where: {
                                status: "Pendente",
                                id: tarefa.id
                            },
                            data:
                            {
                                status: 'Atrasada'
                            }
                        });
                    }else if (tarefa.data_limite > new Date() && tarefa.status === "Atrasada"){
                        await prisma.tarefa.update({
                            where: {
                                status: "Atrasada",
                                id: tarefa.id
                            },
                            data:
                            {
                                status: 'Pendente'
                            }
                        });
                    }
                    
                }

                if (projeto.data_limite < new Date() && projeto.status === "Pendente"){
                    // Ajustando o status do projeto, pela data estar off
                    await prisma.projeto.update({
                        where: {
                            status: "Pendente",
                            id: projeto.id
                        },
                        data:
                        {
                            status: 'Atrasado'
                        }
                    });
                }else if (projeto.data_limite > new Date() && projeto.status === "Atrasado"){
                    // Ajustando o status do projeto, pela data estar off
                    await prisma.projeto.update({
                        where: {
                            status: "Atrasado",
                            id: projeto.id
                        },
                        data:
                        {
                            status: 'Pendente'
                        }
                    });
                }

        }
    }

    return true;
}