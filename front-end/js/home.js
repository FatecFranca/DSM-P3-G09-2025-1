document.getElementById("sairBtn").addEventListener("click", function () {
    if (confirm("Tem certeza que deseja sair?")) {
        window.location.href = "index.html";
    }
});

document.getElementById("novoProjetoBtn1").addEventListener("click", function () {
    window.location.href = "novo-projeto.html";
});

document.getElementById("novoProjetoBtn2").addEventListener("click", function () {
    window.location.href = "novo-projeto.html";
});

document.getElementById("notificacoesBtn").addEventListener("click", function () {
    window.location.href = "notificacoes.html";
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
