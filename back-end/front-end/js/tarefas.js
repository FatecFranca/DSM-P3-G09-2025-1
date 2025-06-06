// Variáveis a guardar dados a serem usados posteriormente
let dadosProjeto;
let dadosSessao;
const form = document.getElementById("task-form");
const formSub = document.getElementById("sub-form");
let editando = 0; 
let editandoSub = 0;
let idTarefaEditar;
let idSubTarefaEditar;

// Tarefas e Subtarefas

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
        card.id = tarefa.id;

        let data;
        if (tarefa.status === "Concluída") {
          data = tarefa.data_entrega;
        } else {
          data = tarefa.data_limite;
        }

        const dataISO = new Date(data).toISOString().split('T')[0];
        const [ano, mes, dia] = dataISO.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;

        let descDataTarefa;
        let statusTarefa;
        if (tarefa.status === "Concluída") {
          statusTarefa = "verde";
          descDataTarefa = "Entregue em ";
        } else if (tarefa.status === "Atrasada") {
          statusTarefa = "vermelho";
          descDataTarefa = "Data Máxima Entrega: ";
        } else if (tarefa.status === "Pendente") {
          statusTarefa = "laranja";
          descDataTarefa = "Data Máxima Entrega: ";
        }

        let exibirAnexo = ``;
        if (tarefa.anexo !== null) {
          exibirAnexo = `<a onclick="baixarAnexoTarefa('${tarefa.anexo}')" class="baixar-anexo">Baixar Anexo</a>`;
        }

        let exibirConcluirEditar = ``;
        let exibirMudarOrdem = ``;
        let btnAddSubTarefa = ``;
        if ((dadosProjeto.projeto.id_gestor === dadosSessao.dados.id || dadosProjeto.projeto.ids_administradores.includes(dadosSessao.dados.id)) && (dadosProjeto.projeto.status !== "Concluído")) {
          if (tarefa.status === "Concluída") {
            exibirConcluirEditar = `<a class="btn-reabrir" onclick="statusTarefa('${tarefa.id}', 'Reabrir')">Reabrir</a>`;
            exibirMudarOrdem = `<button onclick="moverParaCima('${tarefa.id}')" title="Subir" class="position">🔼</button><button onclick="moverParaBaixo('${tarefa.id}')" title="Descer" class="position">🔽</button>`;
          } else {
            exibirConcluirEditar = `<a class="btn-concluir" onclick="statusTarefa('${tarefa.id}', 'Concluir')">Concluir</a>&nbsp;<a onclick="editarTarefa('${tarefa.id}')" class="edit-tarefa">Editar</a>&nbsp;<a class="btn-excluir" onclick="excluirTarefa('${tarefa.id}')">Excluir</a>`;
            exibirMudarOrdem = `<button onclick="moverParaCima('${tarefa.id}')" title="Subir" class="position">🔼</button><button onclick="moverParaBaixo('${tarefa.id}')" title="Descer" class="position">🔽</button>`;
            btnAddSubTarefa = `<button onclick="abrirFormularioSubTarefa('${tarefa.id}')" class="subTarefa">ADICIONAR SUBTAREFA</button>`;
          }
        }else{
          document.getElementById('add-task').style.display = "none";
        }
        
        let tarefasFinal = '';
        card.className = "categoria";
        tarefasFinal += `
          <div class="drag"><h2>${tarefa.titulo}</h2><a title="Ordem" style="background-color: rgb(93, 93, 212);">${tarefa.ordem}</a></div>
          <p><b>${descDataTarefa}</b> ${dataFormatada}</p><br>
          <span class="status ${statusTarefa}">${tarefa.status}</span><br><br>
          <p class="descricao">${tarefa.descricao}</p><br>
          ${btnAddSubTarefa}
          <div class="tarefas">
        `;

        const respostaSubTarefas = await fetch('http://localhost:8080/subtarefas/tarefa/' + tarefa.id, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        const dadosSubTarefas = await respostaSubTarefas.json();
        if (dadosSubTarefas.result) {
          for (b = 0; b < dadosSubTarefas.subtarefas.length; b++) {
            const subtarefa = dadosSubTarefas.subtarefas[b];
            let status = '';
            let descDataSub = '';
            let exibirConcluirEditarSub = '';
            let exibirMudarOrdemSub = '';
            let exibirMembrosSub = '';

            if (subtarefa.status === "Concluída") {
              status = "verde";
              descDataSub = "Entregue em ";
            } else if (subtarefa.status === "Atrasada") {
              status = "vermelho";
              descDataSub = "Data Máxima Entrega: "
            } else if (subtarefa.status === "Pendente") {
              status = "laranja";
              descDataSub = "Data Máxima Entrega: ";
            }

            const dataISO = new Date(subtarefa.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let baixarAnexoSub;
            if (subtarefa.anexo === null) {
              baixarAnexoSub = "";
            } else {
              baixarAnexoSub = `<a onclick="baixarAnexoSubTarefa('${subtarefa.anexo}')" class="baixar-anexo">Baixar Anexo</a>`;
            }

            if ((dadosProjeto.projeto.id_gestor === dadosSessao.dados.id || dadosProjeto.projeto.ids_administradores.includes(dadosSessao.dados.id)) && (dadosProjeto.projeto.status !== "Concluído") && (tarefa.status !== "Concluída")) {
              if (subtarefa.status === "Concluída") {
                exibirConcluirEditarSub = `<label class="btn-reabrir" onclick="statusSubTarefa('${subtarefa.id}', 'Reabrir')">Reabrir</label>`;
                exibirMudarOrdem = `<button onclick="moverParaCimaSub('${subtarefa.id}')" title="Subir" class="position">🔼</button><button onclick="moverParaBaixoSub('${subtarefa.id}')" title="Descer" class="position">🔽</button>`;
              } else {
                exibirConcluirEditarSub = `<label class="btn-concluir" onclick="statusSubTarefa('${subtarefa.id}', 'Concluir')">Concluir</label>&nbsp;<button onclick="editarSubTarefa('${subtarefa.id}')" class="edit-subTarefa">Editar</button>&nbsp;<label class="btn-excluir" onclick="excluirSubTarefa('${subtarefa.id}')">Excluir</label>`;
                exibirMembrosSub = `<button onclick="membrosSubtatrefa('${subtarefa.id}')" title="Gerenciar Membros" class="position">👤</button>`;
                exibirMudarOrdemSub = `<button onclick="moverParaCimaSub('${subtarefa.id}')" title="Subir" class="position">🔼</button><button onclick="moverParaBaixoSub('${subtarefa.id}')" title="Descer" class="position">🔽</button>`;
              }
            }else{
              document.getElementById('add-task').style.display = "none";
            }
            

            tarefasFinal += `
              <div class="tarefa concluida" id=${subtarefa.id}>
              <div class="drag"><h3 onclick="window.location.href='atividades.html?id=${subtarefa.id}'"><u>${subtarefa.titulo}</u></h3><a title="Ordem" style="background-color: rgb(93, 93, 212);">${subtarefa.ordem}</a></div>
              <br>
              <p class="data">${descDataSub}${dataFormatada}</p>
              <br>
              <span class="status ${status}">${subtarefa.status}</span>
              <br><br>
              <p class="descricao">${subtarefa.descricao}</p>
              <div class="btns-subTarefa"><div>${exibirConcluirEditarSub}</div><br><div>${baixarAnexoSub}&nbsp;${exibirMembrosSub}</div><br><div>${exibirMudarOrdemSub}</div>
              </div></div>
            `;

          }
        }

        tarefasFinal += `
          </div>
          <br><br>
          <div class="btns-tarefa"><div>${exibirConcluirEditar}</div><br><div>${exibirAnexo}&nbsp;${exibirMudarOrdem}</div>
        `;

        card.insertAdjacentHTML('beforeend', tarefasFinal);

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

// Tarefas

document.getElementById("add-task").addEventListener("click", () => {
  abrirFormulario();
});

function abrirFormulario() {
  if ((dadosProjeto.projeto.id_gestor === dadosSessao.dados.id || dadosProjeto.projeto.ids_administradores.includes(dadosSessao.dados.id)) && (dadosProjeto.projeto.status !== "Concluído")) {
    document.getElementById("form-container").style.display = "flex";
    document.getElementById("form-title").innerHTML = "Nova Tarefa";
    document.getElementById("label-anexo").innerHTML = "Anexo da Tarefa";
  }
}

function fecharFormulario() {
  document.getElementById("form-container").style.display = "none";
  form.reset();
  editando = 0;
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

async function editarTarefa(idTarefa) {

  idTarefaEditar = idTarefa;

  const resposta = await fetch('http://localhost:8080/tarefas/' + idTarefa, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  const dados = await resposta.json();

  if (dados.result) {
    document.getElementById("form-container").style.display = "flex";
    document.getElementById("form-title").innerHTML = "Editar Tarefa";
    document.getElementById("label-anexo").innerHTML = "Substituir Anexo da Tarefa";
    document.getElementById("titulo").value = dados.tarefa.titulo;
    const data = new Date(dados.tarefa.data_limite);
    const dataFormatada = data.toISOString().split('T')[0];
    document.getElementById("data").value = dataFormatada;
    document.getElementById("descricao").value = dados.tarefa.descricao;
    editando = 1;
  } else {
    alert(dados.mensagem);
  }

}

async function moverParaCima(idTarefa) {

  const tarefaAtual = document.getElementById(idTarefa);
  const tarefaAnterior = tarefaAtual.previousElementSibling;

  if (!tarefaAnterior) return;

  const resposta = await fetch('http://localhost:8080/tarefas/updateOrdem/' + idTarefa, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'antecipar' })
  });

  const dados = await resposta.json();

  if (!dados.result) {
    return alert(dados.mensagem);
  }

  // Troca no DOM
  tarefaAtual.parentNode.insertBefore(tarefaAtual, tarefaAnterior);
  return;
}

async function moverParaBaixo(idTarefa) {

  const tarefaAtual = document.getElementById(idTarefa);
  const tarefaPosterior = tarefaAtual.nextElementSibling;

  if (!tarefaPosterior) return;

  const resposta = await fetch('http://localhost:8080/tarefas/updateOrdem/' + idTarefa, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'regredir' })
  });

  const dados = await resposta.json();

  if (!dados.result) {
    return alert(dados.mensagem);
  }

  // Troca no DOM
  tarefaPosterior.parentNode.insertBefore(tarefaPosterior, tarefaAtual);
  return;
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

