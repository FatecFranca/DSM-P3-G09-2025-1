let dadosProjeto;
let dadosSessao;
const form = document.getElementById("task-form");
let editando = 0; // para saber se estamos editando ou criando
let idTarefaEditar;

document.getElementById("add-task").addEventListener("click", () => {
  abrirFormulario();
});

function formatarDataISOparaBR(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function abrirFormulario() {
  document.getElementById("form-container").style.display = "flex";
  document.getElementById("form-title").innerHTML = "Nova Tarefa";
  document.getElementById("label-anexo").innerHTML = "Anexo da Tarefa";
}

function fecharFormulario() {
  document.getElementById("form-container").style.display = "none";
  form.reset();
  editando = 0;
}

async function editarTarefa(idTarefa) {

  idTarefaEditar = idTarefa;

  const resposta = await fetch('http://localhost:8080/tarefas/' + idTarefa, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  const dados = await resposta.json();

  if (dados.result){
    document.getElementById("form-container").style.display = "flex";
    document.getElementById("form-title").innerHTML = "Editar Tarefa";
    document.getElementById("label-anexo").innerHTML = "Substituir Anexo da Tarefa";
    document.getElementById("titulo").value = dados.tarefa.titulo;
    const data = new Date(dados.tarefa.data_limite);
    const dataFormatada = data.toISOString().split('T')[0];
    document.getElementById("data").value = dataFormatada;
    document.getElementById("descricao").value = dados.tarefa.descricao;
    editando = 1;
  }else{
    alert(dados.mensagem);
  }
  
}

async function alterarTarefa() {
  const titulo = document.getElementById('titulo').value.trim();
  const data = document.getElementById('data').value;
  const descricao = document.getElementById('descricao').value.trim();
  const arquivo = document.getElementById('anexo').files[0];
  const msgAviso = document.getElementById('msgAviso');
  msgAviso.innerHTML = "";

  if (titulo === "") {
    msgAviso.innerHTML = "Preencha o campo Título!";
    return;
  } else if (descricao === "") {
    msgAviso.innerHTML = "Preencha o campo Descrição!";
    return;
  } else if (!data || data === null || undefined) {
    msgAviso.innerHTML = "Preencha o campo Data!";
    return;
  }

  const formData = new FormData();
  formData.append('anexo', arquivo);
  formData.append('titulo', titulo);
  formData.append('descricao', descricao);
  formData.append('data_limite', data);
  formData.append('id_projeto', dadosProjeto.projeto.id);

  const resposta = await fetch('http://localhost:8080/tarefas/' + idTarefaEditar, {
    method: 'PUT',
    credentials: 'include',
    body: formData
  });

  const dados = await resposta.json();

  if (dados.result) {
    alert("Tarefa atualizada com sucesso!");
    window.location.href = "tarefas.html?id=" + dadosProjeto.projeto.id;
  } else {
    msgAviso.innerHTML = dados.mensagem;
  }
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function corStatus(status) {
  if (status === "concluida") return "verde";
  if (status === "pendente") return "azul";
  if (status === "atrasada") return "vermelho";
}

function moverParaCima(botao) {
  const tarefa = botao.closest('.tarefa');
  const anterior = tarefa.previousElementSibling;
  if (anterior) {
    tarefa.parentNode.insertBefore(tarefa, anterior);
  }
}

function moverParaBaixo(botao) {
  const tarefa = botao.closest('.tarefa');
  const proximo = tarefa.nextElementSibling;
  if (proximo) {
    tarefa.parentNode.insertBefore(proximo, tarefa);
  }
}

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

async function baixarAnexoTarefa(nomeArquivo) {
  if (!nomeArquivo) {
    alert("Nenhum anexo disponível para esta tarefa.");
    return;
  }

  const url = `http://localhost:8080/uploads/anexoTarefas/${nomeArquivo}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function carregarDados() {

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
  const idProjeto = urlClass.searchParams.get("id");

  const containerTarefas = document.getElementById('tarefasProjeto');

  const resposta = await fetch('http://localhost:8080/projetos/' + idProjeto, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  dadosProjeto = await resposta.json();

  if (dadosProjeto.result) {

    const dataISO = new Date(dadosProjeto.projeto.data_limite).toISOString().split('T')[0];
    const [ano, mes, dia] = dataISO.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    document.getElementById('nomeProjeto').innerHTML = dadosProjeto.projeto.titulo;
    document.getElementById('dtMaxProj').innerHTML = dataFormatada;
    document.getElementById('descProj').innerHTML = dadosProjeto.projeto.descricao;

    const respostaTarefas = await fetch('http://localhost:8080/tarefas/projeto/' + idProjeto, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    const dadosTarefas = await respostaTarefas.json();
    if (dadosTarefas.result) {
      for (i = 0; i < dadosTarefas.tarefas.length; i++) {
        const tarefa = dadosTarefas.tarefas[i];
        const card = document.createElement("section");

        let data;
        if (tarefa.status === "Concluída"){
          data = tarefa.data_entrega;
        }else{
          data = tarefa.data_limite;
        }

        const dataISO = new Date(data).toISOString().split('T')[0];
        const [ano, mes, dia] = dataISO.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;

        let descDataTarefa;
        let statusTarefa;
        if (tarefa.status === "Concluída"){
          statusTarefa = "verde";
          descDataTarefa = "Entregue em ";
        }else if (tarefa.status === "Atrasada"){
          statusTarefa = "vermelho";
          descDataTarefa = "Data Máxima Entrega: ";
        }else if (tarefa.status === "Pendente"){
          statusTarefa = "azul";
          descDataTarefa = "Data Máxima Entrega: ";
        }

        let exibirAnexo = ``;
        if (tarefa.anexo !== null) {
          exibirAnexo = `<a onclick="baixarAnexoTarefa('${tarefa.anexo}')" class="baixar-anexo">Baixar Anexo</a>`;
        }

        let exibirConcluirEditar = ``;
        if (dadosProjeto.projeto.id_gestor === dadosSessao.dados.id || dadosProjeto.projeto.ids_administradores.includes(dadosSessao.dados.id)){
          if (tarefa.status === "Concluída"){
            exibirConcluirEditar = `<a class="btn-concluir" onclick="statusTarefa('${tarefa.id}', 'Reabrir')">Reabrir</a>&nbsp;<a onclick="editarTarefa('${tarefa.id}')" class="edit-tarefa">Editar</a>&nbsp;<a class="btn-excluir" onclick="excluirTarefa('${tarefa.id}')">Excluir</a>`;
          }else{
            exibirConcluirEditar = `<a class="btn-concluir" onclick="statusTarefa('${tarefa.id}', 'Concluir')">Concluir</a>&nbsp;<a onclick="editarTarefa('${tarefa.id}')" class="edit-tarefa">Editar</a>&nbsp;<a class="btn-excluir" onclick="excluirTarefa('${tarefa.id}')">Excluir</a>`;
          }
        }

        card.className = "categoria";
        card.insertAdjacentHTML('beforeend', `
          <div class="drag"><h2>${tarefa.titulo}</h2><a title="Ordem" style="background-color: rgb(93, 93, 212);">${tarefa.ordem}</a></div>
          <p><b>${descDataTarefa}</b> ${dataFormatada}</p><br>
          <span class="status ${statusTarefa}">${tarefa.status}</span><br><br>
          <p class="descricao">${tarefa.descricao}</p><br>
          <button onclick="addSubTarefa('${tarefa.id}')" class="subTarefa">ADICIONAR SUBTAREFA</button>
          <div class="tarefas">
        `);

        const respostaSubTarefas = await fetch('http://localhost:8080/subtarefas/tarefa/' + tarefa.id, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        const dadosSubTarefas = await respostaSubTarefas.json();
        if (dadosSubTarefas.result) {
          for (b = 0; b < dadosSubTarefas.subtarefas.length; b++) {
            const subtarefa = dadosSubTarefas.subtarefas[i];
            let status;
            let descData;

            if (subtarefa.status === "Concluída"){
              status = "verde";
              descData = "Entregue em ";
            }else if (subtarefa.status === "Atrasada"){
              status = "vermelho";
              descData = "Data Máxima Entrega: "
            }else if (subtarefa.status === "Pendente"){
              status = "azul";
              descDataTarefa = "Data Máxima Entrega: ";
            }

            const dataISO = new Date(subtarefa.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let baixarAnexoSub;
            if (subtarefa.anexo === null){
              baixarAnexoSub = "";
            }else{
              baixarAnexoSub = `<a onclick="baixarAnexoSubTarefa('${subtarefa.anexo}')">Baixar Anexo</a>`;
            }

            card.insertAdjacentHTML('beforeend', `
              <div class="tarefa concluida">
              <div class="drag"><h3>PROTOTIPAÇÃO TELA TAREFAS</h3><a title="Ordem" style="background-color: rgb(93, 93, 212);">${subtarefa.ordem}</a></div>
              <p class="data">${descData}${dataFormatada}</p>
              <p class="descricao">${subtarefa.descricao}</p>
              <span class="status ${status}">${subtarefa.status}</span>
              <div style="margin-top: 10px;"><button onclick="editarSubTarefa('${subtarefa.id}')">Editar</button>${baixarAnexoSub}
              </div>
              <br>
              <button onclick="moverParaCimaSub(${subtarefa.id})" title="Subir">🔼</button><button onclick="moverParaBaixoSub(${subtarefa.id})" title="Descer">🔽</button>
              </div>
            `);

          }
        }
        card.insertAdjacentHTML('beforeend', `
          </div>
          <br><br>
          <div class="btns-tarefa"><div>${exibirConcluirEditar}</div><br><div>${exibirAnexo}&nbsp;<button onclick="moverParaCima('${tarefa.id}')" title="Subir" class="position">🔼</button><button onclick="moverParaBaixo('${tarefa.id}')" title="Descer" class="position">🔽</button></div>
        `);

        containerTarefas.appendChild(card);
      }
    } else {
      alert(dadosTarefas.mensagem);
      return;
    }

  } else {
    window.location.href = "home.html";
  }

}

async function cadastrarTarefa() {

  if (editando === 1){
    alterarTarefa();
    return;
  }

  const titulo = document.getElementById('titulo').value.trim();
  const data = document.getElementById('data').value;
  const descricao = document.getElementById('descricao').value.trim();
  const arquivo = document.getElementById('anexo').files[0];
  const msgAviso = document.getElementById('msgAviso');
  msgAviso.innerHTML = "";

  if (titulo === "") {
    msgAviso.innerHTML = "Preencha o campo Título!";
    return;
  } else if (descricao === "") {
    msgAviso.innerHTML = "Preencha o campo Descrição!";
    return;
  } else if (!data || data === null || undefined) {
    msgAviso.innerHTML = "Preencha o campo Data!";
    return;
  }

  const formData = new FormData();
  formData.append('anexo', arquivo);
  formData.append('titulo', titulo);
  formData.append('descricao', descricao);
  formData.append('data_limite', data);
  formData.append('id_projeto', dadosProjeto.projeto.id);

  const resposta = await fetch('http://localhost:8080/tarefas/', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  const dados = await resposta.json();

  if (dados.result) {
    alert("Tarefa criada com sucesso!");
    window.location.href = "tarefas.html?id=" + dadosProjeto.projeto.id;
  } else {
    msgAviso.innerHTML = dados.mensagem;
  }

}

async function statusTarefa(idTarefa, tipoAlteracao) {

  if (!confirm(`Deseja realmente ${tipoAlteracao} essa tarefa?`)){
    return;
  }
  
  const resposta = await fetch('http://localhost:8080/tarefas/updateStatus/' + idTarefa, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo_alteracao: tipoAlteracao })
  });

  const dados = await resposta.json();

  if (dados.result) {
    if (tipoAlteracao === "Concluir"){
      alert("Tarefa concluida com sucesso!");
    }else if (tipoAlteracao === "Reabrir"){
      alert("Tarefa reaberta com sucesso!");
    }
  
    window.location.href = "tarefas.html?id=" + dadosProjeto.projeto.id;
  } else {
    alert(dados.mensagem);
  }

}