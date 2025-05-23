// data mínima de entrega para hoje
const hoje = new Date().toISOString().split("T")[0];
document.getElementById("dataEntrega").setAttribute("min", hoje);

function mostrarErro(mensagem) {
  const alerta = document.getElementById('alerta-erro');
  alerta.textContent = mensagem;
  alerta.style.display = 'block';
}

document.getElementById("formProjeto").addEventListener("submit", function (e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const dataEntrega = document.getElementById("dataEntrega").value;

  if (!titulo || !descricao || !dataEntrega) {
    mostrarErro('Preencha todos os campos obrigatórios.');
    return;
  }

  try {
    const projeto = {
      titulo,
      descricao,
      dataEntrega
    };

    const projetos = JSON.parse(localStorage.getItem("projetos")) || [];
    projetos.push(projeto);
    localStorage.setItem("projetos", JSON.stringify(projetos));

    window.location.href = "index.html";

  } catch (err) {
    mostrarErro('Houve um erro, tente novamente mais tarde.');
    console.error(err);
  }
});