async function cadastrarTarefa() {

  if (editando === 1) {
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
    document.getElementById("titulo").focus();
    return;
  } else if (!data || data === null || undefined) {
    msgAviso.innerHTML = "Preencha o campo Data!";
    return;
  } else if (descricao === "") {
    msgAviso.innerHTML = "Preencha o campo Descrição!";
    document.getElementById("descricao").focus();
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

  if (!confirm(`Deseja realmente ${tipoAlteracao} essa tarefa?`)) {
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
    if (tipoAlteracao === "Concluir") {
      alert("Tarefa concluida com sucesso!");
    } else if (tipoAlteracao === "Reabrir") {
      alert("Tarefa reaberta com sucesso!");
    }

    window.location.reload();
  } else {
    alert(dados.mensagem);
  }

}

async function excluirTarefa(idTarefa) {
  if (!confirm('Deseja realmente excluir essa tarefa?')) {
    return;
  }

  const resposta = await fetch('http://localhost:8080/tarefas/' + idTarefa, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  const dados = await resposta.json();

  if (dados.result) {
    alert('Tarefa excluída com sucesso!');
    window.location.reload();
    return;
  } else {
    alert('Erro: ' + dados.mensagem);
    return;
  }
}

// Subtarefas

function abrirFormularioSubTarefa(idTarefa){
  if ((dadosProjeto.projeto.id_gestor === dadosSessao.dados.id || dadosProjeto.projeto.ids_administradores.includes(dadosSessao.dados.id)) && (dadosProjeto.projeto.status !== "Concluído")) {
    document.getElementById("form-subtarefa").style.display = "flex";
    document.getElementById("sub-title").innerHTML = "Nova Subtarefa";
    document.getElementById("label-anexo").innerHTML = "Anexo da Subtarefa";
    document.getElementById("id-tarefa").value = idTarefa;
  }
}

function fecharFormularioSub(){
  document.getElementById("form-subtarefa").style.display = "none";
  formSub.reset();
  editandoSub = 0;
}

async function cadastrarSubtarefa(){
  const id_tarefa = document.getElementById("id-tarefa").value;
  
  if (editandoSub === 1) {
    alterarSubTarefa();
    return;
  }

  const titulo = document.getElementById('tituloSub').value.trim();
  const data = document.getElementById('dataSub').value;
  const descricao = document.getElementById('descricaoSub').value.trim();
  const arquivo = document.getElementById('anexoSub').files[0];
  const msgAviso = document.getElementById('msgAvisoSub');
  msgAviso.innerHTML = "";

  if (titulo === "") {
    msgAviso.innerHTML = "Preencha o campo Título!";
    document.getElementById("tituloSub").focus();
    return;
  } else if (!data || data === null || undefined) {
    msgAviso.innerHTML = "Preencha o campo Data!";
    return;
  } else if (descricao === "") {
    msgAviso.innerHTML = "Preencha o campo Descrição!";
    document.getElementById("descricaoSub").focus();
    return;
  }

  const formData = new FormData();
  formData.append('anexoSub', arquivo);
  formData.append('titulo', titulo);
  formData.append('descricao', descricao);
  formData.append('data_limite', data);
  formData.append('id_tarefa', id_tarefa);

  const resposta = await fetch('http://localhost:8080/subtarefas/', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  const dados = await resposta.json();

  if (dados.result) {
    alert("Subtarefa criada com sucesso!");
    window.location.reload();
  } else {
    msgAviso.innerHTML = dados.mensagem;
  }

}

async function statusSubTarefa(idSubTarefa, tipoAlteracao) {

  if (!confirm(`Deseja realmente ${tipoAlteracao} essa tarefa?`)) {
    return;
  }

  const resposta = await fetch('http://localhost:8080/subtarefas/updateStatus/' + idSubTarefa, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo_alteracao: tipoAlteracao })
  });

  const dados = await resposta.json();

  if (dados.result) {
    if (tipoAlteracao === "Concluir") {
      alert("Subtarefa concluida com sucesso!");
    } else if (tipoAlteracao === "Reabrir") {
      alert("Subtarefa reaberta com sucesso!");
    }

    window.location.reload();
  } else {
    alert(dados.mensagem);
  }

}

