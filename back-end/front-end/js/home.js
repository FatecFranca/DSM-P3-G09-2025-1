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


document.addEventListener('DOMContentLoaded', function () {
    const statusSelect = document.getElementById('statusSelect');
    const todosProjetos = document.querySelectorAll('.project-card');

    function filtrarProjetos(status) {
        todosProjetos.forEach(projeto => {
            const statusProjeto = projeto.querySelector('.pendente, .concluido, .atrasado');

            if (status === 'todos') {
                projeto.style.display = 'block';
            } else if (statusProjeto && statusProjeto.classList.contains(status)) {
                projeto.style.display = 'block';
            } else {
                projeto.style.display = 'none';
            }
        });
    }

    statusSelect.addEventListener('change', function () {
        const valorSelecionado = this.value;
        filtrarProjetos(valorSelecionado);
    });

    filtrarProjetos('todos');
});

// Confirmação sair
document.getElementById('sairMenu').addEventListener('click', function (e) {
    e.preventDefault();
    const confirmar = confirm("Tem certeza de que deseja sair?");
    if (confirmar) {
        window.location.href = 'index.html';
    }
});


