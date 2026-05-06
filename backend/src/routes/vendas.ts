import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { emitUpdate } from '../index';

const router = Router();

// GET /api/vendas
router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  try {
    const result = await query(
      `SELECT * FROM vendas WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[Vendas] GET error:', err);
    return res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
});

// POST /api/vendas — registrar uma venda
router.post('/', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const {
    id_produto, id_variavel, nome_produto,
    quantidade, preco_unitario, diminuir_estoque,
    tipo, descricao,
  } = req.body;

  if (!id_produto || !nome_produto || preco_unitario === undefined) {
    return res.status(400).json({ error: 'id_produto, nome_produto e preco_unitario são obrigatórios' });
  }

  const qtd = quantidade ?? 1;
  const total = qtd * preco_unitario;
  const tipoFinal = tipo || 'venda';
  const dimEstoque = diminuir_estoque !== false;
  const aumEstoque = req.body.aumentar_estoque !== false;

  try {
    const result = await query(
      `INSERT INTO vendas
        (user_id, id_produto, id_variavel, nome_produto, quantidade,
         preco_unitario, total, diminuir_estoque, tipo, descricao)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        userId, id_produto, id_variavel ?? null, nome_produto,
        qtd, preco_unitario, total, dimEstoque, tipoFinal, descricao ?? null,
      ]
    );

    if (dimEstoque && tipoFinal === 'venda') {
      await query(
        `UPDATE produtos SET estoque = GREATEST(0, estoque - $1)
         WHERE id_produto = $2 AND user_id = $3`,
        [qtd, id_produto, userId]
      );
    } else if (aumEstoque && tipoFinal === 'entrada') {
      await query(
        `UPDATE produtos SET estoque = estoque + $1
         WHERE id_produto = $2 AND user_id = $3`,
        [qtd, id_produto, userId]
      );
    }

    if (id_variavel) {
      const prod = await query('SELECT variaveis FROM produtos WHERE id_produto = $1 AND user_id = $2', [id_produto, userId]);
      if (prod.rows.length > 0 && prod.rows[0].variaveis) {
        const variaveis = prod.rows[0].variaveis;
        const varIndex = variaveis.findIndex((vari: any) => vari.id === id_variavel);
        if (varIndex !== -1 && typeof variaveis[varIndex].estoque === 'number') {
          if (dimEstoque && tipoFinal === 'venda') {
            variaveis[varIndex].estoque = Math.max(0, variaveis[varIndex].estoque - qtd);
          } else if (aumEstoque && tipoFinal === 'entrada') {
            variaveis[varIndex].estoque += qtd;
          }
          await query('UPDATE produtos SET variaveis = $1 WHERE id_produto = $2 AND user_id = $3', [JSON.stringify(variaveis), id_produto, userId]);
        }
      }
    }

    emitUpdate(userId, 'venda:created', result.rows[0]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[Vendas] POST error:', err);
    return res.status(500).json({ error: 'Erro ao registrar venda' });
  }
});

// POST /api/vendas/batch — múltiplas vendas
router.post('/batch', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { vendas } = req.body;

  if (!Array.isArray(vendas) || vendas.length === 0) {
    return res.status(400).json({ error: 'Array de vendas é obrigatório' });
  }
  if (vendas.length > 100) {
    return res.status(400).json({ error: 'Máximo de 100 vendas por requisição' });
  }

  const client = await (await import('../db/pool')).pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = [];

    for (const v of vendas) {
      const qtd = v.quantidade ?? 1;
      const total = qtd * v.preco_unitario;
      const tipo = v.tipo || 'venda';
      const dimEstoque = v.diminuir_estoque !== false;
      const aumEstoque = v.aumentar_estoque !== false;

      const r = await client.query(
        `INSERT INTO vendas
          (user_id, id_produto, id_variavel, nome_produto, quantidade,
           preco_unitario, total, diminuir_estoque, tipo, descricao)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [userId, v.id_produto, v.id_variavel ?? null, v.nome_produto, qtd,
         v.preco_unitario, total, dimEstoque, tipo, v.descricao ?? null]
      );
      inserted.push(r.rows[0]);

      if (dimEstoque && tipo === 'venda') {
        await client.query(
          `UPDATE produtos SET estoque = GREATEST(0, estoque - $1)
           WHERE id_produto = $2 AND user_id = $3`,
          [qtd, v.id_produto, userId]
        );
      } else if (aumEstoque && tipo === 'entrada') {
        await client.query(
          `UPDATE produtos SET estoque = estoque + $1
           WHERE id_produto = $2 AND user_id = $3`,
          [qtd, v.id_produto, userId]
        );
      }

      if (v.id_variavel) {
        const prod = await client.query('SELECT variaveis FROM produtos WHERE id_produto = $1 AND user_id = $2 FOR UPDATE', [v.id_produto, userId]);
        if (prod.rows.length > 0 && prod.rows[0].variaveis) {
          const variaveis = prod.rows[0].variaveis;
          const varIndex = variaveis.findIndex((vari: any) => vari.id === v.id_variavel);
          if (varIndex !== -1 && typeof variaveis[varIndex].estoque === 'number') {
            if (dimEstoque && tipo === 'venda') {
              variaveis[varIndex].estoque = Math.max(0, variaveis[varIndex].estoque - qtd);
            } else if (aumEstoque && tipo === 'entrada') {
              variaveis[varIndex].estoque += qtd;
            }
            await client.query('UPDATE produtos SET variaveis = $1 WHERE id_produto = $2 AND user_id = $3', [JSON.stringify(variaveis), v.id_produto, userId]);
          }
        }
      }
    }

    await client.query('COMMIT');

    // Emitir socket event para cada venda inserida
    inserted.forEach((item: any) => {
      emitUpdate(userId, 'venda:created', item);
    });

    return res.status(201).json(inserted);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Vendas] Batch error:', err);
    return res.status(500).json({ error: 'Erro ao registrar vendas' });
  } finally {
    client.release();
  }
});

export default router;