async function excluirSubTarefa(idSubTarefa) {
  if (!confirm('Deseja realmente excluir essa subtarefa?')) {
    return;
  }

  const resposta = await fetch('http://localhost:8080/subtarefas/' + idSubTarefa, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  const dados = await resposta.json();

  if (dados.result) {
    alert('Subtarefa excluída com sucesso!');
    window.location.reload();
    return;
  } else {
    alert('Erro: ' + dados.mensagem);
    return;
  }
}

async function moverParaCimaSub(idSubTarefa) {

  const tarefaSubAtual = document.getElementById(idSubTarefa);
  const tarefaSubAnterior = tarefaSubAtual.previousElementSibling;

  if (!tarefaSubAnterior) return;

  const resposta = await fetch('http://localhost:8080/subtarefas/updateOrdem/' + idSubTarefa, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'antecipar' })
  });

  const dados = await resposta.json();

  if (!dados.result) {
    return alert(dados.mensagem);
  }

  // Troca no DOM
  tarefaSubAtual.parentNode.insertBefore(tarefaSubAtual, tarefaSubAnterior);
  return;
}

async function moverParaBaixoSub(idSubTarefa) {

  const tarefaSubAtual = document.getElementById(idSubTarefa);
  const tarefaSubPosterior = tarefaSubAtual.nextElementSibling;

  if (!tarefaSubPosterior) return;

  const resposta = await fetch('http://localhost:8080/subtarefas/updateOrdem/' + idSubTarefa, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'regredir' })
  });

  const dados = await resposta.json();

  if (!dados.result) {
    return alert(dados.mensagem);
  }

  // Troca no DOM
  tarefaSubPosterior.parentNode.insertBefore(tarefaSubPosterior, tarefaSubAtual);
  return;
}

