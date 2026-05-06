import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { isValidKeysecret } from '../utils/keysecret';
import { emitUpdate } from '../index';

const router = Router();

// Mapa de rate limit em memória: keysecret → { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, maxReqs = 100, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxReqs - 1, resetTime: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxReqs - entry.count);
  return {
    allowed: entry.count <= maxReqs,
    remaining,
    resetTime: entry.resetTime,
  };
}

async function resolveUserFromKeysecret(keysecret: string) {
  const result = await query(
    `SELECT user_id FROM api_keys
     WHERE keysecret = $1 AND is_active = true
     LIMIT 1`,
    [keysecret]
  );
  if (result.rows.length === 0) return null;

  // Atualizar last_used_at
  await query(
    'UPDATE api_keys SET last_used_at = NOW() WHERE keysecret = $1',
    [keysecret]
  );

  return result.rows[0].user_id as string;
}

function extractKeysecret(req: Request): string | null {
  const headerKey = req.headers['x-keysecret'] as string | undefined;
  const authHeader = req.headers['authorization'] || '';
  const bearer = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;
  const queryKey = req.query['keysecret'] as string | undefined;
  return headerKey || bearer || queryKey || null;
}

// ─────────────────────────────────────────────
// GET /api/v1/produtos — Lista produtos ativos
// ─────────────────────────────────────────────
router.get('/produtos', async (req: Request, res: Response) => {
  const keysecret = extractKeysecret(req);

  if (!keysecret) {
    return res.status(401).json({
      code: 401,
      message: 'Missing keysecret. Use header "x-keysecret" ou "Authorization: Bearer <keysecret>" ou query param "keysecret".',
    });
  }

  if (!isValidKeysecret(keysecret)) {
    return res.status(400).json({ error: 'Formato de keysecret inválido', code: 'INVALID_KEYSECRET_FORMAT' });
  }

  const rl = checkRateLimit(keysecret);
  if (!rl.allowed) {
    return res.status(429).json({
      error: 'Taxa de requisições excedida. Tente novamente em breve.',
      code: 'RATE_LIMIT_EXCEEDED',
      retry_after: Math.ceil((rl.resetTime - Date.now()) / 1000),
    });
  }

  const userId = await resolveUserFromKeysecret(keysecret);
  if (!userId) {
    return res.status(401).json({ error: 'Keysecret inválido ou inativo', code: 'INVALID_KEYSECRET' });
  }

  try {
    const result = await query(
      `SELECT id_produto, nome, preco, categoria, variaveis, descricoes, imagens, estoque
       FROM produtos
       WHERE user_id = $1 AND ativo = true
       ORDER BY created_at DESC`,
      [userId]
    );

    const produtos = result.rows.map((p: any) => {
      const variaveis = Array.isArray(p.variaveis)
        ? p.variaveis
            .filter((v: any) => v.ativo !== false)
            .map((v: any) => ({
              id: v.id,
              nome: v.nome,
              valor: v.valor,
              estoque: v.estoque,
              imagem_url: v.imagem_url,
              preco_venda: v.preco_venda,
            }))
        : [];

      return {
        id_produto: p.id_produto,
        nome: p.nome,
        preco: p.preco,
        categoria: p.categoria,
        estoque: p.estoque,
        descricoes: p.descricoes || [],
        imagens: p.imagens || [],
        variaveis,
      };
    });

    return res.json(produtos);
  } catch (err) {
    console.error('[Public] GET produtos error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor', code: 'DATABASE_ERROR' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/v1/estoque — Atualiza estoque
// ─────────────────────────────────────────────
router.patch('/estoque', async (req: Request, res: Response) => {
  const keysecret = extractKeysecret(req);
  if (!keysecret || !isValidKeysecret(keysecret)) {
    return res.status(401).json({ error: 'Keysecret inválido', code: 'INVALID_KEYSECRET' });
  }

  const rl = checkRateLimit(keysecret);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Rate limit excedido', code: 'RATE_LIMIT_EXCEEDED' });
  }

  const userId = await resolveUserFromKeysecret(keysecret);
  if (!userId) {
    return res.status(401).json({ error: 'Keysecret inválido ou inativo', code: 'INVALID_KEYSECRET' });
  }

  const { produtos } = req.body;
  if (!Array.isArray(produtos) || produtos.length === 0 || produtos.length > 100) {
    return res.status(400).json({ error: 'produtos deve ser um array de 1 a 100 itens' });
  }

  const client = await (await import('../db/pool')).pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];

    for (const item of produtos) {
      const { id_produto, id_variavel, quantidade } = item;
      const descricao = item.descricao || req.body.descricao;
      if (!quantidade || quantidade <= 0) continue;

      // Registrar venda
      const venda = await client.query(
        `INSERT INTO vendas
          (user_id, id_produto, id_variavel, nome_produto, quantidade,
           preco_unitario, total, diminuir_estoque, tipo, descricao, keysecret)
         SELECT $1, $2, $3, nome, $4::integer, preco, preco * ($4::integer), true, 'venda', $5, $6
         FROM produtos WHERE id_produto = $2 AND user_id = $1
         RETURNING *`,
        [userId, id_produto, id_variavel ?? null, quantidade, descricao ?? null, keysecret]
      );

      // Diminuir estoque global
      await client.query(
        `UPDATE produtos SET estoque = GREATEST(0, estoque - $1::integer)
         WHERE id_produto = $2 AND user_id = $3`,
        [quantidade, id_produto, userId]
      );

      // Se tiver variável, descontar dela também
      if (id_variavel) {
        const prod = await client.query('SELECT variaveis FROM produtos WHERE id_produto = $1 AND user_id = $2 FOR UPDATE', [id_produto, userId]);
        if (prod.rows.length > 0 && prod.rows[0].variaveis) {
          const variaveis = prod.rows[0].variaveis;
          const varIndex = variaveis.findIndex((vari: any) => vari.id === id_variavel);
          if (varIndex !== -1 && typeof variaveis[varIndex].estoque === 'number') {
            variaveis[varIndex].estoque = Math.max(0, variaveis[varIndex].estoque - quantidade);
            await client.query('UPDATE produtos SET variaveis = $1 WHERE id_produto = $2 AND user_id = $3', [JSON.stringify(variaveis), id_produto, userId]);
          }
        }
      }

      if (venda.rows.length > 0) results.push(venda.rows[0]);
    }

    await client.query('COMMIT');

    // Emitir socket para frontend (para movimentações em tempo real)
    results.forEach((item: any) => {
      emitUpdate(userId, 'venda:created', item);
    });

    return res.json({ success: true, vendas: results });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Public] PATCH estoque error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/vendas — Registra venda via keysecret
// ─────────────────────────────────────────────
router.post('/vendas', async (req: Request, res: Response) => {
  const keysecret = extractKeysecret(req);
  if (!keysecret || !isValidKeysecret(keysecret)) {
    return res.status(401).json({ error: 'Keysecret inválido', code: 'INVALID_KEYSECRET' });
  }

  const rl = checkRateLimit(keysecret);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Rate limit excedido', code: 'RATE_LIMIT_EXCEEDED' });
  }

  const userId = await resolveUserFromKeysecret(keysecret);
  if (!userId) {
    return res.status(401).json({ error: 'Keysecret inválido ou inativo', code: 'INVALID_KEYSECRET' });
  }

  const { produtos } = req.body;
  if (!Array.isArray(produtos) || produtos.length === 0 || produtos.length > 100) {
    return res.status(400).json({ error: 'produtos deve ser um array de 1 a 100 itens' });
  }

  try {
    // Delega para a lógica do PATCH /estoque (mesma operação)
    req.body = { produtos };
    return res.redirect(307, '/api/v1/estoque');
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
