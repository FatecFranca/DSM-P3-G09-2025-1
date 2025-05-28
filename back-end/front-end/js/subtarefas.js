const tipoUsuario = "ADM"; // Altere para "GESTOR" ou "MEMBRO" conforme necessário

document.getElementById("add-task").addEventListener("click", () => {
  abrirFormulario();
});

const subtarefas = [
  {
    titulo: "PROTOTIPAÇÃO TELA SUBTAREFAS",
    data: "2025-06-01",
    status: "concluida",
    descricao: "Protótipo entregue e aprovado.",
    arquivo: null,
    nomeArquivo: null,
    responsavel: "GESTOR"
  },
  {
    titulo: "AJUSTES DE CSS",
    data: "2025-06-02",
    status: "pendente",
    descricao: "Falta corrigir responsividade mobile.",
    arquivo: null,
    nomeArquivo: null,
    responsavel: "ADM"
  },
  {
    titulo: "INSERIR ÍCONE DE EDIÇÃO",
    data: "2025-06-03",
    status: "atrasada",
    descricao: "Aguardando ícone final da designer.",
    arquivo: null,
    nomeArquivo: null,
    responsavel: "MEMBRO"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  subtarefas.forEach(t => adicionarSubtarefa(t));
});

const form = document.getElementById("task-form");
let editando = null;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const data = document.getElementById("data").value;
  const status = document.getElementById("status").value;
  const descricao = document.getElementById("descricao").value;
  const arquivoInput = document.getElementById("arquivo");
  const arquivo = arquivoInput.files[0];

  const subtarefa = {
    titulo,
    data,
    status,
    descricao,
    arquivo: arquivo ? URL.createObjectURL(arquivo) : null,
    nomeArquivo: arquivo ? arquivo.name : null,
    responsavel: tipoUsuario
  };

  if (editando) {
    atualizarSubtarefa(editando, subtarefa);
    editando = null;
  } else {
    adicionarSubtarefa(subtarefa);
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

function adicionarSubtarefa(subtarefa) {
  const categoria = Array.from(document.querySelectorAll(".categoria")).find(secao =>
    secao.querySelector("h2").textContent.trim().toUpperCase() === subtarefa.responsavel
  );

  if (categoria) {
    const container = categoria.querySelector(".tarefas");
    const div = criarCardSubtarefa(subtarefa);
    container.appendChild(div);
  }
}

function criarCardSubtarefa(subtarefa) {
  const div = document.createElement("div");
  div.className = `tarefa ${subtarefa.status}`;

  div.innerHTML = `
    <div class="drag"></div>
    <div class="botoes-ordenacao">
      <button title="Subir" onclick="moverParaCima(this)">🔼</button>
      <button title="Descer" onclick="moverParaBaixo(this)">🔽</button>
    </div>
    <h3>${subtarefa.titulo}</h3>
    <p class="data">
      ${subtarefa.status === "concluida" ? "Entregue em" : "Data máxima para entrega"} 
      ${formatarDataISOparaBR(subtarefa.data)}
    </p>
    <p class="descricao">${subtarefa.descricao}</p>
    <span class="status ${corStatus(subtarefa.status)}">${capitalizar(subtarefa.status)}</span>
    <div style="margin-top: 10px;">
      <button onclick="editarSubtarefa(this)">Editar</button>
      ${subtarefa.arquivo ? `<a href="${subtarefa.arquivo}" download="${subtarefa.nomeArquivo}">Download</a>` : ""}
    </div>
  `;

  return div;
}

function editarSubtarefa(botao) {
  const card = botao.closest(".tarefa");
  const titulo = card.querySelector("h3").innerText;
  const data = card.querySelector(".data").innerText.split(" ").slice(-1)[0].split("/").reverse().join("-");
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

function atualizarSubtarefa(card, subtarefa) {
  card.className = `tarefa ${subtarefa.status}`;
  card.innerHTML = `
    <div class="drag"></div>
    <div class="botoes-ordenacao">
      <button title="Subir" onclick="moverParaCima(this)">🔼</button>
      <button title="Descer" onclick="moverParaBaixo(this)">🔽</button>
    </div>
    <h3>${subtarefa.titulo}</h3>
    <p class="data">
      ${subtarefa.status === "concluida" ? "Entregue em" : "Data máxima para entrega"} 
      ${formatarDataISOparaBR(subtarefa.data)}
    </p>
    <p class="descricao">${subtarefa.descricao}</p>
    <span class="status ${corStatus(subtarefa.status)}">${capitalizar(subtarefa.status)}</span>
    <div style="margin-top: 10px;">
      <button onclick="editarSubtarefa(this)">Editar</button>
      ${subtarefa.arquivo ? `<a href="${subtarefa.arquivo}" download="${subtarefa.nomeArquivo}">Download</a>` : ""}
    </div>
  `;
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

function formatarDataISOparaBR(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function corStatus(status) {
  if (status === "concluida") return "verde";
  if (status === "pendente") return "azul";
  if (status === "atrasada") return "vermelho";
}
