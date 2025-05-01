import prisma from '../database/client.js';

// Função para validar a sessão
export function validarSessao(req){
    if (req.session.usuario){
        return true;
    }else{
        return false;
    }
}

// Atualizando os status dos projetos, tarefas e subtarefas caso a data de entrega de cada um já esteja vencida
export async function atualizaStatus(req){

    // Buscando todos os projetos do gestor
    const projetosTodos = await prisma.projeto.findMany({
        where: {
            OR: [
                { id_gestor: req.session.usuario.id },
                { ids_administradores: { has: req.session.usuario.id } },
                { ids_membros: { has: req.session.usuario.id } }
            ]
        }
    });

    for (const projeto of projetosTodos){

        // Se estiver Concluído não fará nada
        if (projeto.status !== "Concluído"){

            // Se estiver atrasado mas a data limite foi alterada por algum motivo verifica
            if (projeto.status === "Atrasado"){
                if (projeto.data_limite > new Date()){

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

                            // Ajustando o status se as datas estivem ok
                            if (subTarefa.data_limite > new Date()){
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
                            }
                        }

                        // Ajustando as tarefas caso a data esteja ok
                        if (tarefa.data_limite > new Date()){
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

                    // Ajustando o status do projeto, pela data estar ok
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
            }else if (projeto.status === "Pendente"){
                if (projeto.data_limite < new Date()){

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
                            if (subTarefa.data_limite < new Date()){
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
                            }
                        }

                        // Ajustando as tarefas caso a data esteja off
                        if (tarefa.data_limite < new Date()){
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
                        }
                        
                    }

                    // Ajustando o status do projeto, pela data estar ok
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
                }
            }
        }
    }

    return true;
}