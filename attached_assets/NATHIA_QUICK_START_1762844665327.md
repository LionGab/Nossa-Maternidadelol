# NAT-IA - Quick Start Guide

Guia rápido para começar a usar NAT-IA no React Native.

## Pré-requisitos

- Node.js >= 18
- React Native >= 0.72
- Supabase project configurado
- Edge Functions deployadas

## 1. Instalação

Todas as dependências já estão instaladas no projeto. Caso precise reinstalar:

```bash
npm install axios @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/stack
```

## 2. Configuração

### 2.1 Variáveis de Ambiente

Crie/edite `.env`:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# NAT-IA (opcional)
EXPO_PUBLIC_NATHIA_TIMEOUT=5000
EXPO_PUBLIC_NATHIA_MAX_RETRIES=2
```

### 2.2 Configurar Navegação

**Arquivo:** `src/navigation/index.tsx`

```typescript
import NathiaChat from '@/screens/NathiaChat';
import NathiaOnboarding from '@/screens/NathiaOnboarding';

// Adicionar no Stack.Navigator
<Stack.Screen
  name="NathiaOnboarding"
  component={NathiaOnboarding}
/>
<Stack.Screen
  name="NathiaChat"
  component={NathiaChat}
/>
```

### 2.3 Adicionar Context Provider

**Arquivo:** `App.tsx`

```typescript
import { NathiaProvider } from '@/contexts/NathiaContext';
import { useAuth } from '@/contexts/AuthContext'; // Seu auth context

function App() {
  const { user } = useAuth();

  return (
    <NathiaProvider userId={user?.id || ''}>
      <NavigationContainer>
        {/* Suas rotas */}
      </NavigationContainer>
    </NathiaProvider>
  );
}
```

## 3. Uso Básico

### 3.1 Chat Screen

```typescript
import NathiaChat from '@/screens/NathiaChat';

// Já está pronta para uso!
// Navegue para ela:
navigation.navigate('NathiaChat');
```

### 3.2 Hook useNathia

```typescript
import { useNathia } from '@/hooks/useNathia';
import { useNathiaContext } from '@/contexts/NathiaContext';

function MyComponent() {
  const { context } = useNathiaContext();
  const { sendMessage, messages, loading } = useNathia(context);

  const handleSend = async () => {
    await sendMessage("Olá, NAT-IA!");
  };

  return (
    <View>
      {messages.map((msg) => (
        <Text key={msg.id}>{msg.content}</Text>
      ))}
      <Button onPress={handleSend} disabled={loading}>
        Enviar
      </Button>
    </View>
  );
}
```

### 3.3 Processar Actions

```typescript
import { useNathiaActions } from '@/hooks/useNathiaActions';

