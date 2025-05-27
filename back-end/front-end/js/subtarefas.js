
document.addEventListener('DOMContentLoaded', () => {
  const tarefasContainer = document.querySelectorAll('.tarefas');
  const tipoUsuario = 'ADM'; // 'ADM', 'GESTOR' ou 'MEMBRO'

  let subtarefas = [
    {
      id: 1,
      titulo: 'PROTOTIPAÇÃO TELA TAREFAS',
      descricao: 'Protótipo entregue conforme solicitado.',
      dataEntrega: '2025-05-17',
      dataMaxima: '2025-05-17',
      status: 'concluida',
      anexo: 'protótipo.pdf',
      responsavel: 'GESTOR',
    },
    {
      id: 2,
      titulo: 'DOCUMENTAÇÃO',
      descricao: 'Documentação técnica.',
      dataMaxima: '2025-05-15',
      status: 'atrasada',
      anexo: 'documento.zip',
      responsavel: 'ADM',
    },
    {
      id: 3,
      titulo: 'PORTIFÓLIO',
      descricao: 'Documentação.',
      dataMaxima: '2025-05-15',
      status: 'pendente',
      anexo: 'portifolio.zip',
      responsavel: 'MEMBRO',
    },
  ];

  function renderSubtarefas() {
    tarefasContainer.forEach(c => (c.innerHTML = ''));

    subtarefas.forEach((tarefa, index) => {
      const box = document.createElement('div');
      box.className = `tarefa ${tarefa.status}`;

      const statusCor = {
        concluida: 'verde',
        pendente: 'azul',
        atrasada: 'vermelho',
      };

      let botoes = '';
      if (podeEditar(tarefa)) {
        botoes = `
    <div class="botoes-ordenacao">
      <button title="Subir" onclick="moverParaCima(${index})">🔼</button>
      <button title="Descer" onclick="moverParaBaixo(${index})">🔽</button>
    </div>`;
      }

      box.innerHTML = `
        <div class="drag"></div>
        ${botoes}
        <h3>${tarefa.titulo}</h3>
        <p class="data">
          ${tarefa.status === 'concluida' ? `Entregue em ${formatarData(tarefa.dataEntrega)}` : `Data máxima para entrega ${formatarData(tarefa.dataMaxima)}`}
        </p>
        <p class="descricao">${tarefa.descricao}</p>
        <span class="status ${statusCor[tarefa.status]}">${capitalize(tarefa.status)}</span><br/><br/>
        <a href="#">📎 Baixar ${tarefa.anexo}</a>
      `;

      const destino = Array.from(tarefasContainer).find(c =>
        c.parentElement.querySelector('h2').textContent === tarefa.responsavel
      );

      destino?.appendChild(box);
    });
  }

  window.moverParaCima = function (index) {
    if (index > 0) {
      [subtarefas[index - 1], subtarefas[index]] = [subtarefas[index], subtarefas[index - 1]];
      renderSubtarefas();
    }
  };

  window.moverParaBaixo = function (index) {
    if (index < subtarefas.length - 1) {
      [subtarefas[index + 1], subtarefas[index]] = [subtarefas[index], subtarefas[index + 1]];
      renderSubtarefas();
    }
  };

  function podeEditar(tarefa) {
    const statusPermitidos = ['concluida', 'atrasada'];
    return ['ADM', 'GESTOR'].includes(tipoUsuario) && statusPermitidos.includes(tarefa.status);
  }

  function formatarData(data) {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  function capitalize(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  document.getElementById('task-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const novaTarefa = {
      id: Date.now(),
      titulo: document.getElementById('titulo').value,
      descricao: document.getElementById('descricao').value,
      dataMaxima: document.getElementById('data').value,
      status: document.getElementById('status').value,
      anexo: document.getElementById('arquivo').files[0]?.name || 'sem-arquivo.pdf',
      responsavel: tipoUsuario,
      dataEntrega: document.getElementById('status').value === 'concluida' ? document.getElementById('data').value : null,
    };

    subtarefas.push(novaTarefa);
    this.reset();
    document.getElementById('form-container').style.display = 'none';
    renderSubtarefas();
  });

  document.getElementById('add-task').addEventListener('click', () => {
    document.getElementById('form-container').style.display = 'flex';
  });

  window.fecharFormulario = function () {
    document.getElementById('form-container').style.display = 'none';
  };

  renderSubtarefas();
});
