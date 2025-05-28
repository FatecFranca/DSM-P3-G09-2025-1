let dadosSessao = null;
let imagemAtual = null;
let deletarImagem = false;

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
            imagemAtual = dadosUsuario.foto;
            document.getElementById("imagemPreview").src = "http://localhost:8080/uploads/imgUsuarios/"+dadosUsuario.foto;
        }
    }else{
        return window.location.href = "login.html";
    }
}

async function alterarDados(){
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senhaAtual = document.getElementById("senhaAtual").value;
    const msgAviso = document.getElementById("msgAviso");
    const fotoUsuario = document.getElementById('fotoUsuario').files[0];
    let novaSenha = document.getElementById("novaSenha").value;

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

    if (deletarImagem) {
        fotoUsuario = null;
    }else if (fotoUsuario !== null) {
        if (imagemAtual !== null) {
            fotoUsuario = imagemAtual;
        }
    }

    const formData = new FormData();
    formData.append('fotoUsuario', fotoUsuario);
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('senha', novaSenha);
    formData.append('senha_atual', senhaAtual);

    const resposta = await fetch('http://localhost:8080/usuarios/', {
        method: 'PUT',
        credentials: 'include',
        body: formData
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

async function encerrarSessao() {
    if (!confirm("Deseja realmente sair?")) {
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

function deletarFoto() {
    const imagemPreview = document.getElementById("imagemPreview");
    imagemPreview.src = "img/icones/fotodeperfil.png";
    imagemAtual = null;
    deletarImagem = true;
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
    deletarImagem = false;
}
});