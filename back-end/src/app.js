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
import cors from 'cors';

// Criando e configurando app
const app = express();

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
}));


// Configurando a sessão para o usuário ao logar
app.use(session({
    secret: 'sua_chave_secreta_segura',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Defina como true se estiver usando HTTPS
        httpOnly: true, // Recomendar para segurança
        maxAge: 24 * 60 * 60 * 1000 // Exemplo: 24 horas
    }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Configurando servidor para que seja feita a verifcação de projetos vencidos e/ou pendentes de todos os usuários a meia-noite ou quando o servidor for iniciado
import { atualizaStatus } from './controllers/utils.js';

// Resolve o caminho correto do JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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

// Aumentar o limite do tamanho do corpo da requisição
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Tornando todas as pastas de arquivos públicas para o código
// app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'anexoAtividades')));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'anexoProjetos')));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'anexoSubTarefas')));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'anexoTarefas')));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'imgUsuarios')));

// Permitir acesso à pasta 'uploads' publicamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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

import fs from 'fs/promises';
import admin from 'firebase-admin';

const serviceAccountPath = path.join(__dirname, '../taskflow-e3792-firebase-adminsdk-fbsvc-aa90328693.json');
const serviceAccountJSON = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));

// Serve arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../front-end')));

app.get("/test-session", (req, res) => {
  res.json(req.session);
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJSON)
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/index.html'));
});

export default app;
