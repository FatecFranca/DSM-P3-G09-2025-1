document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const form = document.getElementById('form-atividade');
    const addBtn = document.querySelector('.add-btn');
    const cancelarBtn = document.querySelector('.btn-cancelar');

    let editandoIndex = null;

    // Abrir formulário para nova atividade
    addBtn.addEventListener('click', () => {
        editandoIndex = null;
        form.reset();
        formContainer.style.display = 'flex';
    });

    // Cancelar
    cancelarBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        form.reset();
        editandoIndex = null;
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

async function carrgearAtividades() {
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
    const idSubarefa = urlClass.searchParams.get("id");

    const buscarAtividades = await fetch('http://localhost:8080/atividades/tarefa/' + idSubarefa, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    const atividades = await buscarAtividades.json();

    if (atividades.result){

        const buscarSubtarefa = await fetch('http://localhost:8080/subtarefas/' + idSubarefa, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const dadosSubtarefa = await buscarSubtarefa.json();

        const containerAtividades = document.getElementById('atividades');

        alert(dadosSubtarefa.titulo);

        document.getElementById('nomeSubtarefa').innerHTML =  dadosSubtarefa.titulo;
        document.getElementById('descSubtarefa').innerHTML =  dadosSubtarefa.descricao;
        

        for(i=0; atividades.atividades.length; i++){
            const atividade = atividades.atividades[i];
            const card = document.createElement("li");
            card.className = "atividades";

            // Dat formatada
            const dia = String(atividade.data_realizacao.getDate()).padStart(2, '0');
            const mes = String(atividade.data_realizacao.getMonth() + 1).padStart(2, '0');
            const ano = atividade.data_realizacao.getFullYear();

            const horas = String(atividade.data_realizacao.getHours()).padStart(2, '0');
            const minutos = String(atividade.data_realizacao.getMinutes()).padStart(2, '0');

            const dataFormatada = `${dia}/${mes}/${ano} - ${horas}:${minutos} hrs`;

            const buscarUsuarios = await fetch('http://localhost:8080/usuarios/' + atividade.id_membro, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const dadosUsuario = await buscarUsuarios.json();

            card.insertAdjacentHTML('beforeend', `
                <div class="descricao">
                    <strong>${atividade.descricao}</strong>
                    <button class="editar" onclick="editarAtividade('${atividade.id}')">&#9998;</button>
                    <p class="detalhes">${dataFormatada}<br>Por: ${dadosUsuario.nome}</p>
                </div>
                <a class="download" title="Baixar Anexo" onclick="baixarAnexo('${atividade.anexo}')">&#8681;</a>
            `);
        }

        containerAtividades.appendChild(card);
    }
}

async function criarAtividade() {

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

    const criarAtividade = await fetch('http://localhost:8080/atividades/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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