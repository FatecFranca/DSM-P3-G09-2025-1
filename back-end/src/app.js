// Importando bibliotecas necessárias
import express, { json, urlencoded } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cron from 'node-cron';

// Importando e atribuindo rotas padrões necessárias
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

// Criando e configurando app
const app = express();
app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Configurando a sessão para o usuário ao logar
app.use(session({
    secret: 'sua_chave_secreta_segura',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 50 } // 50 minutos
}));


// Configurando servidor para que seja feita a verifcação de projetos vencidos e/ou pendentes de todos os usuários a meia-noite ou quando o servidor for iniciado
import { atualizaStatus } from './controllers/utils.js';


// Na inicialização do servidor
(async () => {
    console.log("Verificando status de projetos na inicialização...");
    try {
        await atualizaStatus();
        console.log("Status atualizado com sucesso.");
    } catch (err) {
        console.error("Erro ao atualizar status na inicialização:", err);
    }
})();

// Todos os dias meia-noite
cron.schedule('0 0 * * *', async () => {
    console.log('Executando atualização de status às 00:00');
    try {
        await atualizaStatus();
        console.log("Status atualizado com sucesso as 00:00");
    } catch (err) {
        console.error('Erro ao atualizar status automático:', err);
    }
});


// Configurando pastas para a adição de anexos e imagens de usuário e projetos
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tornando todas as pastas de arquivos públicas para o código
app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'anexoAtividades')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'anexoProjetos')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'anexoSubTarefas')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'anexoTarefas')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'imgUsuarios')));


// Sessão de Rotas
import usuariosRouter from './routes/usuarios.js';
app.use('/usuarios', usuariosRouter);

import projetosRouter from './routes/projetos.js';
app.use('/projetos', projetosRouter);

import tarefasRouter from './routes/tarefas.js';
app.use('/tarefas', tarefasRouter);

import subTarefasRouter from './routes/subtarefas.js';
app.use('/subtarefas', subTarefasRouter);

import atividadesRouter from './routes/atividades.js';
app.use('/atividades', atividadesRouter);

import notificacoesRouter from './routes/notificacoes.js';
app.use('/notificacoes', notificacoesRouter);

export default app;
