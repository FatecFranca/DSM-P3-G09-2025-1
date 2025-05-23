document.getElementById("sairBtn").addEventListener("click", function () {
    if (confirm("Tem certeza que deseja sair?")) {
        encerrarSessao();
    }
});

document.getElementById("statusBtn").addEventListener("click", function () {
    document.getElementById("statusMenu").classList.toggle("hidden");
});

document.querySelectorAll("#statusMenu li").forEach(function (item) {
    item.addEventListener("click", function () {
        const selectedStatus = item.getAttribute("data-status");
        document.getElementById("statusMenu").classList.add("hidden");

        const cards = document.querySelectorAll(".project-card");
        cards.forEach(function (card) {
            const statusSpan = card.querySelector("span");
            if (!statusSpan) return;

            const status = statusSpan.classList.contains("pendente") ? "pendente" :
                           statusSpan.classList.contains("concluido") ? "concluido" :
                           statusSpan.classList.contains("atrasado") ? "atrasado" : "";


            if (selectedStatus === "todos" || status === selectedStatus) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});



<<<<<<< HEAD
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
=======

>>>>>>> 5ef96c396a1271a641ebce4e177fa58c8c1bee1a
