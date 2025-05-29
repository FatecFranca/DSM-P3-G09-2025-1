let dadosProjeto;

document.getElementById("add-task").addEventListener("click", () => {
  abrirFormulario();
});

function formatarDataISOparaBR(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

const form = document.getElementById("task-form");
let editando = null; // para saber se estamos editando ou criando

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const data = document.getElementById("data").value;
  const status = document.getElementById("status").value;
  const descricao = document.getElementById("descricao").value;
  const arquivoInput = document.getElementById("arquivo");
  const arquivo = arquivoInput.files[0];

  const tarefa = {
    titulo,
    data,
    status,
    descricao,
    arquivo: arquivo ? URL.createObjectURL(arquivo) : null,
    nomeArquivo: arquivo ? arquivo.name : null
  };

  if (editando) {
    atualizarTarefa(editando, tarefa);
    editando = null;
  } else {
    adicionarTarefa(tarefa);
  }

  form.reset();
  fecharFormulario();
});

function abrirFormulario() {
  document.getElementById("form-container").style.display = "flex";
}


function fecharFormulario() {
  document.getElementById("form-container").style.display = "none";
  form.reset();
  editando = null;
}

function adicionarTarefa(tarefa) {
  const container = document.querySelector(".categoria .tarefas");

  const div = document.createElement("div");
  div.className = `tarefa ${tarefa.status}`;

  div.innerHTML = `
    <div class="drag"></div>
    <div class="botoes-ordenacao">
      <button title="Subir" onclick="moverParaCima(this)">🔼</button>
      <button title="Descer" onclick="moverParaBaixo(this)">🔽</button>
    </div>
    <h3>${tarefa.titulo}</h3>
    <p class="data">
      ${tarefa.status === "concluida" ? "Entregue em" : "Data máxima para entrega"} 
      ${formatarDataISOparaBR(tarefa.data)}
    </p>
    <p class="descricao">${tarefa.descricao}</p>
    <span class="status ${corStatus(tarefa.status)}">${capitalizar(tarefa.status)}</span>
    <div style="margin-top: 10px;">
      <button onclick="editarTarefa(this)">Editar</button>
      ${tarefa.arquivo ? `<a href="${tarefa.arquivo}" download="${tarefa.nomeArquivo}">Download</a>` : ""}
    </div>
  `;

  container.appendChild(div);
}

function editarTarefa(botao) {
  const card = botao.closest(".tarefa");
  const titulo = card.querySelector("h3").innerText;
  const data = card.querySelector(".data").innerText.split(" ").slice(-1)[0];
  const descricao = card.querySelector(".descricao").innerText;
  const status = card.classList.contains("concluida")
    ? "concluida"
    : card.classList.contains("pendente")
      ? "pendente"
      : "atrasada";

  document.getElementById("titulo").value = titulo;
  document.getElementById("data").value = data;
  document.getElementById("status").value = status;
  document.getElementById("descricao").value = descricao;

  abrirFormulario();
  editando = card;
}

function atualizarTarefa(card, tarefa) {
  card.className = `tarefa ${tarefa.status}`;
  card.innerHTML = `
    <div class="drag"></div>
    <h3>${tarefa.titulo}</h3>
    <p class="data">
      ${tarefa.status === "concluida" ? "Entregue em" : "Data máxima para entrega"} 
      ${formatarDataISOparaBR(tarefa.data)}
    </p>
    <p class="descricao">${tarefa.descricao}</p>
    <span class="status ${corStatus(tarefa.status)}">${capitalizar(tarefa.status)}</span>
    <div style="margin-top: 10px;">
      <button onclick="editarTarefa(this)">Editar</button>
      ${tarefa.arquivo ? `<a href="${tarefa.arquivo}" download="${tarefa.nomeArquivo}">Download</a>` : ""}
    </div>
  `;
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

function toggleMenu() {
  const menu = document.getElementById('menuNav');
  menu.classList.toggle('show');
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
      for (i = 0; dadosTarefas.tarefas.length; i++) {
        const tarefa = dadosTarefas.tarefas[i];
        const card = document.createElement("section");

        const dataISO = new Date(tarefa.data_limite).toISOString().split('T')[0];
        const [ano, mes, dia] = dataISO.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;

        let exibirAnexo = ``;
        if (tarefa.anexo !== null) {
          exibirAnexo = `<a onclick="baixarAnexoTarefa(${tarefa.anexo})" class="baixar-anexo">Anexo Tarefa</a>`;
        }

        card.className = "categoria";
        card.innerHTML += `
          <h2>${tarefa.titulo}</h2>
          <p><b>Data Máxima Entrega:</b> ${dataFormatada}</p><br>
          <p class="descricao">${tarefa.descricao}</p><br>
          <button onclick="addSubTarefa(${tarefa.id})" class="subTarefa">ADICIONAR SUBTAREFA</button>
          <div class="tarefas">
        `;

        const respostaSubTarefas = await fetch('http://localhost:8080/subtarefas/tarefa/' + tarefa.id, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        const dadosSubTarefas = await respostaSubTarefas.json();
        if (dadosSubTarefas.result) {
          alert(dadosSubTarefas.subtarefas.length);
          for (i = 0; dadosSubTarefas.subtarefas.length; i++) {
            const subtarefa = dadosSubTarefas.subtarefas[i];
            let status;
            let descData;

            if (subtarefa.satus === "Concluída"){
              status = "verde";
              descData = "Entregue em ";
            }else if (subtarefa.satus === "Atrasada"){
              status = "vermelho";
              descData = "Data Máxima Entrega: "
            }else if (subtarefa.satus === "Pendente"){
              status = "azul";
            }

            const dataISO = new Date(subtarefa.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            if (subtarefa.anexo === null){
              const baixarAnexoSub = "";
            }else{
              const baixarAnexoSub = `<a onclick="baixarAnexoSubTarefa(${subtarefa.anexo})">Baixar Anexo</a>`;
            }

            card.innerHTML +=`
              <div class="tarefa concluida">
              <div class="drag"><h3>PROTOTIPAÇÃO TELA TAREFAS</h3><a title="Ordem" style="background-color: rgb(93, 93, 212);">${subtarefa.ordem}</a></div>
              <p class="data">${descData}${dataFormatada}</p>
              <p class="descricao">${subtarefa.descricao}</p>
              <span class="status ${status}">${subtarefa.status}</span>
              <div style="margin-top: 10px;"><button onclick="editarSubTarefa(${subtarefa.id})">Editar</button>${baixarAnexoSub}
              </div>
              <br>
              <button onclick="moverParaCimaSub(${subtarefa.id})" title="Subir">🔼</button><button onclick="moverParaBaixoSub(${subtarefa.id})" title="Descer">🔽</button>
              </div>
            `;

          }
        }
        card.innerHTML += `
          </div>
          <br><br>
          ${exibirAnexo}&nbsp;&nbsp;<button onclick="moverParaCima(${tarefa.id})" title="Subir" class="position">🔼</button><button onclick="moverParaBaixo(${tarefa.id})" title="Descer" class="position">🔽</button>
        `;

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
    alert("Tarefa criada com sucessa!");
    window.location.href = "tarefas.html?id=" + dadosProjeto.projeto.id;
  } else {
    msgAviso.innerHTML = dados.mensagem;
  }


}