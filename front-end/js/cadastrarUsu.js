async function cadastrarEmail(){
    const email = document.getElementById("email").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const senha = document.getElementById("senha").value;
    const conSenha = document.getElementById("conSenha").value;
    const msgAviso = document.getElementById("msgAviso");
    msgAviso.innerHTML = "";

    // Caracteres para senha forte
    const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (nome === "") {
        msgAviso.innerHTML = "Preencha o campo de Nome!";
        document.getElementById("nome").focus();
        return;
    }else if (email === "") {
        msgAviso.innerHTML = "Preencha o campo de E-mail!";
        document.getElementById("email").focus();
        return;
    }else if (!senhaForte.test(senha)) {
        msgAviso.innerHTML = "Senha deve conter: De 8 a 16 caracteres, pelo menos 1 letra maiúscula, pelo menos 1 letra minúscula, pelo menos 1 número, pelo menos 1 caractere especial";
        document.getElementById("senha").focus();
        return;
    }else if (conSenha !== senha) {
        msgAviso.innerHTML = "As senhas não conferem!";
        document.getElementById("conSenha").focus();
        return;
    }

    try{
        const resposta = await fetch('http://localhost:8080/usuarios/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();
        
        if(dados.result){
            window.location.href = "home.html";
        }else if(dados.mensagem){
            msgAviso.innerHTML = dados.mensagem;
        }else{
            msgAviso.innerHTML = "Erro ao realizar Cadastro!";
        }
    }catch{
        msgAviso.innerHTML = "Erro na consulta dos Banco de Dados!";
        return;
    }
    
    
}


// Importação de Foto
const inputFoto = document.getElementById('fotoUsuario');
const preview = document.getElementById('imagemPreview');

inputFoto.addEventListener('change', function () {
const file = inputFoto.files[0];
if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
    preview.src = e.target.result;
    preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}
});