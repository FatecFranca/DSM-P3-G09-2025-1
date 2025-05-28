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

    if (!confirm("Deseja realmente sair?")){
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

    const containerGestorAtrasados = document.getElementById("projetosGestorAtrasados");
    const containerGestorPendentes = document.getElementById("projetosGestorPendentes");
    const containerGestorConcluidos = document.getElementById("projetosGestorConcluidos");

    const containerAdmAtrasados = document.getElementById("projetosAdmAtrasados");
    const containerAdmPendentes = document.getElementById("projetosAdmPendentes");
    const containerAdmConcluidos = document.getElementById("projetosAdmConcluidos");

    const containerMembroAtrasados = document.getElementById("projetosMembroAtrasados");
    const containerMembroPendentes = document.getElementById("projetosMembroPendentes");
    const containerMembroConcluidos = document.getElementById("projetosMembroConcluidos");

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
                    <h3 onclick="abrirTarefas('${projeto.id}')" style="cursor: pointer; color: #0a036b"><u>${projeto.titulo}</u></h3>
                    <span class="actions"><a title="Editar" onclick="editarPojeto('${projeto.id}')">✎</a>&nbsp;&nbsp;<a title="Membros" onclick="editarMembros('${projeto.id}')">👤</a>&nbsp;&nbsp;<a title="Concluir" onclick="concluirProjeto('${projeto.id}')">✔️</a></span>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerGestorAtrasados.appendChild(card);
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
                    <h3 onclick="abrirTarefas('${projeto.id}')" style="cursor: pointer; color: #0a036b"><u>${projeto.titulo}</u></h3>
                    <span class="actions"><a title="Editar" onclick="editarPojeto('${projeto.id}')">✎</a>&nbsp;&nbsp;<a title="Membros" onclick="editarMembros('${projeto.id}')">👤</a>&nbsp;&nbsp;<a title="Concluir" onclick="concluirProjeto('${projeto.id}')">✔️</a></span>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerGestorPendentes.appendChild(card);
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
                    <h3 onclick="abrirTarefas('${projeto.id}')" style="cursor: pointer; color: #0a036b"><u>${projeto.titulo}</u></h3>
                    <span class="actions"><a title="Reabrir" onclick="reabrirProjeto('${projeto.id}')">🔑</a></span>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerGestorConcluidos.appendChild(card);
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
                    <h3 onclick="abrirTarefas('${projeto.id}')" style="cursor: pointer; color: #0a036b"><u>${projeto.titulo}</u></h3>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerAdmAtrasados.appendChild(card);
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
                    <h3 onclick="abrirTarefas('${projeto.id}')" style="cursor: pointer; color: #0a036b"><u>${projeto.titulo}</u></h3>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerAdmPendentes.appendChild(card);
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
                    <h3 onclick="abrirTarefas('${projeto.id}')" style="cursor: pointer; color: #0a036b"><u>${projeto.titulo}</u></h3>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerAdmConcluidos.appendChild(card);
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
                    <h3 onclick="abrirTarefas('${projeto.id}')" style="cursor: pointer; color: #0a036b"><u>${projeto.titulo}</u></h3>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerMembroAtrasados.appendChild(card);
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
                    <h3 onclick="abrirTarefas('${projeto.id}')" style="cursor: pointer; color: #0a036b"><u>${projeto.titulo}</u></h3>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerMembroPendentes.appendChild(card);
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
                    <h3 onclick="abrirTarefas('${projeto.id}')" style="cursor: pointer; color: #0a036b"><u>${projeto.titulo}</u></h3>
                </div>
                <p><strong>Data máxima de entrega:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="${projeto.status}">${projeto.status}</span></p>
                <p class="descricao">${projeto.descricao}</p>
                ${exibirAnexo}
            `;
            containerMembroConcluidos.appendChild(card);
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

    if (dadosProjeto.result) {
        document.getElementById("idProjeto").value = dadosProjeto.projeto.id;
        document.getElementById("titulo").value = dadosProjeto.projeto.titulo;
        document.getElementById("descricao").value = dadosProjeto.projeto.descricao;
        const data = new Date(dadosProjeto.projeto.data_limite);
        const dataFormatada = data.toISOString().split('T')[0];
        document.getElementById("dataLimite").value = dataFormatada;
    } else {
        alert("Erro ao buscar o projeto: " + dadosProjeto.projeto.mensagem);
    }
}

function fecharPopup() {
    document.getElementById("meuPopup").style.display = "none";
    document.body.style.overflow = "";
}

async function editarMembros(idProjeto) {
    document.getElementById("gestaoPopup").style.display = "flex";
    document.body.style.overflow = "hidden";

    document.getElementById("idProjetoGestaoMembros").value = idProjeto;

    buscarMembros(idProjeto);
    buscarAdmins(idProjeto);
    
}

function fecharPopupGestao() {
    document.getElementById("gestaoPopup").style.display = "none";
    document.body.style.overflow = "";
}

async function adicionarMembro() {
    
    const emailUsu = document.getElementById("emailNovoMembro").value.trim();
    const idProjeto = document.getElementById("idProjetoGestaoMembros").value;

    if (emailUsu === "") {
        alert("Preencha o campo Email!");
        document.getElementById("emailNovoMembro").focus();
        return;
    }

    const resposta = await fetch('http://localhost:8080/projetos/addMembro/' + idProjeto, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_usuario: emailUsu })
    });

    const dados = await resposta.json();

    if (dados.result){
        alert('Membro adicionado com sucesso!');
        window.location.reload();
        return
    }else{
        return alert('Erro: ' + dados.mensagem);
    }

}

async function excluirMembro(idMembro, idProjeto) {

    if (!confirm("Tem certeza que deseja remover este membro?")) {
        return;
    }

    const resposta = await fetch('http://localhost:8080/projetos/removeMembro/' + idProjeto, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_membro: idMembro })
    });

    const dados = await resposta.json();

    if (dados.result){
        alert('Membro removido com sucesso!');
        window.location.reload();
        return
    }else{
        return alert('Erro: ' + dados.mensagem);
    }

}

async function buscarMembros(idProjeto) {

    const listaMembros = document.getElementById("listaMembros");
    listaMembros.innerHTML = "";
    
    const buscarProjeto = await fetch('http://localhost:8080/projetos/' + idProjeto, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const projeto = await buscarProjeto.json();
    
    if (projeto.result) {

        if (projeto.membros.length === 0) {
            listaMembros.innerHTML = "<p class='nadaEncontrado'>Nenhum membro adicionado a este projeto</p>";
        }

        for (let i = 0; i < projeto.membros.length; i++) {
    
            const membro = projeto.membros[i];
            const card = document.createElement("div");

            card.innerHTML = `
                <a class="descricao">${membro.nome}</a><img src="img/icones/x-exlcuir.svg" class="btn-excluir-membro" title="Excluir Membro" onclick="excluirMembro('${membro.id}', '${idProjeto}')">
            `;
            listaMembros.appendChild(card);
        }
    }
}

async function adicionarAdmin(){
    const emailUsu = document.getElementById("emailNovoAdmin").value;
    const idProjeto = document.getElementById("idProjetoGestaoMembros").value;

    if (emailUsu === "") {
        alert("Preencha o campo Email!");
        document.getElementById("emailNovoAdmin").focus();
        return;
    }

    const resposta = await fetch('http://localhost:8080/projetos/addAdministrador/' + idProjeto, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_usuario: emailUsu })
    });

    const dados = await resposta.json();

    if (dados.result){
        alert('Administrador adicionado com sucesso!');
        window.location.reload();
        return
    }else{
        return alert('Erro: ' + dados.mensagem);
    }
}

async function excluirAdministrador(idMembro, idProjeto) {

    if (!confirm("Tem certeza que deseja remover este administrador?")) {
        return;
    }

    const resposta = await fetch('http://localhost:8080/projetos/removeAdministrador/' + idProjeto, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_administrador: idMembro })
    });

    const dados = await resposta.json();

    if (dados.result){
        alert('Administrador removido com sucesso!');
        window.location.reload();
        return
    }else{
        return alert('Erro: ' + dados.mensagem);
    }

}

async function buscarAdmins(idProjeto) {

    const listaAdmins = document.getElementById("listaAdmins");
    listaAdmins.innerHTML = "";

    const listaGestores = document.getElementById("novoGestor");
    listaGestores.innerHTML = "";
    
    const buscarProjeto = await fetch('http://localhost:8080/projetos/' + idProjeto, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const projeto = await buscarProjeto.json();
    
    if (projeto.result) {

        if (projeto.administradores.length === 0) {
            listaAdmins.innerHTML = "<p class='nadaEncontrado'>Nenhum administrador adicionado a este projeto</p>";
            const optionPadrao = document.createElement("option");
            optionPadrao.value = "none";
            optionPadrao.textContent = "Nenhum um Administrador";
            listaGestores.appendChild(optionPadrao);
        }else{
            const optionPadrao = document.createElement("option");
            optionPadrao.value = "none";
            optionPadrao.textContent = "Selecione um Administrador";
            listaGestores.appendChild(optionPadrao);
        }

        for (let i = 0; i < projeto.administradores.length; i++) {
    
            // Inserindo nos administradores
            const administrador = projeto.administradores[i];
            const card = document.createElement("div");

            card.innerHTML = `
                <a class="descricao">${administrador.nome}</a><img src="img/icones/x-exlcuir.svg" class="btn-excluir-membro" title="Excluir Administrador" onclick="excluirAdministrador('${administrador.id}', '${idProjeto}')">
            `;
            listaAdmins.appendChild(card);

            // Inserindo nos possiveis gestores
            const option = document.createElement("option");
            option.value = administrador.id;
            option.textContent = administrador.nome;
            listaGestores.appendChild(option);
            
        }
    }
}

async function cederCargoGestor(){

    const senhaGestor = document.getElementById('senhaGestor').value;
    if (senhaGestor === ""){
        alert("Insira a senha para continuar...");
        document.getElementById('senhaGestor').focus();
        return;
    }

    const idGestorNovo = document.getElementById("novoGestor").value;
    if (idGestorNovo === "none" || idGestorNovo === ""){
        alert("Selecione um Administrador a conceder o cargo...");
        document.getElementById('novoGestor').focus();
        return;
    }

    if (!confirm("Tem certeza que deseja ceder o seu cargo de gestor? \n Você não terá mais acesso a esse projeto de nenhuma outra forma!")){
        return;
    }

    const idProjeto = document.getElementById("idProjetoGestaoMembros").value;

    const resposta = await fetch('http://localhost:8080/projetos/updateGestor/' + idProjeto, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha_gestor: senhaGestor, id_gestorNovo: idGestorNovo })
    });

    const dados = await resposta.json();

    if (dados.result){
        alert('Você cedeu o seu cargo de gestor!');
        window.location.reload();
        return
    }else{
        return alert('Erro: ' + dados.mensagem);
    }
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

function ocultarProjetos(tipo){
    if (document.getElementById(tipo).style.display === 'block'){
        document.getElementById(tipo).style.display = 'none';
    }else{
        document.getElementById(tipo).style.display = 'block';
    }
}

function statusProjetos(){
    const status = document.getElementById('statusBtn').value;

    const gestorAtrasados = document.getElementById('projetosGestorAtrasados');
    const gestorPendentes = document.getElementById('projetosGestorPendentes');
    const gestorConcluidos = document.getElementById('projetosGestorConcluidos');

    const admAtrasados = document.getElementById('projetosAdmAtrasados');
    const admPendentes = document.getElementById('projetosAdmPendentes');
    const admConcluidos = document.getElementById('projetosAdmConcluidos');

    const membroAtrasados = document.getElementById('projetosMembroAtrasados');
    const membroPendentes = document.getElementById('projetosMembroPendentes');
    const membroConcluidos = document.getElementById('projetosMembroConcluidos');
    
    if (status === "todos"){
        gestorAtrasados.style.display = "flex";
        gestorConcluidos.style.display = "flex";
        gestorPendentes.style.display = "flex";
        admAtrasados.style.display = "flex";
        admConcluidos.style.display = "flex";
        admPendentes.style.display = "flex";
        membroAtrasados.style.display = "flex";
        membroConcluidos.style.display = "flex";
        membroPendentes.style.display = "flex";
        
    }else if (status === "pendentes"){
        gestorPendentes.style.display = "flex";
        admPendentes.style.display = "flex";
        membroPendentes.style.display = "flex";

        gestorAtrasados.style.display = "none";
        admAtrasados.style.display = "none";
        membroAtrasados.style.display = "none";

        gestorConcluidos.style.display = "none";
        admConcluidos.style.display = "none";
        membroConcluidos.style.display = "none";
        
    }else if (status === "atrasados"){
        gestorPendentes.style.display = "none";
        admPendentes.style.display = "none";
        membroPendentes.style.display = "none";

        gestorAtrasados.style.display = "flex";
        admAtrasados.style.display = "flex";
        membroAtrasados.style.display = "flex";

        gestorConcluidos.style.display = "none";
        admConcluidos.style.display = "none";
        membroConcluidos.style.display = "none";
        
    }else if (status === "concluidos"){
        gestorPendentes.style.display = "none";
        admPendentes.style.display = "none";
        membroPendentes.style.display = "none";

        gestorAtrasados.style.display = "none";
        admAtrasados.style.display = "none";
        membroAtrasados.style.display = "none";

        gestorConcluidos.style.display = "flex";
        admConcluidos.style.display = "flex";
        membroConcluidos.style.display = "flex";
    }
}

function abrirTarefas(idProjeto){
    window.location.href = "tarefas.html?id=" + idProjeto;
}