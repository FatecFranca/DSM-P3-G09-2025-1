async function cadastrarEmail(){
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const conSenha = document.getElementById("conSenha").value.trim();
    const msgAviso = document.getElementById("msgAviso");
    msgAviso.innerHTML = "";

    if (!nome) {
        msgAviso.innerHTML = "Preencha o campo de Nome!";
        document.getElementById("nome").focus();
        return;
    }else if (!email) {
        msgAviso.innerHTML = "Preencha o campo de E-mail!";
        document.getElementById("email").focus();
        return;
    }else if (!senha) {
        msgAviso.innerHTML = "Preencha o campo de Senha!";
        document.getElementById("senha").focus();
        return;
    }else if (conSenha !== senha) {
        msgAviso.innerHTML = "As senhas não conferem!";
        document.getElementById("conSenha").focus();
        return;
    }

    try{
        const resposta = await fetch('http://localhost:8080/usuarios/email/' + email, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha })
        });

        const dados = await resposta.json();
        
        if(dados.result){
            window.location.href = "home_usuario.html";
            // msgAviso.innerHTML = "Login realizado com sucesso!";
            // msgAviso.style.color = "green";
        }else if(dados.mensagem){
            msgAviso.innerHTML = dados.mensagem;
            msgAviso.style.color = "red";
        }else{
            msgAviso.innerHTML = "Erro ao realizar login!";
            msgAviso.style.color = "red";
        }
    }catch{
        console.error('Erro ao buscar placa:', erro);
        msgAviso.innerHTML = "Erro na consulta dos dados!";
        return "Erro: " + erro;
    }
    
    
}