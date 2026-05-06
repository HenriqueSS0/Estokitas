import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import produtosRoutes from './routes/produtos';
import vendasRoutes from './routes/vendas';
import contaRoutes from './routes/conta';
import publicRoutes from './routes/public';
import { pool } from './db/pool';
import fs from 'fs';
import path from 'path';

const app = express();
const server = http.createServer(app);

if (!process.env.FRONTEND_URL) {
  throw new Error("FALHA CRÍTICA: Variável de ambiente FRONTEND_URL não configurada!");
}
const FRONTEND_URL = process.env.FRONTEND_URL;

// ── Socket.IO ──────────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Mapa de userId → socketId para emissão direcionada
const userSockets = new Map<string, string>();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    userSockets.set(userId, socket.id);
    console.log(`[Socket.IO] User connected: ${userId}`);
  }

  socket.on('disconnect', () => {
    if (userId) {
      userSockets.delete(userId);
      console.log(`[Socket.IO] User disconnected: ${userId}`);
    }
  });
});

// Exportar função para emitir eventos de update
export function emitUpdate(userId: string, event: string, data: any) {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
}

// ── Middlewares ────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── Rotas públicas (API externa via keysecret) ─────────────
app.use('/api/v1', publicRoutes);

// ── Rotas de autenticação ──────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Rotas protegidas (JWT) ─────────────────────────────────
app.use('/api/produtos', authMiddleware, produtosRoutes);
app.use('/api/vendas', authMiddleware, vendasRoutes);
app.use('/api/conta', authMiddleware, contaRoutes);

// ── Health check ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error handler ──────────────────────────────────────────
app.use(errorHandler);

// ── Migrations automáticas na inicialização ────────────────
async function runMigrations() {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, 'db', 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();
    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      console.log(`[Migrate] Running: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await client.query(sql);
    }
    console.log('[Migrate] ✓ Done');
  } catch (err) {
    console.error('[Migrate] Error:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ── Start ──────────────────────────────────────────────────
if (!process.env.PORT) {
  throw new Error("FALHA CRÍTICA: Variável de ambiente PORT não configurada!");
}
const PORT = parseInt(process.env.PORT);

async function start() {
  // Aguarda o banco estar disponível (retry)
  let retries = 10;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('[DB] Connected ✓');
      break;
    } catch {
      retries--;
      console.log(`[DB] Waiting for database... (${retries} retries left)`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  if (retries === 0) {
    console.error('[DB] Could not connect to database. Exiting.');
    process.exit(1);
  }

  await runMigrations();

  server.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[Socket.IO] Realtime enabled`);
  });
}

start();
