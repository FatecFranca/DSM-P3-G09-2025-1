async function criarProjeto() {
  const titulo = document.getElementById("titulo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const dataEntrega = document.getElementById("dataEntrega").value;
  let arquivo = document.getElementById("arquivo").files[0];
  const msgAviso = document.getElementById("msgAviso");
  msgAviso.innerHTML = "";

  if (titulo === "") {
    msgAviso.innerHTML = "Preencha o campo Título!";
    return;
  } else if (descricao === "") {
    msgAviso.innerHTML = "Preencha o campo Descrição!";
    return;
  } else if (!dataEntrega || dataEntrega === "" || dataEntrega === undefined || dataEntrega === null) {
    msgAviso.innerHTML = "Preencha o campo Data de Entrega!";
    return;
  }

  const formData = new FormData();
  formData.append('anexoProjeto', arquivo);
  formData.append('titulo', titulo);
  formData.append('descricao', descricao);
  formData.append('data_limite', dataEntrega);

  const resposta = await fetch('http://localhost:8080/projetos/', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  const dados = await resposta.json();

  if (dados.result) {
    alert("Projeto criado com sucesso!");
    window.location.href = "home.html";
  } else {
    msgAviso.innerHTML = dados.mensagem;
  }

}