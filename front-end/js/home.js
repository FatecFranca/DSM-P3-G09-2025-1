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

document.getElementById("statusBtn").addEventListener("click", function () {
    alert("Filtrando por status... (exemplo)");
});