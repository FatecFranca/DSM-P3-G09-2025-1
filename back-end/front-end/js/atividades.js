let idSubtarefa;
let dadosSessao;
let idAtividadeEditar;
let editandoAt = 0;

document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const form = document.getElementById('form-atividade');
    const addBtn = document.querySelector('.add-btn');
    const cancelarBtn = document.querySelector('.btn-cancelar');

    // Abrir formulário para nova atividade
    addBtn.addEventListener('click', () => {
        document.getElementById("tituloForm").innerHTML = "Nova Atividade";
        document.getElementById("label-anexo").innerHTML = "Anexo da Atividade (opcional)";
        editandoAt = 0;
        form.reset();
        formContainer.style.display = 'flex';
    });

    // Cancelar
    cancelarBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        form.reset();
        editandoAt = 0;
    });

});

async function encerrarSessao() {

  if (!confirm("Deseja realmente sair?")) {
    return;
  }

  const resposta = await fetch('http://localhost:8080/usuarios/encerrarSessao/true', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  const dados = await resposta.json();
  if (dados.result) {
    window.location.href = "login.html";
  }
}

async function baixarAnexo(anexo){
    if (!anexo) {
        alert("Nenhum anexo disponível para esta tarefa.");
        return;
    }

    const url = `http://localhost:8080/uploads/anexoTarefas/${anexo}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = anexo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function carregarAtividades() {
    const dadosUsuario = await fetch('http://localhost:8080/usuarios/verificaSessao/true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    dadosSessao = await dadosUsuario.json();

    if (!dadosSessao.result) {
        return window.location.href = "login.html";
    }

    const urlAtual = window.location.href;
    const urlClass = new URL(urlAtual);
    idSubtarefa = urlClass.searchParams.get("id");

    const buscarAtividades = await fetch('http://localhost:8080/atividades/subtarefa/' + idSubtarefa, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    const atividades = await buscarAtividades.json();

    if (atividades.result){
        const buscarSubtarefa = await fetch('http://localhost:8080/subtarefas/' + idSubtarefa, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const dadosSubtarefa = await buscarSubtarefa.json();

        const buscarTarefa = await fetch('http://localhost:8080/tarefas/' + dadosSubtarefa.subtarefa.id_tarefa, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const dadosTarefa = await buscarTarefa.json();

        const buscarProjeto = await fetch('http://localhost:8080/projetos/' + dadosTarefa.tarefa.id_projeto, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const dadosProjeto = await buscarProjeto.json();

        const containerAtividades = document.getElementById('atividades');

        const dataISO = new Date(dadosSubtarefa.subtarefa.data_limite).toISOString().split('T')[0];
        const [ano, mes, dia] = dataISO.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;

        document.getElementById('nomeSubtarefa').innerHTML =  dadosSubtarefa.subtarefa.titulo;
        document.getElementById('descSubtarefa').innerHTML =  dadosSubtarefa.subtarefa.descricao;
        document.getElementById('dtMaxSub').innerHTML =  dataFormatada;
        

        for(i = 0; atividades.atividades.length; i++){
            const atividade = atividades.atividades[i];
            const card = document.createElement("li");

            // Dat formatada
            const data = new Date(atividade.data_realizacao)
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();

            const horas = String(data.getHours()).padStart(2, '0');
            const minutos = String(data.getMinutes()).padStart(2, '0');

            const dataFormatada = `${dia}/${mes}/${ano} - ${horas}:${minutos} hrs`;
            
            const buscarUsuarios = await fetch('http://localhost:8080/usuarios/' + atividade.id_membro, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const dadosUsuario = await buscarUsuarios.json();

            let inAnexo = "";
            if(atividade.anexo !== null){
                inAnexo = `<a class="download" title="Baixar Anexo" onclick="baixarAnexo('${atividade.anexo}')">&#8681;</a>`;
            }

            let botoes = "";
            if ((atividade.id_membro === dadosSessao.dados.id || dadosProjeto.projeto.id_gestor === dadosSessao.dados.id || dadosProjeto.projeto.ids_administradores.includes(dadosSessao.dados.id)) && (dadosProjeto.projeto.status !== "Concluído") && (dadosTarefa.tarefa.status !== "Concluída") && (dadosSubtarefa.subtarefa.status !== "Concluída")) {
                botoes = `
                    <a class="editar" title="Editar" onclick="editarAtividade('${atividade.id}')">&#9998;</a>
                    <a class="editar" title="Excluir" onclick="excluirAtividade('${atividade.id}')">🗙</a>
                `;
            }else if((dadosProjeto.projeto.id_gestor !== dadosSessao.dados.id || !dadosProjeto.projeto.ids_administradores.includes(dadosSessao.dados.id) || !dadosSubtarefa.subtarefa.ids_membros.includes(dadosSessao.dados.id)) || (dadosProjeto.projeto.status === "Concluído") || (dadosTarefa.tarefa.status === "Concluída") || (dadosSubtarefa.subtarefa.status === "Concluída")){
                document.getElementById('add-btn').style.display = "none";
            }
            
            card.innerHTML = `
                <div class="descricao">
                    <strong>${atividade.descricao}</strong>
                    ${botoes}
                    <p class="detalhes">${dataFormatada}<br>Por: ${dadosUsuario.nome}</p>
                </div>
                ${inAnexo}
            `;

            containerAtividades.appendChild(card);
        }
    }else{
        alert(atividades.mensagem);
    }
}

