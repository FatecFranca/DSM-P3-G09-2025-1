function logarGoogle(){
    const firebaseConfig = {
        apiKey: "AIzaSyDAWiRqNMsnHbWkqAQqDazvSQUsHvXI78E",
        authDomain: "taskflow-e3792.firebaseapp.com",
        projectId: "taskflow-e3792",
        storageBucket: "taskflow-e3792.appspot.com",
        messagingSenderId: "39013078328",
        appId: "1:39013078328:web:c8638a77dcb03a1b17ddcd",
        measurementId: "G-ZCQ23TE312"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
    .then(async result => {
        const user = result.user;
        const idToken = await user.getIdToken(); // Pega o token JWT

        fetch('http://localhost:8080/usuarios/verificar-usuario-google/true', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: idToken })
        })
        .then(response => {
            if (!response.ok) throw new Error("Usuário não autorizado.");
            return response.json();
        })
        .then(data => {
            window.location.href = "home.html";
        })
        .catch(err => {
            alert("Erro ao validar login: " + err.message);
        });
    });
}

async function logarEmail(){
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const msgAviso = document.getElementById("msgAviso");
    msgAviso.innerHTML = "";

    if (email === "") {
        msgAviso.innerHTML = "Preencha o campo de E-mail!";
        document.getElementById("email").focus();
        return;
    }else if (senha === "") {
        msgAviso.innerHTML = "Preencha o campo de Senha!";
        document.getElementById("senha").focus();
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
            window.location.href = "home.html";
        }else if(dados.mensagem){
            msgAviso.innerHTML = dados.mensagem;
        }else{
            msgAviso.innerHTML = "Erro ao realizar login!";
        }
    }catch{
        msgAviso.innerHTML = "Erro na consulta dos Banco de Dados!";
        return;
    }
    
    
}

async function sessaoIni(){
    const resposta = await fetch('http://localhost:8080/usuarios/verificaSessao/true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    const dados = await resposta.json();

    if(dados.result){
        window.location.href = "home.html";
    }
        
}

async function sessaoIniGeral(){
    const resposta = await fetch('http://localhost:8080/usuarios/verificaSessao/true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    const dados = await resposta.json();

    if(!dados.result){
        return window.location.href = "login.html";
    }else{
        return dados;
    }
        
}