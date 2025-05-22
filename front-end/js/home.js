document.getElementById("sairBtn").addEventListener("click", function () {
    if (confirm("Tem certeza que deseja sair?")) {
        window.location.href = "index.html";
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




