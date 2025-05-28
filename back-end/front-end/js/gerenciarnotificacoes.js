function toggleMenu() {
  const nav = document.querySelector('nav');
  nav.classList.toggle('show');
}

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

let notifications = [];
async function buscarNotificacoes(){

  const buscaNotificacoes = await fetch('http://localhost:8080/notificacoes/usuario/true', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
  });

  notifications = await buscaNotificacoes.json();

  const notificationList = document.getElementById("notificationList");

  if (notifications.length === 0){
    const p = document.createElement("p");
    p.style.textAlign = "center";
    p.innerHTML = `Nehuma notificação para vossa pessoa`;
    notificationList.appendChild(p);
  }else{
    notifications.forEach((text, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" class="notification-checkbox" data-index="${index}" />
        <p>${text}</p>
      `;
      notificationList.appendChild(li);
    });
  }
}

document.getElementById("selectAll").addEventListener("change", function () {
  const checkboxes = document.querySelectorAll(".notification-checkbox");
  checkboxes.forEach(cb => cb.checked = this.checked);
});

document.getElementById("deleteSelected").addEventListener("click", async function () {
  const checkboxes = document.querySelectorAll(".notification-checkbox:checked");
  // checkboxes.forEach(cb => 
  //   cb.closest("li").remove()
  // );

  for (i = 0; checkboxes.length; i++){

    // const deletarNotificacao = await fetch('http://localhost:8080/notificacoes/', {
    //     method: 'DELETE',
    //     credentials: 'include',
    //     headers: { 'Content-Type': 'application/json' }
    // });

    // const delecao = await deletarNotificacao.json();

    // if (!delecao.result){
    //   alert("Ocorreu um erro durante a exclusão da notificação: " + delecao.mensagem);
    // }

    checkboxes[i].closest("li").remove();
  }
});
