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
    notifications.forEach((not) => {

      // Dat formatada
      const data = new Date(not.data_criacao)
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();

      const horas = String(data.getHours()).padStart(2, '0');
      const minutos = String(data.getMinutes()).padStart(2, '0');

      const dataFormatada = `${dia}/${mes}/${ano} - ${horas}:${minutos} hrs`;
      
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" class="notification-checkbox" data-id="${not.id}" />
        <div>
          <b>${not.titulo}</b>
          <br><br>
          <a  style='white-space: pre-wrap;'>${not.texto}</a>
          <br><br>
          <p>${dataFormatada}<p>
        </diV>
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

  for (let i = 0; i < checkboxes.length; i++) {
    const checkbox = checkboxes[i];
    
    const idNotificacao = checkbox.dataset.id;

    try {
      const deletarNotificacao = await fetch('http://localhost:8080/notificacoes/'+  idNotificacao, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const resultado = await deletarNotificacao.json();

      if (!resultado.result) {
        alert("Erro ao excluir notificação: " + resultado.mensagem);
        continue;
      }

      // Remove do DOM apenas se a exclusão for bem-sucedida
      checkbox.closest("li").remove();

    } catch (erro) {
      alert("Erro na exclusão da notificação: " + erro.message);
    }
  }
});

