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
    const diffEmMs = new Date(data2) - new Date(data1);
    return Math.floor(diffEmMs / umDiaEmMs);
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
                        if (subTarefa.data_limite < new Date() && subTarefa.status === "Pendente"){

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

                                    // Criando a notificação a ser apresentada ao novo membro da subtarefa

                                    const notifica = {
                                        tipo: "Atraso",
                                        titulo: "Subtarefa Atrasada",
                                        texto: "Há uma subtarefa Atrasada. Verifique se você pode contribuir para entrega-la o mais rápido possivel. Projeto: " + projeto.titulo + " => Tarefa: " + tarefa.titulo + " => " + " Subtarefa: " + subTarefa.titulo,
                                        id_usuario: idUsu,
                                        id_subtarefa: subTarefa.id,
                                        data_criacao: new Date()
                                    }

                                    await prisma.notificacao.create({
                                        data: notifica
                                    });
                                }
                            }

                            await prisma.subTarefa.update({
                                where: {
                                    status: "Pendente",
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
                                            texto: "Há uma subtarefa com o Prazo para a Entrega Curto. Verifique se você pode contribuir para entrega-la o mais rápido possivel. Projeto: " + projeto.titulo + " => Tarefa: " + tarefa.titulo + " => " + " Subtarefa: " + subTarefa.titulo,
                                            id_usuario: idUsu,
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

                        // Verificando se os prasos estão currtos para algumas subtarefas, para enviar uma notificação
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
                                            texto: "Há uma subtarefa com o Prazo para a Entrega Curto. Verifique se você pode contribuir para entrega-la o mais rápido possivel. Projeto: " + projeto.titulo + " => Tarefa: " + tarefa.titulo + " => " + " Subtarefa: " + subTarefa.titulo,
                                            id_usuario: idUsu,
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