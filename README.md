# DSM-P3-G09-2025-1
Repositório do GRUPO 09 do Projeto Interdisciplinar do 3º semestre DSM 2025/1. Alunos: Larissa Coutinho Ferreira, Luís Pedro Dutra Carrocini, Maria Luiza Barbosa.

---
<br>

# PI 3° Semestre - MeNotes (Um site para Gerenciamento de Projetos e Tarefas - Empresariais ou Pessoais)

Este projeto é o terceiro PI (Projeto Interdisciplinar) do curso de DSM (Desenvolvimento de Software Multiplataforma) da Faculdade de Tecnologia Fatec Franca Dr. Thomaz Novelino. Seu objetivo é integrar os conhecimentos adquiridos nas principais disciplinas do terceiro semestre: Gestão Ágil de Projetos de Software, Interação Humano-Computador e Banco de Dados Não Relacional. O resultado é um site de organização de tarefas e projetos voltado tanto para usuários comuns quanto para empresas que desejam organizar melhor suas demandas de atividades.

O site foi desenvolvido utilizando HTML5, CSS3 e JavaScript, além de Node.js, Prisma e MongoDB, abrangendo tanto a parte visual quanto a funcional da aplicação.

<br><br>

## 📄 Descrição

O site apresenta as seguintes páginas e funcionalidades:

### Usuário não logado:
* **Index**: Apresenta brevemente a aplicação, destacando seu objetivo, problema que resolve, quem a criou e convidando o usuário a experimentá-la.
* **Login**: Permite o acesso do usuário à sua área, desde que informe e-mail e senha corretamente.
* **Cadastrar-se**: Permite o cadastro do usuário no site. São solicitados: e-mail, nome e, opcionalmente, uma foto. Após o cadastro, o usuário é redirecionado para sua área.

### Usuário cadastrado e logado:
* **Home**: Exibe todos os projetos nos quais o usuário está envolvido, seja como gestor, administrador ou membro comum. Os projetos são organizados por nível de responsabilidade e status (pendentes, atrasados ou concluídos).
* **Projeto**: Permite a análise de desempenho de um projeto, apresentando suas tarefas em uma linha do tempo ajustável. Cada tarefa possui subtarefas e, dentro delas, atividades realizadas pelos usuários responsáveis.
* **Dados do usuário**: Exibe os dados informados no cadastro, com opção de edição ou exclusão da conta.


### Níveis de acesso do usuário nos projetos:

* **Gestor**: Nível mais alto. Pode gerenciar membros e administradores, criar, editar ou excluir tarefas, subtarefas e atividades. Também pode editar ou excluir o projeto e transferir sua função de gestor. O gestor é o criador do projeto e só pode haver um. Se excluir sua conta sem transferir a gestão, o projeto será excluído.
* **Administrador**: Auxilia o gestor. Pode criar, editar e excluir tarefas, subtarefas e atividades, mas não pode gerenciar usuários.
* **Membro comum**: Pode realizar atividades nas subtarefas atribuídas a ele. Pode editar ou excluir apenas suas próprias atividades.


### Estrutura dos Projetos:
<img src="/prints/estrutura-projetos.png">

<br><br>

## 🏆 Figma do Projeto
### 🥇 [Alta Fidelidade]()
### 🥈 [Baixa Fidelidade]()

<br><br>

## 📁 Documentação do Projeto
### 📓 [Memorial Descritivo](https://github.com/FatecFranca/DSM-P3-G09-2025-1/raw/main/docs/Memorial-Descritivo.pdf)
### 📕 [Relacionamentos de Coleções](https://github.com/FatecFranca/DSM-P3-G09-2025-1/raw/main/docs/Justificativa-Relacionamento-Colecoes.pdf)
### 🕔 [Cronograma]()
### 📒 [Documento Final]()
### 💎 [Portfólio do Projeto]()
### 🎬 [Vídeo de Apresentação]()

<br><br>

## 📦 Aparência

### Página Inicial
<img src="/prints">

### Login e Cadastro
<img src="/prints/">

### Página Home do Usuário
<img src="/prints/">

### Criar (Projeto, Tarefa, Subtarefa e Atividade)
<img src="/prints/">

### Alterar Dados
<img src="/prints/">

### Tarefas
<img src="/prints/">

### Subtarefas
<img src="/prints/">

### Atividades
<img src="/prints/">

### Responsividade
<img src="/prints/">

<br><br>

## 📃 Obter uma cópia

Para obter uma cópia, basta baixar todos os arquivos deste repositório.

<br><br>

## 📋 Pré-requisitos

Para o funcionamento pleno do site é necessário:

* Um navegador com suporte a JavaScript e acesso à internet.
* Ter o banco de dados MongoDB instalado localmente ou acessível na nuvem (ajustes no SGBD podem ser necessários conforme o ambiente).

<br><br>

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
9. Abra o arquivo `index.html` da pasta `/front-end/` em seu navegador.

<br><br>

## 🛠️ Construído com

**Ferramentas:**
* Visual Studio Code - Editor de código-fonte
* Draw.io - Diagramas
* Canvas - Portfólio e diagramas
* Postman - Testes de API
* Figma - Protótipos da aplicação

**Linguagens e Tecnologias:**
* Bootstrap - Ícones e interface
* HTML5 - Linguagem de marcação
* JavaScript - Lógica da aplicação
* CSS3 - Estilização
* MongoDB - Banco de dados
* Prisma ORM - Interface com o banco de dados

<br><br>

## ✒️ Autores

* **[Larissa Coutinho Ferreira](https://github.com/LarissaCoutinhoo)** — Protótipos (alta e baixa fidelidade), Front-end  
* **[Luís Pedro Dutra Carrocini](https://github.com/luis-pedro-dutra-carrocini)** — Documentação, Banco de dados, Back-end, Integração Front-back  
* **[Maria Luiza Barbosa](https://github.com/mluizabss)** — Portfólio da aplicação, Front-end

<br><br>

## 🎁 Agradecimentos

Agradecemos aos professores que nos acompanharam no curso, especialmente nas disciplinas fundamentais para este projeto:

* **[Prof. Alessandro Rodrigues](https://www.linkedin.com/in/alessandro-rodrigues-da-silva-a53880104/?originalSubdomain=br)** — Gestão Ágil de Projetos de Software  
* **[Prof. Carlos Roland](https://www.instagram.com/ceroland/)** — Interação Humano-Computador  
* **[Prof. Fausto Cintra](https://gist.github.com/faustocintra)** — Banco de Dados Não Relacional

---

Este site foi desenvolvido no início de nossa jornada acadêmica. Temos orgulho deste projeto por ser um dos nossos primeiros — e o primeiro com banco de dados não relacional! Releve nosso "código de iniciante" 😊.  
Esperamos que seja útil para você em algum projeto! ❤️
