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
