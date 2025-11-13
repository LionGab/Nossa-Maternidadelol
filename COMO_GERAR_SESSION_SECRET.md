# 🔐 Como Gerar o SESSION_SECRET

O `SESSION_SECRET` é uma chave secreta usada para criptografar as sessões dos usuários. É **extremamente importante** para a segurança da aplicação.

## 📋 Métodos para Gerar

### Método 1: Terminal Linux/Mac (Recomendado)

Abra o terminal e execute:

```bash
openssl rand -base64 32
```

**Exemplo de saída:**
```
QseG9ltzu1rfvtjZ/xuz0Yelzgj1z3hoX4rq8xsidqg=
```

### Método 2: Terminal Windows (PowerShell)

Abra o PowerShell e execute:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Método 3: Node.js

Crie um arquivo `generate-secret.js`:

```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('base64'));
```

Execute:
```bash
node generate-secret.js
```

### Método 4: Online (Apenas para Desenvolvimento)

⚠️ **NÃO recomendado para produção!**

Visite: https://generate-secret.vercel.app/32

## 🚀 Como Usar

### 1. Desenvolvimento Local

Copie o `.env.example` para `.env`:

```bash
cp .env.example .env
```

Gere uma secret e substitua no arquivo `.env`:

```env
SESSION_SECRET=sua_secret_gerada_aqui
```

### 2. Deploy em Produção

Configure diretamente na plataforma:

#### Vercel
1. Acesse: Settings → Environment Variables
2. Nome: `SESSION_SECRET`
3. Valor: Cole a secret gerada
4. Environments: Production, Preview, Development

#### Railway
1. Acesse a aba "Variables"
2. Adicione: `SESSION_SECRET` = sua_secret_gerada

#### Render
1. Acesse "Environment" na configuração do serviço
2. Adicione: `SESSION_SECRET` = sua_secret_gerada

## ⚠️ Segurança Importante

- ✅ Use uma secret **diferente** para cada ambiente (dev, staging, prod)
- ✅ Nunca compartilhe a secret em comentários públicos
- ✅ Nunca commite a secret no Git
- ✅ Gere uma nova secret se houver suspeita de vazamento
- ✅ Mínimo de 32 caracteres (256 bits)

## 🔄 Trocar a Secret em Produção

Se precisar trocar a secret:

1. Gere uma nova secret
2. Atualize na plataforma de deploy
3. Faça o redeploy
4. ⚠️ **Todos os usuários serão deslogados** (comportamento esperado)

## 📝 Exemplo Completo

```bash
# 1. Gerar secret
openssl rand -base64 32

# 2. Copiar a saída (exemplo)
# QseG9ltzu1rfvtjZ/xuz0Yelzgj1z3hoX4rq8xsidqg=

# 3. Adicionar no .env
echo "SESSION_SECRET=QseG9ltzu1rfvtjZ/xuz0Yelzgj1z3hoX4rq8xsidqg=" >> .env

# 4. Verificar
cat .env | grep SESSION_SECRET
```

## ❓ FAQ

**P: O que acontece se eu não definir o SESSION_SECRET?**  
R: O servidor não iniciará em produção. Retornará erro de validação.

**P: Posso usar a mesma secret do exemplo?**  
R: ❌ **NÃO!** Gere sempre uma secret única para cada projeto.

**P: Preciso gerar novamente se reiniciar o servidor?**  
R: Não, a secret fica salva no `.env` ou nas variáveis de ambiente.

**P: A secret precisa ser longa?**  
R: Sim, mínimo 32 caracteres. Quanto mais longa, mais segura.

---

**🌸 Nossa Maternidade** - https://www.nossamaternidade.com.br/
