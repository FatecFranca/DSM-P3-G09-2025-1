# DSM-P3-G09-2025-1
Repositório do GRUPO 09 do Projeto Interdisciplinar do 3º semestre DSM 2025/1. Alunos: Larissa Coutinho Ferreira, Luís Pedro Dutra Carrocini, Maria Luiza Barbosa (Trancou o curso).

---
<br>

# PI 3° Semestre - Taskflow (Um site para Gerenciamento de Projetos e Tarefas - Empresariais ou Pessoais)

Este projeto é o terceiro PI (Projeto Interdisciplinar) do curso de DSM (Desenvolvimento de Software Multiplataforma) da Faculdade de Tecnologia Fatec Franca Dr. Thomaz Novelino. Seu objetivo é integrar os conhecimentos adquiridos nas principais disciplinas do terceiro semestre: Gestão Ágil de Projetos de Software, Interação Humano-Computador e Banco de Dados Não Relacional. O resultado é um site de organização de tarefas e projetos voltado, tanto para usuários comuns, quanto para empresas que desejam organizar melhor suas demandas de atividades.

O site foi desenvolvido utilizando HTML5, CSS3 e JavaScript, além de Node.js, Prisma e MongoDB, abrangendo tanto a parte visual quanto a funcional da aplicação.

<br>

## 📄 Descrição

O site apresenta as seguintes páginas e funcionalidades:

### Usuário não logado:
* **Index**: Apresenta brevemente a aplicação, destacando seu objetivo, problema que resolve, e convidando o usuário a experimentá-la.
* **Login**: Permite o acesso do usuário à sua área, desde que informe e-mail e senha corretamente.
* **Cadastrar-se**: Permite o cadastro do usuário no site. São solicitados: e-mail, nome e, opcionalmente, uma foto. Após o cadastro, o usuário é redirecionado para sua área.

### Usuário cadastrado e logado:
* **Home**: Exibe todos os projetos nos quais o usuário está envolvido, seja como gestor, administrador ou membro comum. Os projetos são organizados por nível de responsabilidade e status (pendentes, atrasados ou concluídos). Permitindo também que o usuário crie um novo projeto, altere as suas informações e gerencie os envolvidos do projeto. 
* **Projeto -> Tarefas -> Subtarefas -> Atividades**: Permite a análise de desempenho de um projeto, apresentando suas tarefas em uma linha do tempo ajustável. Cada tarefa possui subtarefas e, dentro delas, atividades realizadas pelos usuários responsáveis.
* **Dados do usuário**: Exibe os dados informados no cadastro, com opção de edição ou exclusão da conta.
* **Notificações**: Exibe as notificações sobre as demandas de subtarefas, enviadas automaticamente pelo sistemaa aos usuários.

### Níveis de acesso do usuário nos projetos:
* **Gestor**: Nível mais alto. Pode gerenciar membros e administradores, criar, editar ou excluir tarefas, subtarefas e atividades do projeto. Também pode editar ou excluir o projeto e transferir sua função de gestor para um administrador do projeto. O gestor é o criador do projeto e só pode haver um. Se excluir sua conta sem transferir a gestão, o projeto será excluído.
* **Administrador**: Auxilia o gestor. Pode criar, editar e excluir tarefas, subtarefas e atividades, mas não pode gerenciar usuários.
* **Membro comum**: Pode realizar atividades nas subtarefas atribuídas a ele. Pode editar ou excluir apenas suas próprias atividades.

### Estrutura dos Projetos:
<img src="/prints/estrutura-projetos.png">

<br>

## 🏆 Protótipos
### 🥇 [Alta Fidelidade]()
### 🥈 [Baixa Fidelidade]()
### 🥉 [Rabiscoframe]()

<br>

## 📁 Documentação do Projeto
### 📓 [Memorial Descritivo](https://github.com/FatecFranca/DSM-P3-G09-2025-1/raw/main/docs/Memorial-Descritivo.pdf)
### 📕 [Relacionamentos de Coleções](https://github.com/FatecFranca/DSM-P3-G09-2025-1/raw/main/docs/Justificativa-Relacionamento-Colecoes.pdf)
### 🕔 [Cronograma](https://github.com/FatecFranca/DSM-P3-G09-2025-1/raw/main/docs/Conograma-Desenvolvimento-Depois-Entrega.pdf)
### 📒 [Documento Final]()
### 💎 [Portfólio do Projeto]()
### 🎬 [Vídeo de Apresentação]()

<br>

## 📦 Aparência

### Dasktop
#### Página Inicial
<img src="/prints/normal/print-index1.png">
<img src="/prints/normal/print-index2.png">
<img src="/prints/normal/print-index3.png">

#### Sobre
<img src="/prints/normal/print-sobre.png">

