import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { generateKeysecret } from '../utils/keysecret';
import { encryptKeysecret, decryptKeysecret } from '../utils/crypto';

const router = Router();

// GET /api/conta
router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  try {
    const contaResult = await query(
      'SELECT id, user_id, subscribed, created_at FROM contas WHERE user_id = $1',
      [userId]
    );

    const apiKeyResult = await query(
      `SELECT id, user_id, keysecret_encrypted, created_at, last_used_at, is_active, last_rotated_at
       FROM api_keys WHERE user_id = $1 AND is_active = true
       LIMIT 1`,
      [userId]
    );

    let apiKey = null;
    if (apiKeyResult.rows.length > 0) {
      const row = apiKeyResult.rows[0];
      const decrypted = row.keysecret_encrypted
        ? decryptKeysecret(row.keysecret_encrypted)
        : '';
      apiKey = {
        id: row.id,
        user_id: row.user_id,
        keysecret: decrypted,
        keysecret_encrypted: row.keysecret_encrypted,
        created_at: row.created_at,
        last_used_at: row.last_used_at,
        is_active: row.is_active,
        last_rotated_at: row.last_rotated_at,
      };
    }

    return res.json({
      conta: contaResult.rows[0] ?? null,
      apiKey,
    });
  } catch (err) {
    console.error('[Conta] GET error:', err);
    return res.status(500).json({ error: 'Erro ao buscar conta' });
  }
});

// POST /api/conta/api-key — gerar nova keysecret (ou rotacionar)
router.post('/api-key', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  try {
    // Revogar antigas
    await query(
      'UPDATE api_keys SET is_active = false WHERE user_id = $1',
      [userId]
    );

    const keysecret = generateKeysecret();
    const keysecretEncrypted = encryptKeysecret(keysecret);

    const result = await query(
      `INSERT INTO api_keys (user_id, keysecret, keysecret_encrypted, last_rotated_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, user_id, keysecret_encrypted, created_at, last_used_at, is_active`,
      [userId, keysecret, keysecretEncrypted]
    );

    const row = result.rows[0];
    return res.status(201).json({
      id: row.id,
      user_id: row.user_id,
      keysecret,
      keysecret_encrypted: row.keysecret_encrypted,
      created_at: row.created_at,
      last_used_at: row.last_used_at,
      is_active: row.is_active,
    });
  } catch (err) {
    console.error('[Conta] POST api-key error:', err);
    return res.status(500).json({ error: 'Erro ao gerar API key' });
  }
});

// DELETE /api/conta/api-key — revogar keysecret
router.delete('/api-key', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  try {
    await query(
      'UPDATE api_keys SET is_active = false WHERE user_id = $1',
      [userId]
    );
    return res.json({ success: true, message: 'API key revogada com sucesso' });
  } catch (err) {
    console.error('[Conta] DELETE api-key error:', err);
    return res.status(500).json({ error: 'Erro ao revogar API key' });
  }
});

export default router;
