function toggleMenu() {
  const menu = document.getElementById('menuNav');
  menu.classList.toggle('show');
}

document.getElementById('meuPerfilBtn').addEventListener('click', () => {
  window.location.href = 'alterarDadosUsuario.html';
});

document.getElementById('sairMenu').addEventListener('click', (e) => {
  e.preventDefault();
  const confirmar = confirm("Tem certeza de que deseja sair?");
  if (confirmar) {
    window.location.href = 'index.html';
  }
});


// botão filtro
document.getElementById("statusBtn").addEventListener("click", function () {
    const status = prompt("Filtrar por status: pendente, atrasado ou concluído").toLowerCase();
    const cards = document.querySelectorAll(".projeto-card");
    cards.forEach(card => {
        const cardStatus = card.getAttribute("data-status");
        if (!status || cardStatus === status) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});

// barra de pesquisa
document.querySelector(".search-input").addEventListener("input", function (e) {
    const termo = e.target.value.toLowerCase();
    const cards = document.querySelectorAll(".projeto-card");
    cards.forEach(card => {
        const titulo = card.querySelector(".titulo-projeto");
        if (titulo && titulo.textContent.toLowerCase().includes(termo)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});


window.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".projetos-container");
    const projetos = JSON.parse(localStorage.getItem("projetos")) || [];

    projetos.forEach(proj => {
        const card = document.createElement("div");
        card.className = "projeto-card";
        card.setAttribute("data-status", proj.status);
        card.innerHTML = `
      <h3 class="titulo-projeto">${proj.titulo}</h3>
      <p>${proj.descricao}</p>
      <p>Entrega: ${proj.dataEntrega}</p>
      <p>Status: ${proj.status}</p>
    `;
        container.appendChild(card);
    });
});

async function encerrarSessao() {
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

async function baixarAnexo(nomeArquivo) {
    if (!nomeArquivo) {
        alert("Nenhum anexo disponível para este projeto.");
        return;
    }

    const url = `http://localhost:8080/uploads/anexoProjetos/${nomeArquivo}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function concluirProjeto(idProjeto) {
    if (confirm("Tem certeza que deseja concluir este projeto?")) {
        const resposta = await fetch('http://localhost:8080/projetos/updateStatus/' + idProjeto, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo_alteracao: "Concluir" })
        });

        const dados = await resposta.json();
        if (dados.result) {
            alert("Projeto concluído com sucesso!");
            window.location.reload();
            return;
        } else {
            alert("Erro ao concluir o projeto: " + dados.mensagem);
            return;
        }
    }

}

async function reabrirProjeto(idProjeto) {
    if (confirm("Tem certeza que deseja reabrir este projeto?")) {
        const resposta = await fetch('http://localhost:8080/projetos/updateStatus/' + idProjeto, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo_alteracao: "Reabrir" })
        });

        const dados = await resposta.json();
        if (dados.result) {
            alert("Projeto reaberto com sucesso!");
            window.location.reload();
            return;
        } else {
            alert("Erro ao concluir o projeto: " + dados.mensagem);
            return;
        }
    }
}

async function carregarProjetos() {

    const containerGestor = document.getElementById("projetosGestor");
    const containerAdiministrador = document.getElementById("projetosAdministrador");
    const containerMembro = document.getElementById("projetosMembro");

    // Buscar projetos em que o usuário é gestor
    const buscaProjetosGestor = await fetch('http://localhost:8080/projetos/gestor/true', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const projetosGestor = await buscaProjetosGestor.json();
    if (projetosGestor.result) {
        for (let i = 0; i < projetosGestor.projetosAtrasados.length; i++) {
            const projeto = projetosGestor.projetosAtrasados[i];
            const card = document.createElement("div");

            const dataISO = new Date(projeto.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let exibirAnexo = `<button class=btn download" disabled title="Sem Anexo">⬇</button>`;
            if (projeto.anexo !== null) {
                exibirAnexo = `<button class=btn download" title="Baixar Anexo" onclick="baixarAnexo('${projeto.anexo}')">⬇</button>`;
            }

            card.className = "project-card";
            card.innerHTML = `
                <div class="project-header">
                    <h4>${projeto.titulo}</h4>
                    <span class="actions"><a title="Editar" onclick="editarPojeto('${projeto.id}')">✎</a>&nbsp;&nbsp;<a title="Membros" onclick="editarMembros()">👤</a>&nbsp;&nbsp;<a title="Concluir" onclick="concluirProjeto('${projeto.id}')">✔️</a></span>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerGestor.appendChild(card);
        }
        for (let i = 0; i < projetosGestor.projetosPendentes.length; i++) {
            const projeto = projetosGestor.projetosPendentes[i];
            const card = document.createElement("div");

            const dataISO = new Date(projeto.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let exibirAnexo = `<button class=btn download" disabled title="Sem Anexo">⬇</button>`;
            if (projeto.anexo !== null) {
                exibirAnexo = `<button class=btn download" title="Baixar Anexo" onclick="baixarAnexo('${projeto.anexo}')">⬇</button>`;
            }

            card.className = "project-card";
            card.innerHTML = `
                <div class="project-header">
                    <h4>${projeto.titulo}</h4>
                    <span class="actions"><a title="Editar" onclick="editarPojeto('${projeto.id}')">✎</a>&nbsp;&nbsp;<a title="Membros" onclick="editarMembros()">👤</a>&nbsp;&nbsp;<a title="Concluir" onclick="concluirProjeto('${projeto.id}')">✔️</a></span>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerGestor.appendChild(card);
        }
        for (let i = 0; i < projetosGestor.projetosConcluidos.length; i++) {
            const projeto = projetosGestor.projetosConcluidos[i];
            const card = document.createElement("div");

            card.className = "project-card";
            if (projeto.status === "Concluído") {
                projeto.status = "Concluido";
            }
            const dataISO = new Date(projeto.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let exibirAnexo = `<button class=btn download" disabled title="Sem Anexo">⬇</button>`;
            if (projeto.anexo !== null) {
                exibirAnexo = `<button class=btn download" title="Baixar Anexo" onclick="baixarAnexo('${projeto.anexo}')">⬇</button>`;
            }

            card.innerHTML = `
                <div class="project-header">
                    <h4>${projeto.titulo}</h4>
                    <span class="actions"><a title="Reabrir" onclick="reabrirProjeto('${projeto.id}')">🔑</a></span>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerGestor.appendChild(card);
        }
    }


    // Buscar projetos em que o usuário é administrador
    const buscaProjetosAdministrador = await fetch('http://localhost:8080/projetos/administrador/true', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const projetosAdminsitrador = await buscaProjetosAdministrador.json();
    if (projetosAdminsitrador.result) {
        for (let i = 0; i < projetosAdminsitrador.projetosAtrasados.length; i++) {
            const projeto = projetosAdminsitrador.projetosAtrasados[i];
            const card = document.createElement("div");

            const dataISO = new Date(projeto.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let exibirAnexo = `<button class=btn download" disabled title="Sem Anexo">⬇</button>`;
            if (projeto.anexo !== null) {
                exibirAnexo = `<button class=btn download" title="Baixar Anexo" onclick="baixarAnexo('${projeto.anexo}')">⬇</button>`;
            }

            card.className = "project-card";
            card.innerHTML = `
                <div class="project-header">
                    <h4>${projeto.titulo}</h4>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerAdiministrador.appendChild(card);
        }
        for (let i = 0; i < projetosAdminsitrador.projetosPendentes.length; i++) {
            const projeto = projetosAdminsitrador.projetosPendentes[i];
            const card = document.createElement("div");

            const dataISO = new Date(projeto.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let exibirAnexo = `<button class=btn download" disabled title="Sem Anexo">⬇</button>`;
            if (projeto.anexo !== null) {
                exibirAnexo = `<button class=btn download" title="Baixar Anexo" onclick="baixarAnexo('${projeto.anexo}')">⬇</button>`;
            }

            card.className = "project-card";
            card.innerHTML = `
                <div class="project-header">
                    <h4>${projeto.titulo}</h4>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerAdiministrador.appendChild(card);
        }
        for (let i = 0; i < projetosAdminsitrador.projetosConcluidos.length; i++) {
            const projeto = projetosAdminsitrador.projetosConcluidos[i];
            const card = document.createElement("div");

            card.className = "project-card";
            if (projeto.status === "Concluído") {
                projeto.status = "Concluido";
            }
            const dataISO = new Date(projeto.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let exibirAnexo = `<button class=btn download" disabled title="Sem Anexo">⬇</button>`;
            if (projeto.anexo !== null) {
                exibirAnexo = `<button class=btn download" title="Baixar Anexo" onclick="baixarAnexo('${projeto.anexo}')">⬇</button>`;
            }

            card.innerHTML = `
                <div class="project-header">
                    <h4>${projeto.titulo}</h4>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerAdiministrador.appendChild(card);
        }
    }


    // Buscar projetos em que o usuário é membro
    //Buscar projetos em que o usuário é gestor
    const buscaProjetosMembros = await fetch('http://localhost:8080/projetos/membro/true', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const projetosMembro = await buscaProjetosMembros.json();
    if (projetosMembro.result) {
        for (let i = 0; i < projetosMembro.projetosAtrasados.length; i++) {
            const projeto = projetosMembro.projetosAtrasados[i];
            const card = document.createElement("div");

            const dataISO = new Date(projeto.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let exibirAnexo = `<button class=btn download" disabled title="Sem Anexo">⬇</button>`;
            if (projeto.anexo !== null) {
                exibirAnexo = `<button class=btn download" title="Baixar Anexo" onclick="baixarAnexo('${projeto.anexo}')">⬇</button>`;
            }

            card.className = "project-card";
            card.innerHTML = `
                <div class="project-header">
                    <h4>${projeto.titulo}</h4>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerMembro.appendChild(card);
        }
        for (let i = 0; i < projetosMembro.projetosPendentes.length; i++) {
            const projeto = projetosMembro.projetosPendentes[i];
            const card = document.createElement("div");

            const dataISO = new Date(projeto.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let exibirAnexo = `<button class=btn download" disabled title="Sem Anexo">⬇</button>`;
            if (projeto.anexo !== null) {
                exibirAnexo = `<button class=btn download" title="Baixar Anexo" onclick="baixarAnexo('${projeto.anexo}')">⬇</button>`;
            }

            card.className = "project-card";
            card.innerHTML = `
                <div class="project-header">
                    <h4>${projeto.titulo}</h4>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerMembro.appendChild(card);
        }
        for (let i = 0; i < projetosMembro.projetosConcluidos.length; i++) {
            const projeto = projetosMembro.projetosConcluidos[i];
            const card = document.createElement("div");
            card.className = "project-card";

            if (projeto.status === "Concluído") {
                projeto.status = "Concluido";
            }

            const dataISO = new Date(projeto.data_limite).toISOString().split('T')[0];
            const [ano, mes, dia] = dataISO.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            let exibirAnexo = `<button class=btn download" disabled title="Sem Anexo">⬇</button>`;
            if (projeto.anexo !== null) {
                exibirAnexo = `<button class=btn download" title="Baixar Anexo" onclick="baixarAnexo('${projeto.anexo}')">⬇</button>`;
            }

            card.innerHTML = `
                <div class="project-header">
                    <h4>${projeto.titulo}</h4>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerMembro.appendChild(card);
        }
    }
}

async function editarPojeto(idProjeto) {
    document.getElementById("meuPopup").style.display = "flex";
    document.body.style.overflow = "hidden";

    const buscarProjeto = await fetch('http://localhost:8080/projetos/' + idProjeto, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const dadosProjeto = await buscarProjeto.json();

    if (!dadosProjeto.mensagem) {
        document.getElementById("idProjeto").value = dadosProjeto.id;
        document.getElementById("titulo").value = dadosProjeto.titulo;
        document.getElementById("descricao").value = dadosProjeto.descricao;
        const data = new Date(dadosProjeto.data_limite);
        const dataFormatada = data.toISOString().split('T')[0];
        document.getElementById("dataLimite").value = dataFormatada;
    } else {
        alert("Erro ao buscar o projeto: " + dadosProjeto.mensagem);
    }
}

function fecharPopup() {
    document.getElementById("meuPopup").style.display = "none";
    document.body.style.overflow = "";
}

function editarMembros() {
    document.getElementById("gestaoPopup").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function fecharPopupGestao() {
    document.getElementById("gestaoPopup").style.display = "none";
    document.body.style.overflow = "";
}

async function adicionarMembro(){
    const emailUsu = document.getElementById("emailNovoMembro").style.value.trim();
    if (emailUsu === "") {
        alert("Preencha o campo Email!");
        return;
    }

    const resposta = await fetch('http://localhost:8080/projetos/addMembro/' + idProjeto, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_alteracao: "Concluir" })
    });

    if (resposta.result){
        return alert('Membro adicionado com sucesso!');
    }else{
        return alert('Erro: ' + resposta.mensagem);
    }

}

async function buscarMembros(idProjeto) {
    
    const buscarProjeto = await fetch('http://localhost:8080/projetos/' + idProjeto, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const projeto = await buscarProjeto.json();
    if (projeto.result) {
        for (let i = 0; i < projeto.ids_membros.length; i++) {

            const membro = projeto.ids_membros[i];
            const card = document.createElement("div");

            card.className = "project-card";
            card.innerHTML = `
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerGestor.appendChild(card);

        }

    }
}

function adicionarAdmin(){
    const emailUsu = document.getElementById("emailNovoAdmin").style.value;
}

function cederCargoGestor(){

}

async function alterarProjeto() {
    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const dataLimite = document.getElementById("dataLimite").value;
    const idProjeto = document.getElementById("idProjeto").value;
    const arquivo = document.getElementById("anexo").files[0];
    const msgAviso = document.getElementById("msgAviso");

    if (titulo === "") {
        msgAviso.innerHTML = "Preencha o campo Título!";
        return;
    } else if (descricao === "") {
        msgAviso.innerHTML = "Preencha o campo Descrição!";
        return;
    } else if (!dataLimite || dataLimite === "" || dataLimite === undefined || dataLimite === null) {
        msgAviso.innerHTML = "Preencha o campo Data Limite!";
        return;
    }

    const formData = new FormData();
    formData.append('anexo', arquivo);
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('data_limite', dataLimite);

    const resposta = await fetch('http://localhost:8080/projetos/' + idProjeto, {
        method: 'PUT',
        credentials: 'include',
        body: formData
    });

    const dados = await resposta.json();

    if (dados.result) {
        alert("Projeto alterado com sucesso!");
        window.location.href = "home.html";
    } else {
        msgAviso.innerHTML = dados.mensagem;
    }
}