#### Contato
<img src="/prints/normal/print-contato.png">

#### Cadastrar-se
<img src="/prints/normal/print-cadastrarUsuario.png">

#### Login
<img src="/prints/normal/print-login.png">

#### Home / Projetos
<img src="/prints/normal/print-home.png">

#### Tarefas / Subtarefas
<img src="/prints/normal/print-tarefasSubtarefas.png">

#### Atividades
<img src="/prints/normal/print-atividades.png">

#### Notificações
<img src="/prints/normal/print-notificacoes.png">

#### Gerenciar Perfil
<img src="/prints/normal/print-perfil.png">

### Mobile

#### Página Inicial
<img src="/prints/mobile/mobile-index.png">

#### Sobre / Contato
<img src="/prints/mobile/mobile-sobre.png">

#### Login / Cadastrar-se
<img src="/prints/mobile/mobile-login.png">

#### Home
<img src="/prints/mobile/mobile-home.png">

#### Gerenciar Perfil / Notificações
<img src="/prints/mobile/mobile-notificacao.png">

<br><br>

## 📃 Obter uma cópia

Para obter uma cópia, basta baixar todos os arquivos deste repositório e seguir os passos para a instalação logo abaixo.

<br>

## 📋 Pré-requisitos

Para o funcionamento pleno do site é necessário:

* Um navegador com suporte a JavaScript e acesso à internet.
* Ter o banco de dados MongoDB instalado localmente ou acessível na nuvem (ajustes no SGBD podem ser necessários conforme o ambiente).

<br>

## 🔧 Instalação

1. Baixe os arquivos e pastas deste repositório e coloque-os em uma pasta local.
2. Certifique-se de estar conectado à internet.
3. Ative o JavaScript em seu navegador.
4. [Baixe](https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.4-signed.msi) o MongoDB Community Server.
5. Para consultas, [baixe](https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.4-signed.msi) o MongoDB Compass.
6. Configure o MongoDB conforme este [passo a passo](https://faustocintra.com.br/desenvolvimento-back-end/configurando-o-mongodb-server-local-para-uso-com-prisma-orm/), caso use localmente.
7. No terminal, dentro da pasta `/back-end/`, execute:  
   ```
   npx prisma generate
   ```
8. Ainda no terminal, execute:  
   ```
   npm run dev
   ```
9. Digite a URLL (http://localhost:8080/) em seu navegador, se seu ambiente estiver configurado corretmante, será carregado o site.

<br>

## 🛠️ Construído com

**Ferramentas:**
* Visual Studio Code - Editor de código-fonte
* Draw.io - Diagramas
* Canvas - Portfólio e diagramas
* Postman - Testes de API (Back-End)
* Figma - Protótipos da aplicação
* IA's (ChatGPT e Gemini) - Consultas para crição de códigos diversos, correção de bugs e melhoria em performance
* Bootstrap - Ícones para o site

**Linguagens e Tecnologias:**
* HTML5 - Linguagem de marcação
* JavaScript - Lógica da aplicação
* CSS3 - Estilização
* MongoDB - Banco de dados
* Prisma ORM - Interface com o banco de dados

<br>

## ✒️ Autores

* **[Larissa Coutinho Ferreira](https://github.com/LarissaCoutinhoo)** — Criação da última versão do Portifólio, Criação dos Protótipos (Alta e Baixa Fidelidade) e Criação do Front-end; 
* **[Luís Pedro Dutra Carrocini](https://github.com/luis-pedro-dutra-carrocini)** — Criação da Documentação (Requisitos), Criação do Banco de Dados não Relacional, Criação do Back-end, Participação no Front-end e Integração Front-end / Back-end;
* **[Maria Luiza Barbosa](https://github.com/mluizabss)** — Criação da primeira versão Portfólio da aplicação (No meio do semestre trancou o curso);

<br>

## 🎁 Agradecimentos

Agradecemos aos professores que nos acompanharam no curso, e durante esse semestre inteiro, transmitindo seus conehecimentos para nós. Somos gratos especialmente aos das disciplinas fundamentais para este projeto:

* **[Prof. Alessandro Rodrigues](https://www.linkedin.com/in/alessandro-rodrigues-da-silva-a53880104/?originalSubdomain=br)** — Gestão Ágil de Projetos de Software;
* **[Prof. Carlos Roland](https://www.instagram.com/ceroland/)** — Interação Humano-Computador;
* **[Prof. Fausto Cintra](https://gist.github.com/faustocintra)** — Banco de Dados Não Relacional;

---

Este site foi desenvolvido no início de nossa jornada acadêmica. Temos orgulho deste projeto por ser um dos nossos primeiros — e o primeiro com banco de dados não relacional! Releve nosso "código de iniciante" 😊.  
Esperamos que seja útil para você em algum projeto! ❤️
