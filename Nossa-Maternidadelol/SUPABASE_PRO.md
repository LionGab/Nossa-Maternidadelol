# Otimizações para Supabase Pro

Este projeto está otimizado para aproveitar os recursos do Supabase Pro:

## Recursos Utilizados

### 1. CDN Automático
- Todas as imagens são servidas via CDN global do Supabase
- Otimização automática de imagens (WebP quando suportado)
- Cache distribuído para melhor performance

### 2. Storage Otimizado
- Upload direto para storage com retry automático
- Compressão de imagens antes do upload (70-80% de redução)
- Cleanup automático de arquivos órfãos

### 3. Configurações do Cliente
- `persistSession: false` - Não mantém sessões no servidor (usa service key)
- Otimizado para operações server-side

### 4. Limites do Pro
- Paginação de até 1000 arquivos por requisição
- Sem limites de rate limiting no storage
- Transformações de imagem via CDN

## Como Usar Transformações de Imagem

O Supabase Pro permite transformações de imagem via query params na URL:

```
https://[project].supabase.co/storage/v1/object/public/files/path/to/image.jpg?width=800&height=600&resize=cover&format=webp
```

Parâmetros disponíveis:
- `width` - Largura da imagem
- `height` - Altura da imagem
- `resize` - Modo de redimensionamento (cover, contain, fill)
- `format` - Formato de saída (webp, jpeg, png)
- `quality` - Qualidade (1-100)

## Variáveis de Ambiente

Certifique-se de ter configurado:
```env
SUPABASE_URL=https://[seu-projeto].supabase.co
SUPABASE_SERVICE_KEY=[sua-service-key]
```

A service key é necessária para operações server-side com privilégios completos.