async function baixarAnexoSubTarefa(nomeArquivo) {
  if (!nomeArquivo) {
    alert("Nenhum anexo disponível para esta subtarefa.");
    return;
  }

  const url = `http://localhost:8080/uploads/anexoSubTarefas/${nomeArquivo}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function alterarSubTarefa() {
  const titulo = document.getElementById('tituloSub').value.trim();
  const data = document.getElementById('dataSub').value;
  const descricao = document.getElementById('descricaoSub').value.trim();
  const arquivo = document.getElementById('anexoSub').files[0];
  const msgAviso = document.getElementById('msgAvisoSub');
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
  formData.append('anexoSub', arquivo);
  formData.append('titulo', titulo);
  formData.append('descricao', descricao);
  formData.append('data_limite', data);
  formData.append('id_tarefa', idSubTarefaEditar);

  const resposta = await fetch('http://localhost:8080/subtarefas/' + idSubTarefaEditar, {
    method: 'PUT',
    credentials: 'include',
    body: formData
  });

  const dados = await resposta.json();

  if (dados.result) {
    alert("Subtarefa atualizada com sucesso!");
    window.location.reload();
  } else {
    msgAviso.innerHTML = dados.mensagem;
  }
}

async function editarSubTarefa(idSubTarefa) {

  idSubTarefaEditar = idSubTarefa;

  const resposta = await fetch('http://localhost:8080/subtarefas/' + idSubTarefa, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  const dados = await resposta.json();

  if (dados.result) {
    document.getElementById("form-subtarefa").style.display = "flex";
    document.getElementById("sub-title").innerHTML = "Editar Subtarefa";
    document.getElementById("label-anexoSub").innerHTML = "Substituir Anexo da Subtarefa";
    document.getElementById("tituloSub").value = dados.subtarefa.titulo;
    const data = new Date(dados.subtarefa.data_limite);
    const dataFormatada = data.toISOString().split('T')[0];
    document.getElementById("dataSub").value = dataFormatada;
    document.getElementById("descricaoSub").value = dados.subtarefa.descricao;
    editandoSub = 1;
  } else {
    alert(dados.mensagem);
  }

}

async function membrosSubtatrefa(idSubtarefa){
  document.getElementById('membrosPopup').style.display = "flex";

  const listaMembrosSubTarefa = document.getElementById("listaMembrosSubTarefa");
  listaMembrosSubTarefa.innerHTML = "";

  const buscarSubtarefa = await fetch('http://localhost:8080/subtarefas/' + idSubtarefa, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
  });

  const subtarefa = await buscarSubtarefa.json();

  if (subtarefa.result) {

      if (subtarefa.membros.length === 0) {
          listaMembrosSubTarefa.innerHTML = "<p class='nadaEncontrado'>Nenhum membro adicionado a esta subtarefa</p>";
      }

      for (let i = 0; i < subtarefa.membros.length; i++) {

          const membro = subtarefa.membros[i];
          const card = document.createElement("div");

          card.innerHTML = `
              <a class="descricao">${membro.nome}</a><img src="img/icones/x-deletar.png" class="btn-excluir-membro" title="Excluir Membro" onclick="removerMembro('${membro.id}', '${subtarefa.subtarefa.id}')">
          `;
          listaMembrosSubTarefa.appendChild(card);
      }
  }

  const listaMembrosProjeto = document.getElementById("listaMembrosProjeto");
  listaMembrosProjeto.innerHTML = "";

    const buscarProjeto = await fetch('http://localhost:8080/projetos/' + dadosProjeto.projeto.id, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const projeto = await buscarProjeto.json();

    if (projeto.result) {

        let contMembros = 0;
        for (let i = 0; i < projeto.membros.length; i++) {
          const membro = projeto.membros[i];

          if (!subtarefa.subtarefa.ids_membros.includes(membro.id)){
            const card = document.createElement("div");

            card.innerHTML = `
                <a class="descricao">${membro.nome}</a><label class="btn-excluir-membro" title="Incluir na Subtarefa" onclick="incluirMembro('${membro.id}', '${subtarefa.subtarefa.id}')">✅</label>
            `;
            listaMembrosProjeto.appendChild(card);
            contMembros += 1;
          }

        }

        if (contMembros === 0) {
            listaMembrosProjeto.innerHTML = "<p class='nadaEncontrado'>Sem membros a serem adicionados nessa subtarefa</p>";
        }
    }
}

function fecharPopupMembros(){
  document.getElementById('membrosPopup').style.display = "none";
}

async function incluirMembro(idMembro, idSubtarefa) {
  const resposta = await fetch('http://localhost:8080/subtarefas/addMembro/' + idSubtarefa, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_membro: idMembro })
  });

  const dados = await resposta.json();

  if (dados.result) {
    alert("Membro adicionado a subtarefa!");
    window.location.reload();
  } else {
    alert(dados.mensagem);
  }
}

async function removerMembro(idMembro, idSubtarefa) {
  const resposta = await fetch('http://localhost:8080/subtarefas/removeMembro/' + idSubtarefa, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_membro: idMembro })
  });

  const dados = await resposta.json();

  if (dados.result) {
    alert("Membro removido da subtarefa!");
    window.location.reload();
  } else {
    alert(dados.mensagem);
  }
}