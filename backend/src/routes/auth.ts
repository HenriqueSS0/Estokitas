import { Router, Request, Response } from 'express';
import argon2 from 'argon2';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { query } from '../db/pool';
import { signToken, authMiddleware } from '../middleware/auth';
import { generateKeysecret } from '../utils/keysecret';
import { encryptKeysecret } from '../utils/crypto';
import { sendResetPasswordEmail } from '../utils/mailer';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas
  message: { error: 'Muitas tentativas de login ou cadastro. Tente novamente em 15 minutos.' }
});

if (!process.env.JWT_SECRET) {
  throw new Error("FALHA CRÍTICA: Variável de ambiente JWT_SECRET não configurada!");
}

// POST /api/auth/signup
router.post('/signup', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const emailNorm = email.toLowerCase().trim();

    // Verificar se já existe
    const existing = await query('SELECT id FROM users WHERE email = $1', [emailNorm]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    // Criar user
    const userResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [emailNorm, passwordHash]
    );
    const user = userResult.rows[0];

    // Criar conta
    await query('INSERT INTO contas (user_id) VALUES ($1)', [user.id]);

    // Gerar keysecret
    const keysecret = generateKeysecret();
    const keysecretEncrypted = encryptKeysecret(keysecret);

    await query(
      'INSERT INTO api_keys (user_id, keysecret, keysecret_encrypted) VALUES ($1, $2, $3)',
      [user.id, keysecret, keysecretEncrypted]
    );

    const token = signToken({ userId: user.id, email: user.email });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    return res.status(201).json({
      user: { id: user.id, email: user.email, created_at: user.created_at },
    });
  } catch (err: any) {
    console.error('[Auth] Signup error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const emailNorm = email.toLowerCase().trim();
    const result = await query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [emailNorm]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];
    const valid = await argon2.verify(user.password_hash, password);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  // Rota protegida — user já injetado pelo authMiddleware no index.ts
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: 'Não autenticado' });

  try {
    const result = await query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const emailNorm = email.toLowerCase().trim();
    const result = await query('SELECT id FROM users WHERE email = $1', [emailNorm]);
    
    // We don't want to expose if a user exists, always return success message
    if (result.rows.length === 0) {
      return res.json({ success: true, message: 'Se o email estiver cadastrado, um link de redefinição foi enviado.' });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora de validade

    await query(
      'UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3',
      [resetToken, expiresAt, user.id]
    );

    await sendResetPasswordEmail(emailNorm, resetToken);

    return res.json({ success: true, message: 'Se o email estiver cadastrado, um link de redefinição foi enviado.' });
  } catch (err) {
    console.error('[Auth] Reset password error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/reset-password/confirm
router.post('/reset-password/confirm', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const result = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const user = result.rows[0];
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    return res.json({ success: true, message: 'Senha redefinida com sucesso' });
  } catch (err) {
    console.error('[Auth] Reset password confirm error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ success: true });
});

export default router;
