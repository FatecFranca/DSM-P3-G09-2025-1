let dadosSessao = null;

async function buscarDados(){

    const resposta = await fetch('http://localhost:8080/usuarios/verificaSessao/true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    dadosSessao = await resposta.json();

    if(!dadosSessao.result){
        return window.location.href = "login.html";
    }

    const obterDadosUsuario = await fetch('http://localhost:8080/usuarios/' + dadosSessao.dados.id, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    const dadosUsuario = await obterDadosUsuario.json();

    if(dadosUsuario){
        document.getElementById("nome").value = dadosUsuario.nome;
        document.getElementById("email").value = dadosUsuario.email;

        if (dadosUsuario.foto === null) {
            document.getElementById("imagemPreview").src = "img/icones/fotodeperfil.png";
        }else{
            document.getElementById("imagemPreview").src = dadosUsuario.foto;
        }
    }else{
        return window.location.href = "login.html";
    }
}


async function alterarDados(){
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    let novaSenha = document.getElementById("novaSenha").value;
    const senhaAtual = document.getElementById("senhaAtual").value;
    const msgAviso = document.getElementById("msgAviso");
    msgAviso.innerHTML = "Altere os Dados do Cadastro ...";
    msgAviso.style.color = "black";

    const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (nome === "") {
        msgAviso.innerHTML = "Preencha o campo de Nome!";
        document.getElementById("nome").focus();
        msgAviso.style.color = "red";
        return;
    }else if (email === "") {
        msgAviso.innerHTML = "Preencha o campo de E-mail!";
        document.getElementById("email").focus();
        msgAviso.style.color = "red";
        return;
    }else if (senhaAtual === "") {
        msgAviso.innerHTML = "Preencha o campo de Senha!";
        document.getElementById("senhaAtual").focus();
        msgAviso.style.color = "red";
        return;
    }

    if (novaSenha !== "") {
        if (!senhaForte.test(novaSenha)) {
            msgAviso.innerHTML = "Senha deve conter: De 8 a 16 caracteres, pelo menos 1 letra maiúscula, pelo menos 1 letra minúscula, pelo menos 1 número, pelo menos 1 caractere especial";
            document.getElementById("novaSenha").focus();
            msgAviso.style.color = "red";
            return;
        }
    }else{
        novaSenha = senhaAtual;
    }

    const resposta = await fetch('http://localhost:8080/usuarios/' + dadosSessao.dados.id, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome, email: email, senha_atual: senhaAtual, senha: novaSenha })
    });

    respostaDados = await resposta.json();

    if(respostaDados.result){
        msgAviso.innerHTML = "Dados alterados com sucesso!";
        msgAviso.style.color = "green";
        document.getElementById("senhaAtual").value = "";
        document.getElementById("novaSenha").value = "";
    }else if(respostaDados.mensagem){
        msgAviso.innerHTML = respostaDados.mensagem;
        msgAviso.style.color = "red";
    }
}