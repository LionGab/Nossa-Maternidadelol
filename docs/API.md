# API Documentation

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://nossa-maternidade.vercel.app/api`

## Authentication

Todos os endpoints protegidos requerem autenticação via Supabase JWT token no header:

```
Authorization: Bearer <token>
```

## Endpoints

### Content

#### GET `/api/daily-featured`
Retorna conteúdo em destaque do dia.

**Response:**
```json
{
  "tip": { "id": "...", "title": "...", "content": "..." },
  "post": { "id": "...", "title": "...", "content": "..." },
  "quote": "..."
}
```

#### GET `/api/posts`
Lista posts com paginação.

**Query Params:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `category` (string, optional)

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Habits

#### GET `/api/habits`
Lista hábitos do usuário com stats.

**Auth:** Required

**Response:**
```json
[
  {
    "id": "...",
    "title": "...",
    "emoji": "✅",
    "color": "#000",
    "completedToday": true,
    "streak": 5
  }
]
```

#### POST `/api/habits`
Cria novo hábito.

**Auth:** Required

**Body:**
```json
{
  "title": "Beber água",
  "emoji": "💧",
  "color": "#3b82f6"
}
```

#### POST `/api/habits/:habitId/complete`
Marca hábito como completo hoje.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "stats": {
    "xp": 50,
    "level": 1,
    "currentStreak": 3
  }
}
```

### AI

#### POST `/api/agents/:agentType/chat`
Envia mensagem para agente AI.

**Auth:** Required  
**Rate Limit:** 10 req/min

**Body:**
```json
{
  "sessionId": "session-123",
  "message": "Como posso melhorar minha rotina?"
}
```

**Agent Types:** `general`, `habits`, `content`, `community`

#### POST `/api/mae-valente/search`
Busca conhecimento com Perplexity AI.

**Rate Limit:** 5 req/min

**Body:**
```json
{
  "question": "Como lidar com ansiedade na gravidez?"
}
```

**Response:**
```json
{
  "question": "...",
  "answer": "...",
  "sources": [
    { "title": "...", "url": "..." }
  ]
}
```

### Community

#### GET `/api/community/posts`
Lista posts da comunidade.

**Query Params:**
- `page`, `limit` (pagination)
- `type` (string, optional)
- `tag` (string, optional)
- `featured` (boolean, optional)

#### POST `/api/community/posts`
Cria novo post.

**Auth:** Required

**Body:**
```json
{
  "type": "question",
  "content": "...",
  "tag": "wellness"
}
```

#### POST `/api/community/posts/:postId/comments`
Adiciona comentário.

**Auth:** Required

**Body:**
```json
{
  "content": "..."
}
```

## Error Responses

```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
```

**Status Codes:**
- `400` - Bad Request (validação)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limits

- **AI Chat**: 10 requests/minuto
- **AI Search**: 5 requests/minuto
- **Auth**: 5 tentativas/15 minutos
- **General API**: 100 requests/15 minutos
