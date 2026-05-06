import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { emitUpdate } from '../index';

const router = Router();

// GET /api/produtos
router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  try {
    const result = await query(
      `SELECT * FROM produtos WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[Produtos] GET error:', err);
    return res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// POST /api/produtos
router.post('/', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const {
    nome, preco, preco_compra, preco_venda, categoria,
    imagem_url, estoque, estoque_minimo, variaveis,
    descricoes, imagens, ativo,
  } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  try {
    const result = await query(
      `INSERT INTO produtos
        (user_id, nome, preco, preco_compra, preco_venda, categoria, imagem_url,
         estoque, estoque_minimo, variaveis, descricoes, imagens, ativo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        userId, nome, preco, preco_compra ?? null, preco_venda ?? preco,
        categoria ?? null, imagem_url ?? null,
        estoque ?? 0, estoque_minimo ?? 5,
        variaveis ? JSON.stringify(variaveis) : null,
        descricoes ? JSON.stringify(descricoes) : null,
        imagens ? JSON.stringify(imagens) : null,
        ativo !== false,
      ]
    );
    emitUpdate(userId, 'produto:created', result.rows[0]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[Produtos] POST error:', err);
    return res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// PUT /api/produtos/:id
router.put('/:id', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const {
    nome, preco, preco_compra, preco_venda, categoria,
    imagem_url, estoque, estoque_minimo, variaveis,
    descricoes, imagens, ativo,
  } = req.body;

  try {
    const result = await query(
      `UPDATE produtos SET
        nome = COALESCE($1, nome),
        preco = COALESCE($2, preco),
        preco_compra = COALESCE($3, preco_compra),
        preco_venda = COALESCE($4, preco_venda),
        categoria = COALESCE($5, categoria),
        imagem_url = COALESCE($6, imagem_url),
        estoque = COALESCE($7, estoque),
        estoque_minimo = COALESCE($8, estoque_minimo),
        variaveis = COALESCE($9::jsonb, variaveis),
        descricoes = COALESCE($10::jsonb, descricoes),
        imagens = COALESCE($11::jsonb, imagens),
        ativo = COALESCE($12, ativo)
       WHERE id_produto = $13 AND user_id = $14
       RETURNING *`,
      [
        nome ?? null, preco ?? null, preco_compra ?? null, preco_venda ?? null,
        categoria ?? null, imagem_url ?? null, estoque ?? null,
        estoque_minimo ?? null,
        variaveis ? JSON.stringify(variaveis) : null,
        descricoes ? JSON.stringify(descricoes) : null,
        imagens ? JSON.stringify(imagens) : null,
        ativo !== undefined ? ativo : null,
        id, userId,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    emitUpdate(userId, 'produto:updated', result.rows[0]);
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[Produtos] PUT error:', err);
    return res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// PATCH /api/produtos/:id/estoque
router.patch('/:id/estoque', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { operacao, quantidade } = req.body; // operacao: 'aumentar' | 'diminuir'

  if (!operacao || quantidade === undefined) {
    return res.status(400).json({ error: 'operacao e quantidade são obrigatórios' });
  }
  if (!['aumentar', 'diminuir'].includes(operacao)) {
    return res.status(400).json({ error: 'operacao deve ser "aumentar" ou "diminuir"' });
  }

  try {
    const op = operacao === 'aumentar' ? '+' : '-';
    const result = await query(
      `UPDATE produtos
       SET estoque = GREATEST(0, estoque ${op} $1)
       WHERE id_produto = $2 AND user_id = $3
       RETURNING *`,
      [quantidade, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    emitUpdate(userId, 'produto:updated', result.rows[0]);
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[Produtos] PATCH estoque error:', err);
    return res.status(500).json({ error: 'Erro ao atualizar estoque' });
  }
});

// DELETE /api/produtos/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM produtos WHERE id_produto = $1 AND user_id = $2 RETURNING id_produto',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    emitUpdate(userId, 'produto:deleted', { id_produto: result.rows[0].id_produto });
    return res.json({ success: true, id_produto: result.rows[0].id_produto });
  } catch (err) {
    console.error('[Produtos] DELETE error:', err);
    return res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

export default router;