async function criarAtividade() {

    if (editandoAt === 1){
        alterarAtividade();
        return;
    }

    const descricao = document.getElementById('descricao').value.trim();
    const anexo = document.getElementById('anexo').files[0];
    let msgAviso =  document.getElementById('msgAviso');
    msgAviso.innerHTML = "";

    if (descricao === ""){
        msgAviso.innerHTML = "Descreva a atividade realizada!";
        return;
    }

    const formData = new FormData();
    formData.append('anexo', anexo);
    formData.append('descricao', descricao);
    formData.append('id_subtarefa', idSubtarefa);

    const criarAtividade = await fetch('http://localhost:8080/atividades/', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    const dadosCriacao = await criarAtividade.json();

    if (dadosCriacao.result){
        alert("Atividade registrada com sucesso!");
        window.location.reload();
        return;
    }else{
        alert(dadosCriacao.mensagem);
        return;
    }
}

async function excluirAtividade(idAtividade) {
    if (!confirm('Deseja realmente excluir essa atividade?')) {
        return;
    }

    const resposta = await fetch('http://localhost:8080/atividades/' + idAtividade, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const dados = await resposta.json();

    if (dados.result) {
        alert('Atividade excluída com sucesso!');
        window.location.reload();
        return;
    } else {
        alert('Erro: ' + dados.mensagem);
        return;
    }
}

async function editarAtividade(idAtividade) {
    idAtividadeEditar = idAtividade;

    const resposta = await fetch('http://localhost:8080/atividades/' + idAtividade, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const dados = await resposta.json();

    if (dados.result) {
        document.getElementById("form-container").style.display = 'flex';
        document.getElementById("idAtividadeEditar").value = idAtividade;
        document.getElementById("tituloForm").innerHTML = "Alterar Atividade";
        document.getElementById("label-anexo").innerHTML = "Substituir Anexo da Atividade";
        document.getElementById("descricao").value = dados.atividade.descricao;
        editandoAt = 1;
    } else {
        alert(dados.mensagem);
    }
}

async function alterarAtividade() {
    const descricao = document.getElementById('descricao').value.trim();
    const anexo = document.getElementById('anexo').files[0];
    const msgAviso = document.getElementById('msgAviso');
    msgAviso.innerHTML = "";

    if (descricao === "") {
        msgAviso.innerHTML = "Descreva a atividade realizada!";
        return;
    }

    const formData = new FormData();
    formData.append('anexo', anexo);
    formData.append('descricao', descricao);

    const resposta = await fetch('http://localhost:8080/atividades/' + idAtividadeEditar, {
        method: 'PUT',
        credentials: 'include',
        body: formData
    });

    const dados = await resposta.json();

    if (dados.result) {
        alert("Atividade atualizada com sucesso!");
        window.location.reload();
    } else {
        msgAviso.innerHTML = dados.mensagem;
    }
}