function MyComponent() {
  const { processAction, isProcessing } = useNathiaActions();

  const handleAction = async (action) => {
    await processAction(action);
  };

  return (
    <Button onPress={() => handleAction(someAction)} disabled={isProcessing}>
      Executar Ação
    </Button>
  );
}
```

## 4. Configurar Edge Functions

### 4.1 Deploy nathia-chat

```bash
cd supabase/functions
supabase functions deploy nathia-chat
```

**Arquivo:** `supabase/functions/nathia-chat/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { message, userId, context } = await req.json();

  // Seu código de integração com Claude
  const response = await callClaude(message, context);

  return new Response(
    JSON.stringify({
      response: response.text,
      actions: response.actions,
      suggestedReplies: response.suggestions,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### 4.2 Deploy nathia-onboarding

```bash
supabase functions deploy nathia-onboarding
```

### 4.3 Deploy nathia-recommendations

```bash
supabase functions deploy nathia-recommendations
```

## 5. Configurar Database

### 5.1 Tabelas Necessárias

Execute as migrations:

```sql
-- user_profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  type TEXT, -- 'gestante' | 'mae' | 'tentante' | 'puerperio'
  pregnancy_week INTEGER,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- chat_messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  message TEXT,
  response TEXT,
  context_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 6. Testar

### 6.1 Teste Manual

```bash
# Inicie o app
npm run dev

# No simulador:
1. Abra o app
2. Navegue para NathiaChat
3. Digite "Olá"
4. Verifique resposta
```

### 6.2 Testes Automatizados

```bash
# Rodar todos os testes NAT-IA
npm test tests/nathia/

# Rodar teste específico
npm test tests/nathia/ChatMessage.test.tsx

# Com coverage
npm test -- --coverage
```

### 6.3 Testar Edge Function

```bash
# Teste local
curl -X POST http://localhost:54321/functions/v1/nathia-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá",
    "userId": "test-user",
    "context": {}
  }'

# Teste produção
curl -X POST https://seu-projeto.supabase.co/functions/v1/nathia-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá",
    "userId": "test-user",
    "context": {}
  }'
```

## 7. Fluxo Completo

### Onboarding → Chat

```typescript
// 1. Usuário abre app
// 2. Verifica se completou onboarding
const { context } = useNathiaContext();

if (!context?.onboardingCompleted) {
  // Mostra onboarding
  navigation.navigate('NathiaOnboarding');
} else {
  // Mostra chat
  navigation.navigate('NathiaChat');
}

// 3. No NathiaOnboarding:
<OnboardingFlow
  userId={context.userId}
  onComplete={async (response) => {
    await completeOnboarding();
    navigation.navigate('NathiaChat');
  }}
/>
```

## 8. Customização

### Mudar Cores

**Arquivo:** `src/theme/themes/v1-nossa-maternidade.ts`

```typescript
export const nossaMaternidadeDesignTokens = {
  palette: {
    primary: '#6DA9E4', // ← Mude aqui
    accent: '#FF8BA3',
    // ...
  },
  // ...
};
```

### Adicionar Sugestões Customizadas

**Arquivo:** `src/components/nathia/QuickReplies.tsx`

```typescript
export function getContextualSuggestions(context) {
  // Adicione suas sugestões aqui
  if (context.stage === 'gestante') {
    return [
      'Minha sugestão custom',
      'Outra sugestão',
      // ...
    ];
  }
  // ...
}
```

### Customizar Actions

**Arquivo:** `src/hooks/useNathiaActions.ts`

```typescript
const handleOpenScreen = async (action) => {
  // Adicione seus screens aqui
  const screenMap = {
    dailyPlan: 'DailyPlan',
    myCustomScreen: 'MyCustomScreen', // ← Adicione aqui
    // ...
  };
  // ...
};
```

## 9. Deploy

### 9.1 Build Android

```bash
# Debug
npm run android

# Release
cd android
./gradlew assembleRelease

# APK em: android/app/build/outputs/apk/release/
```

### 9.2 Build iOS

```bash
# Debug
npm run ios

# Release (Xcode)
1. Abra ios/NossaMaternidade.xcworkspace
2. Product > Archive
3. Distribute App
```

### 9.3 Deploy Edge Functions

```bash
# Deploy todas
supabase functions deploy

# Deploy específica
supabase functions deploy nathia-chat
```

## 10. Troubleshooting

### Erro: "Supabase não configurado"

**Solução:** Verifique `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Erro: "NAT-IA não responde"

**Solução:**

1. Verifique se Edge Functions estão deployadas
2. Teste com curl (ver seção 6.3)
3. Verifique logs: `supabase functions logs nathia-chat`

### Erro: "Histórico não carrega"

**Solução:**

1. Verifique tabelas: `psql > \dt`
2. Verifique RLS policies
3. Verifique userId está correto

### App trava ao enviar mensagem

**Solução:**

1. Verifique timeout não é muito baixo
2. Verifique network inspector
3. Adicione error boundary

## 11. Próximos Passos

✅ Setup básico completo!

Agora você pode:

- [ ] Customizar design
- [ ] Adicionar analytics
- [ ] Implementar push notifications
- [ ] Adicionar voice input
- [ ] Implementar modo offline

## 12. Recursos

- [Guia Completo](./NATHIA_INTEGRATION_GUIDE.md)
- [README Componentes](../src/components/nathia/README.md)
- [Design System v1](./DESIGN_SYSTEM_V1.md)
- [Supabase Docs](https://supabase.com/docs)

## 13. Suporte

Precisa de ajuda?

- Slack: #nathia-dev
- Email: dev@nossamaternidade.com
- Issues: GitHub repository
