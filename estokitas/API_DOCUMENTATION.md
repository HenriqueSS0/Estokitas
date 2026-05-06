# Estokitas API Documentation

## Autenticação

Todas as requisições à API exigem o header `x-keysecret` contendo sua chave de API.

```bash
x-keysecret: lk_sua_chave_aqui
```

---

## Endpoints

### 1. Listar Produtos

Lista todos os produtos ativos da sua conta.

**Endpoint:** `[SUA_URL_DO_SUPABASE]/functions/v1/produtos-list`  
**Método:** `GET`  
**Headers:**
```
x-keysecret: lk_sua_chave_aqui
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id_produto": "f68f2d0730c494598b7c166ee716866f2be2772b6c7b9d0b68de8d206a33a737",
    "nome": "Nike Dunk Low",
    "preco": 485.90,
    "categoria": "Calçados",
    "estoque": 7,
    "descricoes": ["Tênis Nike Dunk Low"],
    "imagens": ["https://exemplo.com/imagem.jpg"],
    "variaveis": [
      {
        "id": "1762540110879",
        "nome": "Azul",
        "valor": "",
        "estoque": 6,
        "imagem_url": "https://exemplo.com/azul.jpg",
        "preco_venda": 485.90
      }
    ]
  }
]
```

**Erros Comuns:**
```json
// 401 - Chave de API ausente
{
  "code": 401,
  "message": "Missing authorization header"
}

// 400 - Formato de chave inválido
{
  "error": "Formato de keysecret inválido",
  "code": "INVALID_KEYSECRET_FORMAT"
}

// 429 - Limite de requisições excedido
{
  "error": "Taxa de requisições excedida. Tente novamente em breve.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 30
}
```

---

### 2. Diminuir Estoque (Registrar Vendas)

Diminui o estoque de produtos e registra as vendas no sistema.

**Endpoint:** `[SUA_URL_DO_SUPABASE]/functions/v1/produtos-estoque`  
**Método:** `POST`  
**Headers:**
```
x-keysecret: lk_sua_chave_aqui
Content-Type: application/json
```

**Body:**
```json
{
  "produtos": [
    {
      "id_produto": "f68f2d0730c494598b7c166ee716866f2be2772b6c7b9d0b68de8d206a33a737",
      "quantidade": 2,
      "descricao": "Venda loja física"
    }
  ],
  "descricao": "Descrição geral da venda"
}
```

**Body com Variável:**
```json
{
  "produtos": [
    {
      "id_variavel": "1762540110879",
      "quantidade": 1,
      "descricao": "Venda do produto azul"
    }
  ]
}
```

**Resposta de Sucesso (200):**
```json
{
  "status": "sucesso",
  "mensagem": "Estoque atualizado com sucesso.",
  "produtos_atualizados": [
    {
      "id_produto": "f68f2d0730c494598b7c166ee716866f2be2772b6c7b9d0b68de8d206a33a737",
      "estoque_restante": 5,
      "venda_registrada": true
    }
  ]
}
```

**Erros Comuns:**
```json
// 404 - Produto não encontrado
{
  "error": "Produto não encontrado",
  "code": "PRODUCT_NOT_FOUND",
  "id_produto": "..."
}

// 409 - Estoque insuficiente
{
  "error": "Estoque insuficiente",
  "code": "INSUFFICIENT_STOCK",
  "id_produto": "...",
  "estoque_disponivel": 3,
  "quantidade_solicitada": 5
}
```

---

### 3. Atualizar Estoque (Aumentar/Diminuir)

Aumenta ou diminui o estoque de um produto ou variável específica.

**Endpoint:** `[SUA_URL_DO_SUPABASE]/functions/v1/produtos-estoque-variavel`  
**Método:** `POST`  
**Headers:**
```
x-keysecret: lk_sua_chave_aqui
Content-Type: application/json
```

**Body (Produto Principal):**
```json
{
  "id_produto": "f68f2d0730c494598b7c166ee716866f2be2772b6c7b9d0b68de8d206a33a737",
  "quantidade": 10,
  "operacao": "aumentar"
}
```

**Body (Variável):**
```json
{
  "id_produto": "f68f2d0730c494598b7c166ee716866f2be2772b6c7b9d0b68de8d206a33a737",
  "id_variavel": "1762540110879",
  "quantidade": 5,
  "operacao": "diminuir"
}
```

**Parâmetros:**
- `id_produto` (obrigatório): ID do produto
- `id_variavel` (opcional): ID da variável específica
- `quantidade` (obrigatório): Quantidade a adicionar/remover
- `operacao` (opcional): `"aumentar"` ou `"diminuir"` (padrão: `"diminuir"`)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "produto": {
    "id_produto": "...",
    "nome": "Nike Dunk Low",
    "estoque": 17,
    "variaveis": [...]
  },
  "estoque_atualizado": 17
}
```

---

## Rate Limiting

Todas as requisições têm limites de taxa por chave de API:

- **produtos-list**: 100 requisições por minuto
- **produtos-estoque**: 60 requisições por minuto  
- **produtos-estoque-variavel**: 60 requisições por minuto

Quando o limite é excedido, a API retorna status `429` com o header `retry_after` indicando quantos segundos aguardar.

---

## Exemplos de Uso

### JavaScript/TypeScript

```typescript
// Listar produtos
const response = await fetch(
  '[SUA_URL_DO_SUPABASE]/functions/v1/produtos-list',
  {
    headers: {
      'x-keysecret': 'lk_sua_chave_aqui'
    }
  }
);
const produtos = await response.json();

// Registrar venda
const vendaResponse = await fetch(
  '[SUA_URL_DO_SUPABASE]/functions/v1/produtos-estoque',
  {
    method: 'POST',
    headers: {
      'x-keysecret': 'lk_sua_chave_aqui',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      produtos: [
        {
          id_produto: 'f68f2d...',
          quantidade: 2
        }
      ]
    })
  }
);
const resultado = await vendaResponse.json();
```

### cURL

```bash
# Listar produtos
curl -X GET \
  '[SUA_URL_DO_SUPABASE]/functions/v1/produtos-list' \
  -H 'x-keysecret: lk_sua_chave_aqui'

# Registrar venda
curl -X POST \
  '[SUA_URL_DO_SUPABASE]/functions/v1/produtos-estoque' \
  -H 'x-keysecret: lk_sua_chave_aqui' \
  -H 'Content-Type: application/json' \
  -d '{
    "produtos": [
      {
        "id_produto": "f68f2d0730c494598b7c166ee716866f2be2772b6c7b9d0b68de8d206a33a737",
        "quantidade": 2
      }
    ]
  }'
```

### Python

```python
import requests

# Listar produtos
headers = {
    'x-keysecret': 'lk_sua_chave_aqui'
}
response = requests.get(
    '[SUA_URL_DO_SUPABASE]/functions/v1/produtos-list',
    headers=headers
)
produtos = response.json()

# Registrar venda
payload = {
    'produtos': [
        {
            'id_produto': 'f68f2d...',
            'quantidade': 2
        }
    ]
}
response = requests.post(
    '[SUA_URL_DO_SUPABASE]/functions/v1/produtos-estoque',
    headers={**headers, 'Content-Type': 'application/json'},
    json=payload
)
resultado = response.json()
```

---

## Suporte

Para dúvidas ou problemas com a API, entre em contato através do dashboard em **API** > **Documentação**.
